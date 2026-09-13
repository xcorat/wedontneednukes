import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { createHeroQuestion } from '$lib/fixtures/heroQuestion.js';
import {
	insertQuestion,
	recordUserResponse,
	getUserResponse,
	getQuestionStats
} from '$lib/server/qa/repository.js';
import { getOrCreateAnonId } from '$lib/server/qa/auth-claiming.js';

export const load: PageServerLoad = async ({ url, locals, platform, cookies }) => {
	const answerParam = url.searchParams.get('answer'); // 'no' (Agree) or 'yes' (Other)
	const userId = locals.user?.id;
	let anonId = cookies.get('anon_id');

	if (!userId && !anonId) {
		anonId = getOrCreateAnonId(cookies);
	}

	let stats = {
		totalVotes: 0,
		agreeCount: 0,
		agreePercentage: 0,
		otherCount: 0,
		otherPercentage: 0
	};

	let userChoice: 'no' | 'yes' | null = null;

	if (platform?.env?.DB) {
		const db = getDb(platform.env);
		const hero = await createHeroQuestion();

		// Ensure hero question is seeded
		await insertQuestion(db, hero);

		const agreeChoiceId = hero.ans.choices[0].id;
		const otherChoiceId = hero.ans.choices[1].id;

		// If an answer was passed via query parameter, record it
		if (answerParam === 'no' || answerParam === 'yes') {
			const selectedChoiceId = answerParam === 'no' ? agreeChoiceId : otherChoiceId;
			await recordUserResponse(db, {
				questionId: hero.id,
				contentSha256: hero.contentSha256,
				userId: userId ?? null,
				anonId: anonId ?? null,
				selectedChoiceIds: [selectedChoiceId]
			});
		}

		// Retrieve user/anon's recorded response
		const recordedResp = await getUserResponse(db, {
			questionId: hero.id,
			userId,
			anonId
		});

		if (recordedResp) {
			const choiceIds = (recordedResp.selectedChoiceIds as string[]) ?? [];
			if (choiceIds.includes(agreeChoiceId)) {
				userChoice = 'no';
			} else if (choiceIds.includes(otherChoiceId)) {
				userChoice = 'yes';
			}
		}

		// Compute live community consensus numbers
		const statsResult = await getQuestionStats(db, hero.id);
		const agreeCount = statsResult.countsByChoiceId[agreeChoiceId] ?? 0;
		const otherCount = statsResult.countsByChoiceId[otherChoiceId] ?? 0;
		const totalVotes = statsResult.totalResponses;

		const agreePercentage = totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0;
		const otherPercentage = totalVotes > 0 ? 100 - agreePercentage : 0;

		stats = {
			totalVotes,
			agreeCount,
			agreePercentage,
			otherCount,
			otherPercentage
		};
	}

	return {
		answer: userChoice ?? (answerParam === 'yes' ? 'yes' : 'no'),
		stats,
		isAnon: !userId
	};
};
