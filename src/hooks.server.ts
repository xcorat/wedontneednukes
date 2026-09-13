import { dev } from '$app/environment';
import { getAuth } from '$lib/server/auth/index.js';
import { error, type Handle } from '@sveltejs/kit';

/**
 * SvelteKit server hook.
 * - Resolves the current user session from Better Auth on every request.
 * - Stores user and session in `event.locals` for use in routes.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Restrict all /tests routes to dev mode only
	if (event.url.pathname.startsWith('/tests') && !dev) {
		error(404, 'Not found');
	}

	const env = event.platform?.env;

	if (env) {
		const auth = getAuth(env, event.url.origin);
		const sessionData = await auth.api.getSession({
			headers: event.request.headers
		});

		event.locals.user = sessionData?.user ?? null;
		event.locals.session = sessionData?.session ?? null;

		// If user authenticated and has anonymous votes, claim them seamlessly
		if (event.locals.user && env.DB) {
			const anonId = event.cookies.get('anon_id');
			if (anonId) {
				try {
					const { getDb } = await import('$lib/server/db/client.js');
					const { claimAnonymousResponses } = await import('$lib/server/qa/auth-claiming.js');
					const db = getDb(env);
					await claimAnonymousResponses(db, { anonId, userId: event.locals.user.id });
					event.cookies.delete('anon_id', { path: '/' });
				} catch (err) {
					console.error('Failed to claim anonymous responses:', err);
				}
			}
		}
	} else {
		// Local dev without Wrangler — no auth context
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
