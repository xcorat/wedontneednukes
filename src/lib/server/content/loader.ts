import { parseFrontmatter } from '$lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '$lib/utils/wiki-render.js';
import { error } from '@sveltejs/kit';
import { getMarkdown, listMarkdown } from './catalog.js';

export interface RenderedContent {
	slug: string;
	title: string;
	summary: string;
	category?: string;
	order?: number;
	related?: string[];
	updatedAt?: string;
	website?: string;
	headquarters?: string;
	founded?: string;
	html: string;
}

const contentCache = new Map<string, RenderedContent>();

export function parseAndRender(key: string): RenderedContent | null {
	const normalizedKey = key
		.replace(/^\//, '')
		.replace(/^static\//, '')
		.replace(/^src\/lib\/server\/content\/markdown\//, '')
		.replace(/\.md$/, '');

	if (contentCache.has(normalizedKey)) {
		return contentCache.get(normalizedKey)!;
	}

	const raw = getMarkdown(normalizedKey);
	if (!raw) return null;

	const { frontmatter, body } = parseFrontmatter(raw);
	const html = renderMarkdown(body);
	const slug = normalizedKey.split('/').pop() ?? '';

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
		website: typeof frontmatter.website === 'string' ? frontmatter.website : undefined,
		headquarters: typeof frontmatter.headquarters === 'string' ? frontmatter.headquarters : undefined,
		founded:
			typeof frontmatter.founded === 'string' || typeof frontmatter.founded === 'number'
				? String(frontmatter.founded)
				: undefined,
		html
	};

	contentCache.set(normalizedKey, item);
	return item;
}

export function getAboutContent(): RenderedContent {
	const content = parseAndRender('about');
	if (!content) {
		throw error(404, 'About content not found');
	}
	return content;
}

export function getLegalDocument(slug: string): RenderedContent {
	if (slug !== 'terms' && slug !== 'privacy') {
		throw error(404, 'Legal document not found');
	}

	const content = parseAndRender(`legal/${slug}`);
	if (!content) {
		throw error(404, 'Legal document not found');
	}
	return content;
}

export function getWikiArticleContent(slug: string): RenderedContent {
	const content = parseAndRender(`wiki/faq/${slug}`);
	if (!content) {
		throw error(404, 'Article not found');
	}
	return content;
}

export function getCampaignsContent(): RenderedContent {
	const content = parseAndRender('campaigns/index');
	if (!content) {
		throw error(404, 'Campaigns content not found');
	}
	return content;
}

export function getOrganizationsContent(): RenderedContent {
	const content = parseAndRender('organizations/index');
	if (!content) {
		throw error(404, 'Organizations content not found');
	}
	return content;
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function getCampaignArticle(slug: string): RenderedContent {
	if (!SLUG_RE.test(slug)) {
		throw error(404, 'Campaign not found');
	}
	const content = parseAndRender(`campaigns/${slug}`);
	if (!content) {
		throw error(404, 'Campaign not found');
	}
	return content;
}

export function getOrganizationArticle(slug: string): RenderedContent {
	if (!SLUG_RE.test(slug)) {
		throw error(404, 'Organization not found');
	}
	const content = parseAndRender(`organizations/${slug}`);
	if (!content) {
		throw error(404, 'Organization not found');
	}
	return content;
}

export { listMarkdown };
