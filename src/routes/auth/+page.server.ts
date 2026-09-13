import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ locals, url, platform }) => {
	const answerParam = url.searchParams.get('answer');
	const redirectParam = url.searchParams.get('redirect');

	// 1. If already authenticated
	if (locals.user) {
		if (redirectParam) {
			redirect(302, redirectParam);
		}
		if (answerParam === 'no' || answerParam === 'yes') {
			redirect(302, `/onboarding/pledge?answer=${answerParam}`);
		}
		redirect(302, '/dashboard');
	}

	// 2. If unauthenticated and an answer parameter was provided, route into the dedicated onboarding wizard
	if (answerParam === 'no' || answerParam === 'yes') {
		redirect(302, `/onboarding/join?${url.searchParams.toString()}`);
	}

	// 3. Otherwise render clean sign-in screen
	return {
		redirectUrl: redirectParam || '/dashboard',
		turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? ''
	};
};
