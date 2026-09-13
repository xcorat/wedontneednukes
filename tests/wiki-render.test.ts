import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/lib/utils/wiki-render.js';

describe('Wiki markdown renderer', () => {
	it('renders headings and paragraphs', () => {
		const html = renderMarkdown('## Hello\n\nWorld paragraph.');
		assert.match(html, /<h2>Hello<\/h2>/);
		assert.match(html, /<p>World paragraph\./);
	});

	it('renders unordered lists', () => {
		const html = renderMarkdown('- one\n- two\n');
		assert.match(html, /<ul>/);
		assert.match(html, /<li>one<\/li>/);
		assert.match(html, /<li>two<\/li>/);
	});

	it('renders links', () => {
		const html = renderMarkdown('[Home](/)');
		assert.match(html, /<a href="\/\/">Home<\/a>/);
	});

	it('drops raw HTML in author content', () => {
		const html = renderMarkdown('Hello <script>alert(1)</script>');
		assert.doesNotMatch(html, /<script>/);
		// The pipeline strips the HTML token; surrounding text remains.
		assert.match(html, /Hello/);
	});

	it('escapes inline HTML-like strings inside paragraphs', () => {
		const html = renderMarkdown('Use <div> tags here.');
		// The literal HTML token is dropped, leaving surrounding text and an escaped <div>.
		assert.doesNotMatch(html, /^<p>Use <div>/);
	});
});
