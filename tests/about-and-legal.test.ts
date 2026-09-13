import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadLegalDocument } from '../src/lib/server/legal/loader.js';
import { parseFrontmatter } from '../src/lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '../src/lib/utils/wiki-render.js';

const ROOT = process.cwd();

describe('About page content & loader', () => {
	it('loads static/about.md and parses frontmatter with clean html', () => {
		const raw = readFileSync(join(ROOT, 'static', 'about.md'), 'utf-8');
		const { frontmatter, body } = parseFrontmatter(raw);

		assert.equal(typeof frontmatter.title, 'string');
		assert.ok((frontmatter.title as string).length > 0);
		assert.equal(typeof frontmatter.summary, 'string');
		assert.ok(body.length > 50);

		const html = renderMarkdown(body);
		assert.match(html, /<h2>What We Do<\/h2>/);
		assert.match(html, /<h2>How It Works<\/h2>/);
		assert.match(html, /<h2>Privacy &amp; Open Source<\/h2>/);
	});
});

describe('Legal documents loader', () => {
	// Mock fetch that resolves files from static/
	const mockFetch = (async (input: RequestInfo | URL) => {
		const url = String(input);
		if (url.startsWith('/legal/')) {
			const filename = url.replace('/legal/', '');
			try {
				const content = readFileSync(join(ROOT, 'static', 'legal', filename), 'utf-8');
				return new Response(content, { status: 200 });
			} catch {
				return new Response('Not Found', { status: 404 });
			}
		}
		return new Response('Not Found', { status: 404 });
	}) as typeof globalThis.fetch;

	it('loads and renders terms of service', async () => {
		const doc = await loadLegalDocument('terms', mockFetch);
		assert.equal(doc.slug, 'terms');
		assert.equal(doc.title, 'Terms of Service');
		assert.match(doc.html, /<h2>1\. Acceptance of Terms<\/h2>/);
		assert.match(doc.html, /<h2>3\. Account Registration and OAuth Authentication<\/h2>/);
	});

	it('loads and renders privacy policy', async () => {
		const doc = await loadLegalDocument('privacy', mockFetch);
		assert.equal(doc.slug, 'privacy');
		assert.equal(doc.title, 'Privacy Policy');
		assert.match(doc.html, /<h2>1\. Our Privacy Commitment<\/h2>/);
		assert.match(doc.html, /<h3>B\. Authenticated Accounts &amp; Third-Party OAuth<\/h3>/);
	});

	it('rejects disallowed or malicious slugs with 404', async () => {
		await assert.rejects(
			async () => {
				await loadLegalDocument('malicious-slug', mockFetch);
			},
			(err: unknown) => {
				return err !== null && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
			}
		);

		await assert.rejects(
			async () => {
				await loadLegalDocument('../secret', mockFetch);
			},
			(err: unknown) => {
				return err !== null && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
			}
		);
	});
});
