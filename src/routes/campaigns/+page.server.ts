import type { PageServerLoad } from './$types.js';
import { getCampaignsContent } from '$lib/server/content/loader.js';

export const load: PageServerLoad = () => {
	const content = getCampaignsContent();

	return {
		title: content.title,
		summary: content.summary,
		updatedAt: content.updatedAt,
		html: content.html
	};
};
