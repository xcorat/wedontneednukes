import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, params, url }) => {
	const answer = url.searchParams.get('answer') ?? 'no';

	// Already authenticated → skip auth gate and go directly to results
	if (locals.user) {
		redirect(302, `/campaign/${params.slug}/results?answer=${answer}`);
	}

	return {
		answer,
		slug: params.slug
	};
};
