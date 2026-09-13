// src/lib/wiki/manifest.ts
//
// Loads /wiki/manifest.json. The manifest is public (it's a static asset
// served from /wiki/manifest.json), so this module is not server-only and
// can be imported from universal `+page.ts` files.
//
// Throws a SvelteKit error on failure so callers don't need to handle it.

import { error } from '@sveltejs/kit';
import type { WikiManifest } from '$lib/types/wiki.js';
import staticManifest from '../../../static/wiki/manifest.json' with { type: 'json' };

export async function loadWikiManifest(fetch?: typeof globalThis.fetch): Promise<WikiManifest> {
	if (staticManifest && Array.isArray((staticManifest as WikiManifest).entries)) {
		return staticManifest as WikiManifest;
	}

	if (fetch) {
		const res = await fetch('/wiki/manifest.json');
		if (res.ok) {
			return (await res.json()) as WikiManifest;
		}
		throw error(500, `Wiki manifest missing (${res.status})`);
	}

	throw error(500, 'Wiki manifest missing');
}
