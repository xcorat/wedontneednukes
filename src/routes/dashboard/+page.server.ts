import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { createHeroQuestion } from '$lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '$lib/fixtures/commitmentQuestion.js';
import { createCivicActionQuestion, civicActionViewModel } from '$lib/fixtures/civicActionQuestion.js';
import {
	getUserResponse,
	getQuestionStats,
	insertQuestion,
	recordUserResponse
} from '$lib/server/qa/repository.js';

export const load: PageServerLoad = async ({ locals, platform }) => {
	// Must be logged in to view dashboard
	if (!locals.user) {
		redirect(302, '/auth?redirect=/dashboard');
	}

	const userId = locals.user.id;
	const hero = await createHeroQuestion();
	const commitmentQ = await createCommitmentQuestion();
	const civicQ = await createCivicActionQuestion();

	let userChoice: 'no' | 'yes' | null = null;
	let commitmentLevels: string[] = ['passive'];
	let stats = {
		totalVotes: 0,
		agreeCount: 0,
		agreePercentage: 0,
		otherCount: 0,
		otherPercentage: 0
	};
	let answeredCivicAction: string | null = null;

	if (platform?.env?.DB) {
		const db = getDb(platform.env);

		// Ensure questions are seeded in DB
		await Promise.all([
			insertQuestion(db, hero),
			insertQuestion(db, commitmentQ),
			insertQuestion(db, civicQ)
		]);

		const [heroResp, commitmentResp, civicResp] = await Promise.all([
			getUserResponse(db, { questionId: hero.id, userId }),
			getUserResponse(db, { questionId: commitmentQ.id, userId }),
			getUserResponse(db, { questionId: civicQ.id, userId })
		]);

		const agreeChoiceId = hero.ans.choices[0].id;
		const otherChoiceId = hero.ans.choices[1].id;

		if (heroResp) {
			const choiceIds = (heroResp.selectedChoiceIds as string[]) ?? [];
			if (choiceIds.includes(agreeChoiceId)) {
				userChoice = 'no';
			} else if (choiceIds.includes(otherChoiceId)) {
				userChoice = 'yes';
			}
		}

		if (commitmentResp) {
			const choiceIds = (commitmentResp.selectedChoiceIds as string[]) ?? [];
			const matched = commitmentQ.ans.choices
				.filter((c) => choiceIds.includes(c.id))
				.map((c) => c.value);
			if (matched.length > 0) {
				commitmentLevels = matched;
			}
		}

		if (civicResp) {
			const choiceIds = (civicResp.selectedChoiceIds as string[]) ?? [];
			const matchedChoice = civicQ.ans.choices.find((c) => choiceIds.includes(c.id));
			if (matchedChoice) {
				answeredCivicAction = matchedChoice.label;
			}
		}

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
		user: locals.user,
		userChoice: userChoice ?? 'no',
		commitmentLevels,
		stats,
		nextQuestion: answeredCivicAction
			? null
			: {
					question: civicQ,
					viewModel: civicActionViewModel(civicQ)
			  },
		answeredCivicAction
	};
};

export const actions: Actions = {
	answerNextQuestion: async ({ request, locals, platform }) => {
		if (!locals.user) {
			redirect(302, '/auth?redirect=/dashboard');
		}

		const formData = await request.formData();
		const choiceId = formData.get('choiceId')?.toString();

		if (!choiceId) {
			return fail(400, { error: 'No choice selected' });
		}

		if (platform?.env?.DB) {
			const db = getDb(platform.env);
			const civicQ = await createCivicActionQuestion();
			await insertQuestion(db, civicQ);

			const validChoice = civicQ.ans.choices.find((c) => c.id === choiceId);
			if (!validChoice) {
				return fail(400, { error: 'Invalid choice' });
			}

			await recordUserResponse(db, {
				questionId: civicQ.id,
				contentSha256: civicQ.contentSha256,
				userId: locals.user.id,
				selectedChoiceIds: [choiceId]
			});
		}

		return { success: true };
	}
};
