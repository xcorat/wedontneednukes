// Tiny frontmatter parser for the wiki's documented `key: value` syntax.
//
// Supported shape (no js-yaml dependency by design):
// ---
// title: A title
// category: Premise
// order: 2
// summary: One sentence.
// related:
//   - slug-a
//   - slug-b
// ---
//
// The dash block is matched non-greedily. Anything after it is the body.

export interface WikiFrontmatter {
	title?: string;
	category?: string;
	order?: number;
	summary?: string;
	related?: string[];
	[key: string]: unknown;
}

export interface ParsedFile {
	frontmatter: WikiFrontmatter;
	body: string;
}

const FENCE = '---';
const FENCE_LINE = /^---\s*$/;

export function parseFrontmatter(input: string): ParsedFile {
	const text = input.replace(/\r\n?/g, '\n');
	const lines = text.split('\n');

	let start = -1;
	let end = -1;
	for (let i = 0; i < lines.length; i++) {
		if (start === -1 && FENCE_LINE.test(lines[i])) {
			start = i;
			continue;
		}
		if (start !== -1 && i > start && FENCE_LINE.test(lines[i])) {
			end = i;
			break;
		}
	}

	if (start === -1 || end === -1) {
		// No frontmatter — treat the whole file as body.
		return { frontmatter: {}, body: text };
	}

	const yamlLines = lines.slice(start + 1, end);
	const body = lines.slice(end + 1).join('\n').replace(/^\n+/, '');
	return { frontmatter: parseYamlLines(yamlLines), body };
}

function parseYamlLines(lines: string[]): WikiFrontmatter {
	const out: WikiFrontmatter = {};
	let currentListKey: string | null = null;

	for (const raw of lines) {
		const line = raw.replace(/\s+$/, '');
		if (line === '') continue;

		// List item under an open list.
		const listMatch = /^(\s*)-(\s+)(.*)$/.exec(line);
		if (listMatch && currentListKey) {
			const value = listMatch[3].trim();
			const list = (out[currentListKey] as string[] | undefined) ?? [];
			list.push(unquote(value));
			out[currentListKey] = list;
			continue;
		}

		// New key:value or new list.
		const kv = /^([A-Za-z_][\w-]*):(\s*)(.*)$/.exec(line);
		if (!kv) continue;

		const key = kv[1];
		const value = kv[3];

		if (value === '') {
			// Either a list follows on subsequent indented lines, or it's intentionally empty.
			currentListKey = key;
			out[key] = [];
			continue;
		}

		currentListKey = null;
		out[key] = unquote(value);
	}

	// Coerce types we care about.
	if (typeof out.order === 'string') {
		const n = Number(out.order);
		if (!Number.isNaN(n)) out.order = n;
	}

	return out;
}

function unquote(value: string): string {
	const v = value.trim();
	if (
		(v.startsWith('"') && v.endsWith('"')) ||
		(v.startsWith("'") && v.endsWith("'"))
	) {
		return v.slice(1, -1);
	}
	return v;
}
