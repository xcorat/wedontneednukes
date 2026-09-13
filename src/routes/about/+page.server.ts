import type { PageServerLoad } from './$types.js';
import { getAboutContent } from '$lib/server/content/loader.js';

export const load: PageServerLoad = () => {
	const content = getAboutContent();

	return {
		title: content.title,
		summary: content.summary,
		updatedAt: content.updatedAt,
		html: content.html
	};
};
