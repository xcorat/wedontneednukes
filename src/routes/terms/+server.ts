import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = () => {
	throw redirect(307, '/legal/terms');
};
