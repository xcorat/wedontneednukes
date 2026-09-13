import { error } from '@sveltejs/kit';
import { parseFrontmatter } from '$lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '$lib/utils/wiki-render.js';

export interface LegalDocument {
	slug: string;
	title: string;
	summary: string;
	updatedAt?: string;
	html: string;
}

const ALLOWED_SLUGS = new Set(['terms', 'privacy']);

export async function loadLegalDocument(
	slug: string,
	fetch: typeof globalThis.fetch
): Promise<LegalDocument> {
	if (!ALLOWED_SLUGS.has(slug)) {
		throw error(404, 'Legal document not found');
	}

	const res = await fetch(`/legal/${slug}.md`);
	if (!res.ok) {
		throw error(res.status === 404 ? 404 : 500, `Legal document unavailable (${res.status})`);
	}

	const text = await res.text();
	const { frontmatter, body } = parseFrontmatter(text);
	const html = renderMarkdown(body);

	return {
		slug,
		title:
			(frontmatter.title as string | undefined) ??
			(slug === 'terms' ? 'Terms of Service' : 'Privacy Policy'),
		summary: (frontmatter.summary as string | undefined) ?? '',
		updatedAt: typeof frontmatter.updatedAt === 'string' ? frontmatter.updatedAt : undefined,
		html
	};
}
