import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { getOrCreateUserProfile, updateUserProfile } from '$lib/server/profile/index.js';
import { user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/auth?redirect=/settings/profile');
	}

	if (!platform?.env?.DB) {
		return {
			user: locals.user,
			profile: null
		};
	}

	const db = getDb(platform.env);
	const profile = await getOrCreateUserProfile(db, locals.user.id);

	return {
		user: locals.user,
		profile
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		if (!locals.user) {
			redirect(302, '/auth?redirect=/settings/profile');
		}

		if (!platform?.env?.DB) {
			return fail(500, { message: 'Database connection is currently unavailable.' });
		}

		const formData = await request.formData();
		const db = getDb(platform.env);

		const name = formData.get('name')?.toString().trim();
		const displayName = formData.get('displayName')?.toString().trim();
		const bio = formData.get('bio')?.toString().trim();
		const location = formData.get('location')?.toString().trim();
		const website = formData.get('website')?.toString().trim();

		// Checkbox inputs return 'on' if checked, null/undefined if unchecked
		const isDisplayNamePublic = formData.get('isDisplayNamePublic') === 'on';
		const isBioPublic = formData.get('isBioPublic') === 'on';
		const isLocationPublic = formData.get('isLocationPublic') === 'on';
		const isWebsitePublic = formData.get('isWebsitePublic') === 'on';
		const isPledgePublic = formData.get('isPledgePublic') === 'on';

		// Input validations
		if (name && name.length > 50) {
			return fail(400, { message: 'Username cannot exceed 50 characters.' });
		}
		if (displayName && displayName.length > 50) {
			return fail(400, { message: 'Display name cannot exceed 50 characters.' });
		}
		if (bio && bio.length > 500) {
			return fail(400, { message: 'Bio cannot exceed 500 characters.' });
		}
		if (location && location.length > 100) {
			return fail(400, { message: 'Location cannot exceed 100 characters.' });
		}

		try {
			// Update core user table if username/name changed
			if (name && name !== locals.user.name) {
				await db
					.update(user)
					.set({ name, updatedAt: new Date() })
					.where(eq(user.id, locals.user.id));
			}

			// Update user profile and privacy toggles
			const updatedProfile = await updateUserProfile(db, locals.user.id, {
				displayName,
				isDisplayNamePublic,
				bio,
				isBioPublic,
				location,
				isLocationPublic,
				website,
				isWebsitePublic,
				isPledgePublic
			});

			return {
				success: true,
				message: 'Profile settings saved successfully!',
				profile: updatedProfile
			};
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to update profile.';
			return fail(500, { message });
		}
	}
};
