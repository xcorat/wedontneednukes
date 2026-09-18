import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { createHeroQuestion } from '$lib/fixtures/heroQuestion.js';
import { getUserResponse } from '$lib/server/qa/repository.js';
import { getPublicResultsSummary, listPublicVotesAndPledges, type ResultsSummary, type PublicVoteItem } from '$lib/server/results/index.js';

export const load: PageServerLoad = async ({ locals, platform, cookies }) => {
	const userId = locals.user?.id;
	const anonId = cookies.get('anon_id');

	let userChoice: 'no' | 'yes' | null = null;
	let summary: ResultsSummary = {
		totalVotes: 0,
		agreeCount: 0,
		agreePercentage: 0,
		otherCount: 0,
		otherPercentage: 0,
		validated: {
			totalVotes: 0,
			agreeCount: 0,
			agreePercentage: 0,
			otherCount: 0,
			otherPercentage: 0
		},
		commitments: {
			totalPledges: 0,
			tiers: {
				passive: { label: 'Ally', count: 0, percentage: 0 },
				active: { label: 'Advocate', count: 0, percentage: 0 },
				direct: { label: 'Contributor', count: 0, percentage: 0 }
			}
		}
	};
	let latestVotes: PublicVoteItem[] = [];
	let totalVotesCount = 0;

	if (platform?.env?.DB) {
		const db = getDb(platform.env);
		const hero = await createHeroQuestion();

		const [summaryResult, activityResult, recordedResp] = await Promise.all([
			getPublicResultsSummary(db),
			listPublicVotesAndPledges(db, { limit: 8, filter: 'all' }),
			(userId || anonId)
				? getUserResponse(db, { questionId: hero.id, userId, anonId })
				: Promise.resolve(null)
		]);

		summary = summaryResult;
		latestVotes = activityResult.items;
		totalVotesCount = activityResult.total;

		if (recordedResp) {
			const agreeChoiceId = hero.ans.choices[0].id;
			const otherChoiceId = hero.ans.choices[1].id;
			const choiceIds = (recordedResp.selectedChoiceIds as string[]) ?? [];
			if (choiceIds.includes(agreeChoiceId)) {
				userChoice = 'no';
			} else if (choiceIds.includes(otherChoiceId)) {
				userChoice = 'yes';
			}
		}
	}

	return {
		summary,
		latestVotes,
		totalVotesCount,
		userChoice,
		user: locals.user
	};
};
