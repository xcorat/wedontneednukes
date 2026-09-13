// src/lib/server/wiki/loader.ts
//
// Loads and parses a single wiki article. Validates slug against the
// manifest (so an attacker can't request arbitrary paths) before fetching
// the markdown file. Server-only because it's only used in
// +page.server.ts — and the manifest import from src/lib/wiki/ stays
// browser-safe because manifest.ts has no Node imports.

import { error } from '@sveltejs/kit';
import { parseFrontmatter } from '$lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '$lib/utils/wiki-render.js';
import type { WikiArticle, WikiManifest } from '$lib/types/wiki.js';

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export async function loadWikiArticle(
	slug: string,
	fetch: typeof globalThis.fetch,
	manifest: WikiManifest
): Promise<WikiArticle> {
	if (!SLUG_RE.test(slug)) {
		throw error(404, 'Article not found');
	}
	if (!manifest.entries.some((e) => e.slug === slug)) {
		throw error(404, 'Article not found');
	}

	const res = await fetch(`/wiki/faq/${slug}.md`);
	if (res.status === 404) {
		throw error(404, 'Article not found');
	}
	if (!res.ok) {
		throw error(500, `Failed to load article (${res.status})`);
	}

	const text = await res.text();
	const { frontmatter, body } = parseFrontmatter(text);
	const html = renderMarkdown(body);

	return {
		slug,
		title: (frontmatter.title as string | undefined) ?? slug,
		category: (frontmatter.category as string | undefined) ?? 'Uncategorised',
		order: typeof frontmatter.order === 'number' ? frontmatter.order : 0,
		summary: (frontmatter.summary as string | undefined) ?? '',
		related: Array.isArray(frontmatter.related)
			? (frontmatter.related as unknown[]).filter((v): v is string => typeof v === 'string')
			: [],
		html,
		updatedAt: typeof frontmatter.updatedAt === 'string' ? frontmatter.updatedAt : undefined
	};
}
