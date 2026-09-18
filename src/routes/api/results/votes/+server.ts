import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { listPublicVotesAndPledges } from '$lib/server/results/index.js';

export const GET: RequestHandler = async ({ url, platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Database unavailable' }, { status: 503 });
	}

	const db = getDb(platform.env);

	const limitParam = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);
	const offsetParam = Number.parseInt(url.searchParams.get('offset') ?? '0', 10);
	const rawFilter = url.searchParams.get('filter');

	const filter =
		rawFilter === 'validated' || rawFilter === 'pledges' ? rawFilter : 'all';

	const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
	const offset = Number.isFinite(offsetParam) ? Math.max(offsetParam, 0) : 0;

	const result = await listPublicVotesAndPledges(db, {
		limit,
		offset,
		filter
	});

	return json({
		items: result.items,
		total: result.total,
		hasMore: result.hasMore,
		limit,
		offset
	});
};
