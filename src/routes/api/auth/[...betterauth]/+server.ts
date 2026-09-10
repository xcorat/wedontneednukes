import { getAuth } from '$lib/server/auth/index.js';
import type { RequestHandler } from './$types.js';

/**
 * Catch-all handler that delegates all auth API requests to Better Auth.
 * Better Auth handles GET/POST internally based on the path.
 */
const handler: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) {
		return new Response('Auth not available in this environment', { status: 503 });
	}

	const auth = getAuth(env, event.url.origin);
	return auth.handler(event.request);
};

export const GET = handler;
export const POST = handler;
