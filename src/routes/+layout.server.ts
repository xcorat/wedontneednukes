import type { LayoutServerLoad } from './$types.js';

/** Pass user/session down to all routes via layout data. */
export const load: LayoutServerLoad = ({ locals }) => {
	return {
		user: locals.user,
		session: locals.session
	};
};
