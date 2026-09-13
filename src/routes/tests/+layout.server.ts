import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = () => {
	// Only accessible in dev mode
	if (!dev) {
		error(404, 'Not found');
	}
};
