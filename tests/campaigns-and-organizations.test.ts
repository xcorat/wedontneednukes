import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '../src/lib/utils/wiki-frontmatter.js';
import { renderMarkdown } from '../src/lib/utils/wiki-render.js';
import {
	getCampaignsContent,
	getOrganizationsContent,
	getCampaignArticle,
	getOrganizationArticle
} from '../src/lib/server/content/loader.js';

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

		// Check internal and external campaign links
		assert.match(html, /href="\/campaigns\/dont-bank-on-the-bomb"/);
		assert.match(html, /href="https:\/\/www\.dontbankonthebomb\.com"/);
		assert.match(html, /href="\/campaigns\/youth4disarmament"/);
		assert.match(html, /href="https:\/\/youth4disarmament\.org"/);
		assert.match(html, /href="\/campaigns\/global-zero"/);
		assert.match(html, /href="https:\/\/cities\.icanw\.org"/);
		assert.match(html, /href="\/organizations"/);
	});

	it('loads in-memory campaign index via getCampaignsContent', () => {
		const content = getCampaignsContent();
		assert.equal(content.title, 'External Campaigns & Initiatives');
		assert.ok(content.html.length > 100);
	});

	it('loads individual campaign articles via getCampaignArticle', () => {
		const campaign = getCampaignArticle('dont-bank-on-the-bomb');
		assert.equal(campaign.title, 'Don’t Bank on the Bomb');
		assert.equal(campaign.category, 'Divestment Campaign');
		assert.equal(campaign.website, 'https://www.dontbankonthebomb.com');
		assert.match(campaign.html, /Hall of Fame/);

		const youth = getCampaignArticle('youth4disarmament');
		assert.equal(youth.title, '#Youth4Disarmament');
		assert.equal(youth.category, 'Youth Empowerment');
	});

	it('rejects invalid or non-existent campaign slugs with 404', () => {
		assert.throws(
			() => getCampaignArticle('non-existent-campaign'),
			(err: any) => err?.status === 404
		);
		assert.throws(
			() => getCampaignArticle('../secret'),
			(err: any) => err?.status === 404
		);
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

		// Check internal and external organization links
		assert.match(html, /href="\/organizations\/ican"/);
		assert.match(html, /href="https:\/\/www\.icanw\.org"/);
		assert.match(html, /href="\/organizations\/nihon-hidankyo"/);
		assert.match(html, /href="https:\/\/www\.ne\.jp\/asahi\/hidankyo\/nihon\/"/);
		assert.match(html, /href="\/organizations\/cnd"/);
		assert.match(html, /href="\/campaigns"/);
	});

	it('loads in-memory organizations index via getOrganizationsContent', () => {
		const content = getOrganizationsContent();
		assert.equal(content.title, 'Disarmament Organizations & Alliances');
		assert.ok(content.html.length > 100);
	});

	it('loads individual organization articles via getOrganizationArticle', () => {
		const ican = getOrganizationArticle('ican');
		assert.equal(ican.title, 'ICAN (International Campaign to Abolish Nuclear Weapons)');
		assert.equal(ican.category, 'Global Civil Society Coalition');
		assert.equal(ican.website, 'https://www.icanw.org');
		assert.match(ican.html, /Treaty on the Prohibition of Nuclear Weapons/);

		const hidankyo = getOrganizationArticle('nihon-hidankyo');
		assert.equal(hidankyo.title, 'Nihon Hidankyo');
		assert.equal(hidankyo.category, 'Survivor Confederation');
		assert.match(hidankyo.html, /2024 Nobel Peace Prize/);
	});

	it('rejects invalid or non-existent organization slugs with 404', () => {
		assert.throws(
			() => getOrganizationArticle('non-existent-org'),
			(err: any) => err?.status === 404
		);
		assert.throws(
			() => getOrganizationArticle('../secret'),
			(err: any) => err?.status === 404
		);
	});
});
