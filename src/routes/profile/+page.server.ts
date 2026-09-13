import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { getPublicUserProfile } from '$lib/server/profile/index.js';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		redirect(302, '/auth?redirect=/profile');
	}

	if (!platform?.env?.DB) {
		return {
			profile: null,
			user: locals.user
		};
	}

	const db = getDb(platform.env);
	const profile = await getPublicUserProfile(db, locals.user.id, locals.user.id);

	return {
		profile,
		user: locals.user
	};
};
