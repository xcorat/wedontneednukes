import type { PageServerLoad } from './$types.js';
import { loadLegalDocument } from '$lib/server/legal/loader.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const document = await loadLegalDocument(params.slug, fetch);
	return { document };
};
