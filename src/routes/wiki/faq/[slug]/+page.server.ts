import type { PageServerLoad } from './$types.js';
import { loadWikiManifest } from '$lib/wiki/manifest.js';
import { loadWikiArticle } from '$lib/server/wiki/loader.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const manifest = await loadWikiManifest(fetch);
	const article = await loadWikiArticle(params.slug, fetch, manifest);

	const relatedEntries = (article.related ?? [])
		.map((slug) => manifest.entries.find((e) => e.slug === slug))
		.filter((e): e is NonNullable<typeof e> => Boolean(e));

	return { article, relatedEntries };
};
