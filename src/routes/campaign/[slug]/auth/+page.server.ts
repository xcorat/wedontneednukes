import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, params, url }) => {
	// Already authenticated → skip auth gate
	if (locals.user) {
		redirect(302, `/campaign/${params.slug}/pledge`);
	}

	return {
		answer: url.searchParams.get('answer') ?? 'no',
		slug: params.slug
	};
};
