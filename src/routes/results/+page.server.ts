import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ url }) => {
	const answer = url.searchParams.get('answer');
	const query = answer ? `?answer=${answer}` : '';
	redirect(302, `/campaign/nukes/results${query}`);
};
