import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '$lib/server/db/client.js';
import { schema } from '$lib/server/db/schema.js';

/**
 * Create a Better Auth instance per request.
 * D1 bindings are per-request, so auth must be a factory — not a singleton.
 *
 * @param env - The Cloudflare Workers platform env (from `event.platform.env`)
 */
export function getAuth(env: App.Platform['env']) {
	const db = getDb(env);

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema
		}),
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET
			},
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET
			}
		}
	});
}

export type Auth = ReturnType<typeof getAuth>;
