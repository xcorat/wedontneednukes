// src/lib/server/content/catalog.ts
//
// Server-only catalog of precompiled markdown files.
// In Vite builds (prod & dev), import.meta.glob eagerly inlines every .md file as a string literal.
// In Node.js test environments (tsx), a safe fallback reads from the filesystem.

export type ContentEntry = {
	key: string;
	raw: string;
};

let rawFiles: Record<string, string> = {};

try {
	rawFiles = import.meta.glob<string>('./markdown/**/*.md', {
		query: '?raw',
		import: 'default',
		eager: true
	});
} catch {
	// In Node.js test environments (tsx), import.meta.glob is not defined;
	// Node fallback reads files from disk below.
}

function toKey(vitePath: string): string {
	return vitePath
		.replace(/^\.\/markdown\//, '')
		.replace(/^\/src\/lib\/server\/content\/markdown\//, '')
		.replace(/\.md$/, '');
}

const catalog = new Map<string, string>(
	Object.entries(rawFiles).map(([path, raw]) => [toKey(path), raw])
);

export function getMarkdown(key: string): string | null {
	const normalizedKey = key.replace(/^\//, '').replace(/\.md$/, '');
	if (catalog.has(normalizedKey)) {
		return catalog.get(normalizedKey)!;
	}

	// Node.js test environment fallback
	try {
		const fs = globalThis.process ? (globalThis as any).process.getBuiltinModule?.('node:fs') : null;
		const path = globalThis.process ? (globalThis as any).process.getBuiltinModule?.('node:path') : null;
		if (fs && path) {
			const fullPath = path.join(
				process.cwd(),
				'src',
				'lib',
				'server',
				'content',
				'markdown',
				`${normalizedKey}.md`
			);
			if (fs.existsSync(fullPath)) {
				const content = fs.readFileSync(fullPath, 'utf-8');
				catalog.set(normalizedKey, content);
				return content;
			}
		}
	} catch {
		// Fallback fails silently in non-node runtimes
	}

	return null;
}

export function listMarkdown(prefix = ''): ContentEntry[] {
	// Populate from disk in Node test environments if catalog is empty
	if (catalog.size === 0) {
		try {
			const fs = globalThis.process ? (globalThis as any).process.getBuiltinModule?.('node:fs') : null;
			const path = globalThis.process ? (globalThis as any).process.getBuiltinModule?.('node:path') : null;
			if (fs && path) {
				const baseDir = path.join(process.cwd(), 'src', 'lib', 'server', 'content', 'markdown');
				const walk = (dir: string, prefixPath = '') => {
					if (!fs.existsSync(dir)) return;
					const entries = fs.readdirSync(dir, { withFileTypes: true });
					for (const entry of entries) {
						if (entry.isDirectory()) {
							walk(path.join(dir, entry.name), prefixPath ? `${prefixPath}/${entry.name}` : entry.name);
						} else if (entry.name.endsWith('.md')) {
							const fileKey = prefixPath
								? `${prefixPath}/${entry.name.replace(/\.md$/, '')}`
								: entry.name.replace(/\.md$/, '');
							if (!catalog.has(fileKey)) {
								const content = fs.readFileSync(path.join(dir, entry.name), 'utf-8');
								catalog.set(fileKey, content);
							}
						}
					}
				};
				walk(baseDir);
			}
		} catch {
			// Fallback fails silently in non-node runtimes
		}
	}

	return [...catalog.entries()]
		.filter(([k]) => (prefix ? k === prefix || k.startsWith(prefix + '/') : true))
		.map(([k, raw]) => ({ key: k, raw }));
}
