import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { getDb } from '$lib/server/db/client.js';
import { schema } from '$lib/server/db/schema.js';
import { sendMagicLinkEmail } from '$lib/server/email.js';

const isLocalhost = (url?: string) =>
	Boolean(url && (url.includes('localhost') || url.includes('127.0.0.1')));

/**
 * Create a Better Auth instance per request.
 * D1 bindings are per-request, so auth must be a factory — not a singleton.
 *
 * @param env - The Cloudflare Workers platform env (from `event.platform.env`)
 * @param origin - The incoming request origin (e.g. `https://wedontneednukes.xcorat.workers.dev`)
 */
export function getAuth(env: App.Platform['env'], origin?: string) {
	const db = getDb(env);

	// In production, prioritize the actual request origin over any localhost fallback.
	const baseURL =
		origin && !isLocalhost(origin)
			? origin
			: env.BETTER_AUTH_URL && !isLocalhost(env.BETTER_AUTH_URL)
				? env.BETTER_AUTH_URL
				: origin || 'http://localhost:5173';

	const trustedOrigins = [
		'http://localhost:*',
		'http://127.0.0.1:*',
		'https://*.workers.dev',
		'https://wedontneednukes.xcorat.workers.dev',
		...(origin ? [origin] : []),
		...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : [])
	];

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema
		}),
		secret: env.BETTER_AUTH_SECRET,
		baseURL,
		trustedOrigins,
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET
			},
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET
			}
		},
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					await sendMagicLinkEmail({ to: email, url, env });
				}
			})
		]
	});
}

export type Auth = ReturnType<typeof getAuth>;
