import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, url }) => {
	const answer = url.searchParams.get('answer') ?? 'no';

	// Already authenticated → skip auth gate and go directly to user form
	if (locals.user) {
		redirect(302, `/form?answer=${answer}`);
	}

	return {
		answer
	};
};
