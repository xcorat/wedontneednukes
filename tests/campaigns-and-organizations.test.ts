import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '../src/lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '../src/lib/utils/wiki-render.js';

const ROOT = process.cwd();

describe('Campaigns page content & loader', () => {
	it('loads static/campaigns/index.md and parses frontmatter with clean html', () => {
		const raw = readFileSync(join(ROOT, 'static', 'campaigns', 'index.md'), 'utf-8');
		const { frontmatter, body } = parseFrontmatter(raw);

		assert.equal(typeof frontmatter.title, 'string');
		assert.equal(frontmatter.title, 'External Campaigns & Initiatives');
		assert.equal(typeof frontmatter.summary, 'string');
		assert.ok(body.length > 200);

		const html = renderMarkdown(body);
		// Check key sections
		assert.match(html, /<h2>Featured Global Campaigns<\/h2>/);
		assert.match(html, /<h2>Legislative &amp; Municipal Campaigns<\/h2>/);
		assert.match(html, /<h2>Divestment &amp; Financial Action<\/h2>/);
		assert.match(html, /<h2>University &amp; Campus-Level Campaigns<\/h2>/);

		// Check key campaign links
		assert.match(html, /href="https:\/\/www\.dontbankonthebomb\.com"/);
		assert.match(html, /href="https:\/\/youth4disarmament\.org"/);
		assert.match(html, /href="https:\/\/www\.mayorsforpeace\.org"/);
		assert.match(html, /href="https:\/\/www\.globalzero\.org"/);
		assert.match(html, /href="https:\/\/cities\.icanw\.org"/);
		assert.match(html, /href="https:\/\/pledge\.icanw\.org"/);
		assert.match(html, /href="https:\/\/paxforpeace\.nl"/);
		assert.match(html, /href="https:\/\/isyp\.org"/);
		assert.match(html, /href="\/organizations"/);
	});
});

describe('Organizations page content & loader', () => {
	it('loads static/organizations/index.md and parses frontmatter with clean html', () => {
		const raw = readFileSync(join(ROOT, 'static', 'organizations', 'index.md'), 'utf-8');
		const { frontmatter, body } = parseFrontmatter(raw);

		assert.equal(typeof frontmatter.title, 'string');
		assert.equal(frontmatter.title, 'Disarmament Organizations & Alliances');
		assert.equal(typeof frontmatter.summary, 'string');
		assert.ok(body.length > 200);

		const html = renderMarkdown(body);
		// Check key sections
		assert.match(html, /<h2>Featured Global Coalitions<\/h2>/);
		assert.match(html, /<h2>Survivor Advocacy &amp; Grassroots Mass Movements<\/h2>/);
		assert.match(html, /<h2>Scientific Diplomacy &amp; Policy Think Tanks<\/h2>/);
		assert.match(html, /<h2>Regional Networks &amp; Grassroots Coalitions<\/h2>/);

		// Check key organization links
		assert.match(html, /href="https:\/\/www\.icanw\.org"/);
		assert.match(html, /href="https:\/\/www\.mayorsforpeace\.org"/);
		assert.match(html, /href="https:\/\/www\.ippnw\.org"/);
		assert.match(html, /href="https:\/\/www\.youth4tpnw\.org"/);
		assert.match(html, /href="https:\/\/www\.pnnd\.org"/);
		assert.match(html, /href="https:\/\/peaceboat\.org"/);
		assert.match(html, /href="https:\/\/www\.icrc\.org"/);
		assert.match(html, /href="https:\/\/cnduk\.org"/);
		assert.match(html, /href="https:\/\/www\.abolition2000\.org"/);
		assert.match(html, /href="https:\/\/pugwash\.org"/);
		assert.match(html, /href="https:\/\/www\.nti\.org"/);
		assert.match(html, /href="https:\/\/unidir\.org"/);
		assert.match(html, /href="https:\/\/www\.opanal\.org"/);
		assert.match(html, /href="https:\/\/www\.nuclearfreeplanet\.org"/);
		assert.match(html, /href="\/campaigns"/);
	});
});
