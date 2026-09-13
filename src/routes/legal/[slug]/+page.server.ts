import type { PageServerLoad } from './$types.js';
import { getLegalDocument } from '$lib/server/content/loader.js';

export const load: PageServerLoad = ({ params }) => {
	const document = getLegalDocument(params.slug);
	return { document };
};
