import type { LayoutServerLoad } from './$types.js';
import { loadWikiManifest } from '$lib/wiki/manifest.js';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const manifest = await loadWikiManifest(fetch);

	// Group entries by category, preserving the manifest's sort order
	// (entry-list is already sorted by category then order).
	const groups: Array<{ category: string; entries: typeof manifest.entries }> = [];
	for (const e of manifest.entries) {
		const last = groups[groups.length - 1];
		if (last && last.category === e.category) {
			last.entries.push(e);
		} else {
			groups.push({ category: e.category, entries: [e] });
		}
	}

	return {
		groups,
		generatedAt: manifest.generatedAt,
		manifest
	};
};
