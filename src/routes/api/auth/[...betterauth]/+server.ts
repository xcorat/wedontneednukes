import { getAuth } from '$lib/server/auth/index.js';
import { verifyTurnstileToken } from '$lib/server/security/turnstile.js';
import type { RequestHandler } from './$types.js';

/**
 * Catch-all handler that delegates auth API requests to Better Auth,
 * while enforcing edge bot verification via Cloudflare Turnstile.
 */
const handler: RequestHandler = async (event) => {
	const env = event.platform?.env;
	if (!env) {
		return new Response('Auth not available in this environment', { status: 503 });
	}

	// Verify Cloudflare Turnstile on sensitive endpoints (e.g. magic link creation)
	if (event.request.method === 'POST' && event.url.pathname.endsWith('/sign-in/magic-link')) {
		let token = event.request.headers.get('cf-turnstile-response');

		if (!token) {
			try {
				const cloned = event.request.clone();
				const body = (await cloned.json()) as { turnstileToken?: string };
				token = body?.turnstileToken || null;
			} catch {
				// Non-JSON body or parsing failed
			}
		}

		let clientIp: string | undefined;
		try {
			clientIp = event.request.headers.get('cf-connecting-ip') || event.getClientAddress();
		} catch {
			// In some local dev environments getClientAddress may throw
		}

		const verification = await verifyTurnstileToken(token, env.TURNSTILE_SECRET_KEY, clientIp);
		if (!verification.success) {
			return new Response(
				JSON.stringify({
					message: verification.error || 'Security verification failed. Please refresh and try again.'
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
	}

	const auth = getAuth(env, event.url.origin);
	return auth.handler(event.request);
};

export const GET = handler;
export const POST = handler;
