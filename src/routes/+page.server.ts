import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { createHeroQuestion, heroViewModel } from '$lib/fixtures/heroQuestion.js';
import { getUserResponse, getQuestionStats } from '$lib/server/qa/repository.js';

export const load: PageServerLoad = async ({ locals, cookies, platform }) => {
	// 1. Logged-in user → route directly to dashboard
	if (locals.user) {
		redirect(302, '/dashboard');
	}

	const hero = await createHeroQuestion();
	const vm = heroViewModel(hero);
	const anonId = cookies.get('anon_id');

	let isReturningAnon = false;
	let userChoice: 'no' | 'yes' | null = null;
	let stats = null;

	// 2. Returning anonymous visitor with a recorded vote → show results & claim CTA
	if (anonId && platform?.env?.DB) {
		const db = getDb(platform.env);
		const recordedResp = await getUserResponse(db, {
			questionId: hero.id,
			anonId
		});

		if (recordedResp) {
			isReturningAnon = true;
			const agreeChoiceId = hero.ans.choices[0].id;
			const otherChoiceId = hero.ans.choices[1].id;
			const choiceIds = (recordedResp.selectedChoiceIds as string[]) ?? [];

			if (choiceIds.includes(agreeChoiceId)) {
				userChoice = 'no';
			} else if (choiceIds.includes(otherChoiceId)) {
				userChoice = 'yes';
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
	}

	// 3. Fresh visitor → show onboarding hero
	return {
		viewModel: vm,
		isReturningAnon,
		userChoice: userChoice ?? 'no',
		stats,
		turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? ''
	};
};
