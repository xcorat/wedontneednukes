import { getLegalDocument, type RenderedContent } from '$lib/server/content/loader.js';

export type LegalDocument = RenderedContent;

export async function loadLegalDocument(
	slug: string,
	_fetch?: typeof globalThis.fetch
): Promise<LegalDocument> {
	return getLegalDocument(slug);
}
