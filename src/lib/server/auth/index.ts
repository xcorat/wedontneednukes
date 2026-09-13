import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink, twoFactor } from 'better-auth/plugins';
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
 * @param origin - The incoming request origin (e.g. `https://wedontneednukes.org`)
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
		'https://wedontneednukes.org',
		'https://*.wedontneednukes.org',
		...(origin ? [origin] : []),
		...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : [])
	];

	const socialProviders: Record<string, Record<string, unknown>> = {};
	if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
		socialProviders.github = {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		};
	}
	if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
		socialProviders.google = {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		};
	}
	const facebookClientId = env.FACEBOOK_CLIENT_ID || env.FACEBOOK_APP_ID;
	const facebookClientSecret = env.FACEBOOK_CLIENT_SECRET || env.FACEBOOK_APP_SECRET;
	if (facebookClientId && facebookClientSecret) {
		socialProviders.facebook = {
			clientId: facebookClientId,
			clientSecret: facebookClientSecret,
			mapProfileToUser: (profile: any) => {
				const id = profile?.id || profile?.sub || 'user';
				const email = profile?.email;
				return {
					email: email || `${id}@facebook.placeholder.invalid`,
					emailVerified: Boolean(email)
				};
			},
			...(env.FACEBOOK_BUSINESS_CONFIG_ID ? { configId: env.FACEBOOK_BUSINESS_CONFIG_ID } : {})
		};
	}

	if (env.TWITTER_CLIENT_ID && env.TWITTER_CLIENT_SECRET) {
		socialProviders.twitter = {
			clientId: env.TWITTER_CLIENT_ID,
			clientSecret: env.TWITTER_CLIENT_SECRET,
			mapProfileToUser: (profile: any) => {
				const id = profile?.data?.id || profile?.id || profile?.username || 'user';
				const email = profile?.data?.email || profile?.email;
				return {
					email: email || `${id}@twitter.placeholder.invalid`,
					emailVerified: Boolean(email)
				};
			}
		};
	}

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema
		}),
		secret: env.BETTER_AUTH_SECRET,
		baseURL,
		trustedOrigins,
		account: {
			accountLinking: {
				enabled: true,
				trustedProviders: ['google', 'github', 'facebook', 'twitter']
			}
		},
		socialProviders,
		plugins: [
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					await sendMagicLinkEmail({ to: email, url, env });
				}
			}),
			twoFactor({
				issuer: "We Don't Need Nukes",
				allowPasswordless: true
			})
		]
	});
}

export type Auth = ReturnType<typeof getAuth>;
