import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { getPublicResultsSummary, listPublicVotesAndPledges } from '$lib/server/results/index.js';

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return json({ error: 'Database unavailable' }, { status: 503 });
	}

	const db = getDb(platform.env);
	const [summary, activity] = await Promise.all([
		getPublicResultsSummary(db),
		listPublicVotesAndPledges(db, { limit: 10, filter: 'all' })
	]);

	return json({
		summary,
		latestVotes: activity.items,
		totalVotesCount: activity.total
	});
};
