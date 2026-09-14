// scripts/generate-wiki-manifest.ts
//
// Walks static/wiki/faq/*.md, parses each file's frontmatter, and writes a
// consolidated manifest to static/wiki/manifest.json. Run via `pnpm manifest`.
// Also called automatically as a `prebuild` step.

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '../src/lib/utils/wiki-frontmatter.js';
import type { WikiManifest, WikiManifestEntry } from '../src/lib/types/wiki.js';

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, 'src', 'lib', 'server', 'content', 'markdown', 'wiki', 'faq');
const MANIFEST_PATH = join(ROOT, 'src', 'lib', 'server', 'content', 'markdown', 'wiki', 'manifest.json');
const STATIC_MANIFEST_PATH = join(ROOT, 'static', 'wiki', 'manifest.json');

function main() {
	let entries: WikiManifestEntry[] = [];
	let files: string[] = [];

	try {
		files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
	} catch {
		console.warn(`[wiki-manifest] No articles dir at ${ARTICLES_DIR} — emitting empty manifest.`);
		files = [];
	}

	for (const file of files) {
		const slug = file.replace(/\.md$/, '');
		const fullPath = join(ARTICLES_DIR, file);
		const text = readFileSync(fullPath, 'utf-8');
		const { frontmatter } = parseFrontmatter(text);

		const title = (frontmatter.title as string | undefined)?.trim();
		const category = (frontmatter.category as string | undefined)?.trim();
		const summary = (frontmatter.summary as string | undefined)?.trim();
		const order = typeof frontmatter.order === 'number' ? frontmatter.order : 0;
		const related = Array.isArray(frontmatter.related)
			? (frontmatter.related as unknown[]).filter((v): v is string => typeof v === 'string')
			: undefined;

		const errors: string[] = [];
		if (!title) errors.push('title');
		if (!category) errors.push('category');
		if (!summary) errors.push('summary');

		if (errors.length) {
			console.error(
				`[wiki-manifest] ${file} is missing required frontmatter field(s): ${errors.join(', ')}`
			);
			process.exitCode = 1;
			continue;
		}

		entries.push({
			slug,
			title: title!,
			category: category!,
			order,
			summary: summary!,
			related
		});
	}

	// Group + sort: same order the loader will produce at request time.
	entries.sort((a, b) => {
		if (a.category !== b.category) return a.category.localeCompare(b.category);
		return a.order - b.order;
	});

	const manifest: WikiManifest = {
		generatedAt: new Date().toISOString(),
		entries
	};

	const manifestJson = JSON.stringify(manifest, null, '\t') + '\n';
	writeFileSync(MANIFEST_PATH, manifestJson, 'utf-8');
	try {
		writeFileSync(STATIC_MANIFEST_PATH, manifestJson, 'utf-8');
	} catch {
		// optional if static dir isn't ready
	}

	// Quick sanity check: every slug referenced in any `related` list should
	// itself have an entry — catches dangling cross-links early.
	const slugs = new Set(entries.map((e) => e.slug));
	const dangling: string[] = [];
	for (const e of entries) {
		for (const r of e.related ?? []) {
			if (!slugs.has(r)) dangling.push(`${e.slug} → ${r}`);
		}
	}
	if (dangling.length) {
		console.error(`[wiki-manifest] Dangling related references: ${dangling.join(', ')}`);
		process.exitCode = 1;
	}

	const stat = statSync ? statSync(MANIFEST_PATH) : null;
	console.log(
		`[wiki-manifest] Wrote ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} → ${MANIFEST_PATH.replace(ROOT + '/', '')}${stat ? ` (${stat.size} bytes)` : ''}`
	);
}

main();
