import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, params, url }) => {
	// Not authenticated and not anonymous → send to auth gate
	const isAnon = url.searchParams.get('anon') === '1';
	if (!locals.user && !isAnon) {
		redirect(302, `/campaign/${params.slug}/auth?answer=${url.searchParams.get('answer') ?? 'no'}`);
	}

	return {
		user: locals.user,
		slug: params.slug,
		answer: url.searchParams.get('answer') ?? 'no'
	};
};
