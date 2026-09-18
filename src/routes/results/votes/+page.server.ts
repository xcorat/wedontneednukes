import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { listPublicVotesAndPledges, type PublicVoteItem } from '$lib/server/results/index.js';

export const load: PageServerLoad = async ({ url, platform }) => {
	const rawPage = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
	const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
	const limit = 20;
	const offset = (page - 1) * limit;

	const rawFilter = url.searchParams.get('filter');
	const filter =
		rawFilter === 'validated' || rawFilter === 'pledges' ? rawFilter : 'all';

	let items: PublicVoteItem[] = [];
	let total = 0;
	let hasMore = false;

	if (platform?.env?.DB) {
		const db = getDb(platform.env);
		const result = await listPublicVotesAndPledges(db, {
			limit,
			offset,
			filter
		});
		items = result.items;
		total = result.total;
		hasMore = result.hasMore;
	}

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return {
		items,
		total,
		page,
		totalPages,
		limit,
		hasMore,
		filter
	};
};
