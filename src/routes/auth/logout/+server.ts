import { redirect, type RequestHandler } from '@sveltejs/kit';
import { getAuth } from '$lib/server/auth/index.js';

export const POST: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (env) {
		try {
			const auth = getAuth(env, event.url.origin);
			await auth.api.signOut({
				headers: event.request.headers
			});
		} catch (err) {
			console.error('Failed to sign out on server:', err);
		}
	}

	// Clear all Better Auth session cookies
	const sessionCookies = [
		'better-auth.session_token',
		'__Secure-better-auth.session_token',
		'better-auth.session_data',
		'__Secure-better-auth.session_data',
		'better-auth.dont_remember',
		'__Secure-better-auth.dont_remember'
	];

	for (const name of sessionCookies) {
		event.cookies.delete(name, { path: '/' });
	}

	redirect(303, '/');
};

export const GET: RequestHandler = POST;
