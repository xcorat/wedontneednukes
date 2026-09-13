import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, url }) => {
	const callbackUrl = url.searchParams.get('callbackURL') || url.searchParams.get('redirect') || '/profile';

	// If already authenticated and session is active
	if (locals.user && locals.session) {
		redirect(302, callbackUrl);
	}

	return {
		callbackUrl
	};
};
