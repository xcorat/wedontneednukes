import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { createHeroQuestion } from '$lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '$lib/fixtures/commitmentQuestion.js';
import {
	insertQuestion,
	recordUserResponse,
	getUserResponse
} from '$lib/server/qa/repository.js';
import { getOrCreateAnonId } from '$lib/server/qa/auth-claiming.js';

type CommitmentLevel = 'passive' | 'active' | 'direct';
const VALID_LEVELS: CommitmentLevel[] = ['passive', 'active', 'direct'];

export const load: PageServerLoad = async ({ locals, url, cookies, platform }) => {
	const answer = (url.searchParams.get('answer') === 'yes' ? 'yes' : 'no') as 'no' | 'yes';
	const isAnonParam = url.searchParams.get('anon') === '1';

	let anonId = cookies.get('anon_id');
	const userId = locals.user?.id;

	if (!userId && !anonId && !isAnonParam) {
		redirect(302, `/onboarding/join?answer=${answer}`);
	}

	if (!userId && !anonId) {
		anonId = getOrCreateAnonId(cookies);
	}

	let existingName = locals.user?.name ?? '';
	let existingFeedback = '';
	let existingCommitmentLevels: CommitmentLevel[] = ['passive'];

	if (platform?.env?.DB) {
		const db = getDb(platform.env);
		const hero = await createHeroQuestion();
		const commitmentQ = await createCommitmentQuestion();

		await insertQuestion(db, hero);
		await insertQuestion(db, commitmentQ);

		const heroChoiceId = answer === 'no' ? hero.ans.choices[0].id : hero.ans.choices[1].id;
		await recordUserResponse(db, {
			questionId: hero.id,
			contentSha256: hero.contentSha256,
			userId: userId ?? null,
			anonId: anonId ?? null,
			selectedChoiceIds: [heroChoiceId]
		});

		const existingResp = await getUserResponse(db, {
			questionId: commitmentQ.id,
			userId,
			anonId
		});

		if (existingResp) {
			const choiceIds = (existingResp.selectedChoiceIds as string[]) ?? [];
			const matchedLevels = commitmentQ.ans.choices
				.filter((c) => choiceIds.includes(c.id))
				.map((c) => c.value as CommitmentLevel);

			if (matchedLevels.length > 0) {
				existingCommitmentLevels = matchedLevels;
			}

			const payload = (existingResp.payloadJson as any) ?? {};
			if (payload.name) existingName = payload.name;
			if (payload.feedback) existingFeedback = payload.feedback;
		}
	}

	return {
		answer,
		commitmentLevels: existingCommitmentLevels,
		name: existingName,
		feedback: existingFeedback,
		isAnon: !userId
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url, cookies, platform }) => {
		const answer = (url.searchParams.get('answer') === 'yes' ? 'yes' : 'no') as 'no' | 'yes';
		const formData = await request.formData();

		const rawCommitments = formData.getAll('commitmentLevels').map(String);
		const commitmentLevels = rawCommitments.filter((lvl): lvl is CommitmentLevel =>
			VALID_LEVELS.includes(lvl as CommitmentLevel)
		);

		const finalCommitmentLevels: CommitmentLevel[] =
			commitmentLevels.length > 0 ? commitmentLevels : ['passive'];

		const name = formData.get('name')?.toString().trim() ?? '';
		const feedback = formData.get('feedback')?.toString().trim() ?? '';

		const userId = locals.user?.id;
		let anonId = cookies.get('anon_id');
		if (!userId && !anonId) {
			anonId = getOrCreateAnonId(cookies);
		}

		if (platform?.env?.DB) {
			const db = getDb(platform.env);
			const hero = await createHeroQuestion();
			const commitmentQ = await createCommitmentQuestion();

			await insertQuestion(db, hero);
			await insertQuestion(db, commitmentQ);

			const selectedChoiceIds = commitmentQ.ans.choices
				.filter((c) => finalCommitmentLevels.includes(c.value as CommitmentLevel))
				.map((c) => c.id);

			await recordUserResponse(db, {
				questionId: commitmentQ.id,
				contentSha256: commitmentQ.contentSha256,
				userId: userId ?? null,
				anonId: anonId ?? null,
				selectedChoiceIds,
				payload: { name, feedback }
			});

			if (userId && name) {
				await db
					.update(user)
					.set({ name, updatedAt: new Date() })
					.where(eq(user.id, userId));
			}
		}

		if (userId) {
			redirect(303, '/dashboard');
		} else {
			redirect(303, `/results?answer=${answer}&anon=1`);
		}
	}
};
