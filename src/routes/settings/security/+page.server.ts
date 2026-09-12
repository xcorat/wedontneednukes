import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { getUserSessions, revokeSession, revokeOtherSessions } from '$lib/server/security/sessions.js';
import { twoFactor, user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/auth?redirect=/settings/security');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			twoFactorEnabled: false,
			sessions: []
		};
	}

	const db = getDb(platform.env);

	// Check if two factor is enabled on the user or in two_factor table
	const [userData] = await db
		.select({ twoFactorEnabled: user.twoFactorEnabled })
		.from(user)
		.where(eq(user.id, locals.user.id))
		.limit(1);

	const sessions = await getUserSessions(db, locals.user.id, locals.session?.token);

	return {
		user: locals.user,
		twoFactorEnabled: Boolean(userData?.twoFactorEnabled),
		sessions
	};
};

export const actions: Actions = {
	revokeSession: async ({ request, locals, platform }) => {
		if (!locals.user) {
			redirect(302, '/auth?redirect=/settings/security');
		}

		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database connection is currently unavailable.' });
		}

		const formData = await request.formData();
		const sessionId = formData.get('sessionId')?.toString();

		if (!sessionId) {
			return fail(400, { message: 'Missing session ID.' });
		}

		const db = getDb(platform.env);
		const result = await revokeSession(db, locals.user.id, sessionId);

		if (!result.success) {
			return fail(400, { message: result.error || 'Failed to revoke session.' });
		}

		return {
			success: true,
			message: 'Session revoked successfully.'
		};
	},

	revokeOtherSessions: async ({ locals, platform }) => {
		if (!locals.user || !locals.session?.token) {
			redirect(302, '/auth?redirect=/settings/security');
		}

		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database connection is currently unavailable.' });
		}

		const db = getDb(platform.env);
		const result = await revokeOtherSessions(db, locals.user.id, locals.session.token);

		if (!result.success) {
			return fail(400, { message: result.error || 'Failed to revoke other sessions.' });
		}

		return {
			success: true,
			message: 'Signed out of all other devices successfully.'
		};
	},

	disableTwoFactor: async ({ locals, platform }) => {
		if (!locals.user) {
			redirect(302, '/auth?redirect=/settings/security');
		}

		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database connection is currently unavailable.' });
		}

		const db = getDb(platform.env);

		try {
			// Remove 2FA records and toggle flag
			await db.delete(twoFactor).where(eq(twoFactor.userId, locals.user.id));
			await db
				.update(user)
				.set({ twoFactorEnabled: false, updatedAt: new Date() })
				.where(eq(user.id, locals.user.id));

			return {
				success: true,
				message: 'Two-factor authentication has been disabled.'
			};
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to disable 2FA.';
			return fail(500, { message });
		}
	}
};
