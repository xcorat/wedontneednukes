import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import staticManifest from '../../../../static/wiki/manifest.json' with { type: 'json' };

export const prerender = true;

export const GET: RequestHandler = () => {
	return json(staticManifest, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
			'Content-Type': 'application/json'
		}
	});
};
