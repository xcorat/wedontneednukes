import type { PageServerLoad } from './$types.js';
import { loadWikiManifest } from '$lib/wiki/manifest.js';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	// Re-use the layout's loaded manifest so /wiki does not double-fetch.
	const { groups, generatedAt, manifest } = await parent();
	return { groups, generatedAt, manifest };
};
