import type { PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { parseFrontmatter } from '$lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '$lib/utils/wiki-render.js';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('/about.md');
	if (!res.ok) {
		throw error(res.status === 404 ? 404 : 500, 'About page content not found');
	}

	const text = await res.text();
	const { frontmatter, body } = parseFrontmatter(text);
	const html = renderMarkdown(body);

	return {
		title: (frontmatter.title as string | undefined) ?? "About We Don't Need Nukes",
		summary: (frontmatter.summary as string | undefined) ?? '',
		updatedAt: typeof frontmatter.updatedAt === 'string' ? frontmatter.updatedAt : undefined,
		html
	};
};
