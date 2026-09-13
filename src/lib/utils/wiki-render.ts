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

renderer.use({
	renderer: {
		// Drop any literal HTML token from author-supplied markdown.
		html() {
			return '';
		}
	}
});

export function renderMarkdown(body: string): string {
	return renderer.parse(body) as string;
}
