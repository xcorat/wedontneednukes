// Markdown rendering for wiki articles.
//
// Goals:
// - Use marked (the chosen lib; see .ai/prompts/wiki.md "Rendering Approach").
// - Strip raw HTML so editors can write Markdown only — no <script>, no inline styles, etc.
// - No DOM dependencies (this runs on Cloudflare Workers).

import { Marked } from 'marked';

const renderer = new Marked({
	gfm: true,
	breaks: false,
	pedantic: false
});

const SAFE_PROTOCOLS = /^(?:https?:\/\/|\/|#|mailto:)/i;

function isSafeUrl(url: string): boolean {
	const trimmed = url.trim();
	// Disallow control characters and whitespace tricks
	if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
		return false;
	}
	return SAFE_PROTOCOLS.test(trimmed);
}

renderer.use({
	renderer: {
		// Drop any literal HTML token from author-supplied markdown.
		html() {
			return '';
		},
		// Sanitize link URLs to block javascript: and other dangerous schemes.
		link(token) {
			const text = this.parser.parseInline(token.tokens);
			if (!isSafeUrl(token.href)) {
				return text;
			}
			const titleAttr = token.title ? ` title="${token.title}"` : '';
			return `<a href="${token.href}"${titleAttr}>${text}</a>`;
		},
		// Sanitize image URLs
		image(token) {
			if (!isSafeUrl(token.href)) {
				return '';
			}
			const titleAttr = token.title ? ` title="${token.title}"` : '';
			return `<img src="${token.href}" alt="${token.text}"${titleAttr}>`;
		}
	}
});

export function renderMarkdown(body: string): string {
	return renderer.parse(body) as string;
}

