import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { getPublicUserProfile } from '$lib/server/profile/index.js';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const targetUserId = params.id;

	if (!platform?.env?.DB) {
		error(503, 'Database unavailable');
	}

	const db = getDb(platform.env);
	const profile = await getPublicUserProfile(db, targetUserId, locals.user?.id);

	if (!profile) {
		error(404, 'Profile not found');
	}

	return {
		profile
	};
};
