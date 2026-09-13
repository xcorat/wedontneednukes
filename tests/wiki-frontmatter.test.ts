import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../src/lib/utils/wiki-frontmatter.js';

describe('Wiki frontmatter parser', () => {
	it('parses scalar key:value pairs', () => {
		const input = `---
title: Why pledge?
category: Premise
order: 2
summary: One sentence.
---

Body goes here.`;
		const { frontmatter, body } = parseFrontmatter(input);
		assert.equal(frontmatter.title, 'Why pledge?');
		assert.equal(frontmatter.category, 'Premise');
		assert.equal(frontmatter.order, 2);
		assert.equal(frontmatter.summary, 'One sentence.');
		assert.equal(body, 'Body goes here.');
	});

	it('parses list under a key', () => {
		const input = `---
related:
  - alpha
  - beta
  - gamma
---

Body`;
		const { frontmatter } = parseFrontmatter(input);
		assert.deepEqual(frontmatter.related, ['alpha', 'beta', 'gamma']);
	});

	it('unquotes quoted values', () => {
		const input = `---
title: "Quoted \"title\""
---
Body`;
		const { frontmatter } = parseFrontmatter(input);
		assert.equal(frontmatter.title, 'Quoted "title"');
	});

	it('returns empty frontmatter when no fence is present', () => {
		const input = 'Just a body.';
		const { frontmatter, body } = parseFrontmatter(input);
		assert.deepEqual(frontmatter, {});
		assert.equal(body, 'Just a body.');
	});

	it('coerces numeric strings to numbers', () => {
		const input = `---
order: 7
---
Body`;
		const { frontmatter } = parseFrontmatter(input);
		assert.equal(frontmatter.order, 7);
		assert.equal(typeof frontmatter.order, 'number');
	});

	it('handles CRLF line endings', () => {
		const input = '---\r\ntitle: X\r\n---\r\nBody';
		const { frontmatter, body } = parseFrontmatter(input);
		assert.equal(frontmatter.title, 'X');
		assert.equal(body, 'Body');
	});
});
