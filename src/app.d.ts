import type { D1Database, SendEmail } from '@cloudflare/workers-types';

// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				EMAIL?: SendEmail;
				GITHUB_CLIENT_ID: string;
				GITHUB_CLIENT_SECRET: string;
				GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				FACEBOOK_CLIENT_ID?: string;
				FACEBOOK_CLIENT_SECRET?: string;
				FACEBOOK_APP_ID?: string;
				FACEBOOK_APP_SECRET?: string;
				FACEBOOK_BUSINESS_CONFIG_ID?: string;
				TURNSTILE_SITE_KEY: string;
				TURNSTILE_SECRET_KEY: string;
				BETTER_AUTH_SECRET: string;
				BETTER_AUTH_URL: string;
				RESEND_API_KEY?: string;
				EMAIL_FROM?: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
		interface Locals {
			user: import('better-auth').User | null;
			session: import('better-auth').Session | null;
		}
	}

	const __APP_VERSION__: string;
	const __GIT_COMMIT__: string;
}

export {};
