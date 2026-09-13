import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, url, platform }) => {
	const answer = url.searchParams.get('answer') ?? 'no';

	// Already authenticated → skip auth gate and go directly to pledge level
	if (locals.user) {
		redirect(302, `/pledge?answer=${answer}`);
	}

	return {
		answer,
		turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? ''
	};
};
