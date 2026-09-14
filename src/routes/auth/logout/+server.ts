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

	event.cookies.delete('better-auth.session_token', { path: '/' });
	event.cookies.delete('__Secure-better-auth.session_token', { path: '/' });

	redirect(303, '/');
};

export const GET: RequestHandler = POST;
