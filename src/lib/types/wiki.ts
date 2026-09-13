// Wiki / FAQ manifest entry. Produced by scripts/generate-wiki-manifest.ts
// from the frontmatter in each static/wiki/faq/<slug>.md file.

export interface WikiManifestEntry {
	slug: string;
	category: string;
	order: number;
	title: string;
	summary: string;
	related?: string[];
}

export interface WikiManifest {
	generatedAt: string; // ISO timestamp
	entries: WikiManifestEntry[];
}

// Result shape returned by src/lib/server/wiki/loader.ts.
export interface WikiArticle {
	slug: string;
	title: string;
	category: string;
	order: number;
	summary: string;
	related: string[];
	html: string; // Markdown body already parsed to HTML
	updatedAt?: string;
}
