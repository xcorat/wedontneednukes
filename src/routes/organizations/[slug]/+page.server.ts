import type { PageServerLoad } from './$types.js';
import { getOrganizationArticle } from '$lib/server/content/loader.js';

export const load: PageServerLoad = ({ params }) => {
	const organization = getOrganizationArticle(params.slug);

	return {
		organization
	};
};
