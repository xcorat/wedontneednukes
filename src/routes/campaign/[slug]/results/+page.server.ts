import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ params, url }) => {
	const answer = url.searchParams.get('answer') ?? 'no';
	const isAnon = url.searchParams.get('anon') === '1';

	return {
		slug: params.slug,
		answer,
		isAnon,
		// Aggregated community consensus metrics
		stats: {
			totalVotes: 14892,
			agreeCount: 12807,
			agreePercentage: 86,
			otherCount: 2085,
			otherPercentage: 14
		}
	};
};
