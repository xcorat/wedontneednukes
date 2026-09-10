import { getAuth } from '$lib/server/auth/index.js';
import { type Handle } from '@sveltejs/kit';

/**
 * SvelteKit server hook.
 * - Resolves the current user session from Better Auth on every request.
 * - Stores user and session in `event.locals` for use in routes.
 */
export const handle: Handle = async ({ event, resolve }) => {
	const env = event.platform?.env;

	if (env) {
		const auth = getAuth(env);
		const sessionData = await auth.api.getSession({
			headers: event.request.headers
		});

		event.locals.user = sessionData?.user ?? null;
		event.locals.session = sessionData?.session ?? null;
	} else {
		// Local dev without Wrangler — no auth context
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
