import { parseFrontmatter } from '$lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '$lib/utils/wiki-render.js';
import { error } from '@sveltejs/kit';

export interface RenderedContent {
	slug: string;
	title: string;
	summary: string;
	category?: string;
	order?: number;
	related?: string[];
	updatedAt?: string;
	html: string;
}

// In Vite builds and dev server, import.meta.glob eagerly inlines all .md files as strings.
// In raw Node.js test environments (tsx), import.meta.glob is not defined, so we provide a safe fallback.
let rawFiles: Record<string, string> = {};

if (typeof import.meta.glob === 'function') {
	rawFiles = import.meta.glob<string>('/static/**/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	});
}

const contentCache = new Map<string, RenderedContent>();

export function getRawFile(filePath: string): string | null {
	const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
	if (rawFiles[normalized]) {
		return rawFiles[normalized];
	}

	// Node.js test environment fallback: read from filesystem if not found in glob
	try {
		const fs = globalThis.process ? (globalThis as any).process.getBuiltinModule?.('node:fs') : null;
		const path = globalThis.process ? (globalThis as any).process.getBuiltinModule?.('node:path') : null;
		if (fs && path) {
			const fullPath = path.join(process.cwd(), normalized.replace(/^\//, ''));
			if (fs.existsSync(fullPath)) {
				const content = fs.readFileSync(fullPath, 'utf-8');
				rawFiles[normalized] = content;
				return content;
			}
		}
	} catch {
		// Fallback fails silently in non-node runtimes
	}

	return null;
}

export function parseAndRender(filePath: string): RenderedContent | null {
	const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
	if (contentCache.has(normalized)) {
		return contentCache.get(normalized)!;
	}

	const raw = getRawFile(normalized);
	if (!raw) return null;

	const { frontmatter, body } = parseFrontmatter(raw);
	const html = renderMarkdown(body);
	const slug = normalized.split('/').pop()?.replace(/\.md$/, '') ?? '';

	const item: RenderedContent = {
		slug,
		title: (frontmatter.title as string | undefined) ?? slug,
		summary: (frontmatter.summary as string | undefined) ?? '',
		category: frontmatter.category as string | undefined,
		order: typeof frontmatter.order === 'number' ? frontmatter.order : undefined,
		related: Array.isArray(frontmatter.related)
			? (frontmatter.related as unknown[]).filter((v): v is string => typeof v === 'string')
			: undefined,
		updatedAt: typeof frontmatter.updatedAt === 'string' ? frontmatter.updatedAt : undefined,
		html
	};

	contentCache.set(normalized, item);
	return item;
}

export function getAboutContent(): RenderedContent {
	const content = parseAndRender('/static/about.md');
	if (!content) {
		throw error(404, 'About content not found');
	}
	return content;
}

export function getLegalDocument(slug: string): RenderedContent {
	if (slug !== 'terms' && slug !== 'privacy') {
		throw error(404, 'Legal document not found');
	}

	const content = parseAndRender(`/static/legal/${slug}.md`);
	if (!content) {
		throw error(404, 'Legal document not found');
	}
	return content;
}

export function getWikiArticleContent(slug: string): RenderedContent {
	const content = parseAndRender(`/static/wiki/faq/${slug}.md`);
	if (!content) {
		throw error(404, 'Article not found');
	}
	return content;
}

export function getCampaignsContent(): RenderedContent {
	const content = parseAndRender('/static/campaigns/index.md');
	if (!content) {
		throw error(404, 'Campaigns content not found');
	}
	return content;
}

export function getOrganizationsContent(): RenderedContent {
	const content = parseAndRender('/static/organizations/index.md');
	if (!content) {
		throw error(404, 'Organizations content not found');
	}
	return content;
}
