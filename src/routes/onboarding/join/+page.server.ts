import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { createHeroQuestion } from '$lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '$lib/fixtures/commitmentQuestion.js';
import { insertQuestion, recordUserResponse } from '$lib/server/qa/repository.js';
import { getOrCreateAnonId } from '$lib/server/qa/auth-claiming.js';

export const load: PageServerLoad = async ({ locals, url, cookies, platform }) => {
	const answer = (url.searchParams.get('answer') === 'yes' ? 'yes' : 'no') as 'no' | 'yes';

	if (locals.user) {
		redirect(302, `/results?answer=${answer}`);
	}

	const anonId = getOrCreateAnonId(cookies);

	if (platform?.env?.DB) {
		const db = getDb(platform.env);
		const hero = await createHeroQuestion();
		await insertQuestion(db, hero);

		const heroChoiceId = answer === 'no' ? hero.ans.choices[0].id : hero.ans.choices[1].id;
		await recordUserResponse(db, {
			questionId: hero.id,
			contentSha256: hero.contentSha256,
			userId: null,
			anonId,
			selectedChoiceIds: [heroChoiceId]
		});

		// If levels were passed in query params for agree/no stance, stage them as well
		const levelsParam = url.searchParams.get('levels');
		if (answer === 'no' && levelsParam) {
			const commitmentQ = await createCommitmentQuestion();
			await insertQuestion(db, commitmentQ);

			const selectedLevels = levelsParam.split(',');
			const selectedChoiceIds = commitmentQ.ans.choices
				.filter((c) => selectedLevels.includes(c.value))
				.map((c) => c.id);

			if (selectedChoiceIds.length > 0) {
				await recordUserResponse(db, {
					questionId: commitmentQ.id,
					contentSha256: commitmentQ.contentSha256,
					userId: null,
					anonId,
					selectedChoiceIds
				});
			}
		}
	}

	return {
		answer,
		turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? ''
	};
};
