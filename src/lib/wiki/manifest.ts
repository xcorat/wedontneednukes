// src/lib/wiki/manifest.ts
//
// Loads /wiki/manifest.json. The manifest is public (it's a static asset
// served from /wiki/manifest.json), so this module is not server-only and
// can be imported from universal `+page.ts` files.
//
// Throws a SvelteKit error on failure so callers don't need to handle it.

import { error } from '@sveltejs/kit';
import type { WikiManifest } from '$lib/types/wiki.js';

export async function loadWikiManifest(fetch: typeof globalThis.fetch): Promise<WikiManifest> {
	const res = await fetch('/wiki/manifest.json');
	if (!res.ok) {
		throw error(500, `Wiki manifest missing (${res.status})`);
	}
	return (await res.json()) as WikiManifest;
}
