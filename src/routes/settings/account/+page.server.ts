import { fail, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { getProvidersStatus, unlinkSocialAccount } from '$lib/server/account/index.js';
import { user } from '$lib/server/db/schema.js';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/auth?redirect=/settings/account');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			providers: [],
			configuredProviders: {
				google: false,
				github: false,
				facebook: false,
				twitter: false
			}
		};
	}

	const db = getDb(platform.env);
	const providers = await getProvidersStatus(db, locals.user.id, locals.user.email);

	const env = platform.env;
	const configuredProviders = {
		google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
		github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
		facebook: Boolean(
			(env.FACEBOOK_CLIENT_ID || env.FACEBOOK_APP_ID) &&
				(env.FACEBOOK_CLIENT_SECRET || env.FACEBOOK_APP_SECRET)
		),
		twitter: Boolean(env.TWITTER_CLIENT_ID && env.TWITTER_CLIENT_SECRET)
	};

	return {
		user: locals.user,
		providers,
		configuredProviders
	};
};

export const actions: Actions = {
	unlink: async ({ request, locals, platform }) => {
		if (!locals.user) {
			redirect(302, '/auth?redirect=/settings/account');
		}

		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database connection is currently unavailable.' });
		}

		const formData = await request.formData();
		const providerId = formData.get('providerId')?.toString();

		if (!providerId) {
			return fail(400, { message: 'Missing provider identifier.' });
		}

		const db = getDb(platform.env);
		const result = await unlinkSocialAccount(db, locals.user.id, providerId);

		if (!result.success) {
			return fail(400, { message: result.error || 'Failed to disconnect account.' });
		}

		return {
			success: true,
			message: `Successfully disconnected your ${providerId} account.`
		};
	},

	updateEmail: async ({ request, locals, platform }) => {
		if (!locals.user) {
			redirect(302, '/auth?redirect=/settings/account');
		}

		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database connection is currently unavailable.' });
		}

		const formData = await request.formData();
		const emailInput = formData.get('email')?.toString().trim();

		if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
			return fail(400, { message: 'Please enter a valid email address.' });
		}

		const db = getDb(platform.env);

		// Check if email is already taken by another account
		const [existing] = await db
			.select({ id: user.id })
			.from(user)
			.where(and(eq(user.email, emailInput), ne(user.id, locals.user.id)))
			.limit(1);

		if (existing) {
			return fail(400, { message: 'This email address is already associated with another account.' });
		}

		await db
			.update(user)
			.set({ email: emailInput, emailVerified: false, updatedAt: new Date() })
			.where(eq(user.id, locals.user.id));

		return {
			success: true,
			message: 'Email address updated successfully.'
		};
	}
};
