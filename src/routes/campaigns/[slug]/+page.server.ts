import type { PageServerLoad } from './$types.js';
import { getCampaignArticle } from '$lib/server/content/loader.js';

export const load: PageServerLoad = ({ params }) => {
	const campaign = getCampaignArticle(params.slug);

	return {
		campaign
	};
};
