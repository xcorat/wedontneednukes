import type { PageServerLoad } from './$types.js';
import { createHeroQuestion, heroViewModel } from '$lib/fixtures/heroQuestion.js';

export const load: PageServerLoad = async () => {
	const hero = await createHeroQuestion();
	const vm = heroViewModel(hero);

	return {
		viewModel: vm
	};
};
