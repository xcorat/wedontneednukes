import type { PageServerLoad } from './$types.js';
import { getOrganizationsContent } from '$lib/server/content/loader.js';

export const load: PageServerLoad = () => {
	const content = getOrganizationsContent();

	return {
		title: content.title,
		summary: content.summary,
		updatedAt: content.updatedAt,
		html: content.html
	};
};
