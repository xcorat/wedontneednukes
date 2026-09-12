import type { PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { campaign, pledge } from '$lib/server/db/schema.js';
import { and, count, eq } from 'drizzle-orm';

const CAMPAIGN_SLUG = 'nukes';
const CAMPAIGN_ID = 'camp_nukes_001';

export const load: PageServerLoad = async ({ url, locals, platform, cookies }) => {
	const answer = (url.searchParams.get('answer') === 'yes' ? 'yes' : 'no') as 'no' | 'yes';
	const isAnon = url.searchParams.get('anon') === '1';

	let stats = {
		totalVotes: 0,
		agreeCount: 0,
		agreePercentage: 0,
		otherCount: 0,
		otherPercentage: 0
	};

	if (platform?.env?.DB) {
		const db = getDb(platform.env);

		// 1. Ensure campaign exists
		let [campaignRecord] = await db
			.select()
			.from(campaign)
			.where(eq(campaign.slug, CAMPAIGN_SLUG))
			.limit(1);

		if (!campaignRecord) {
			await db
				.insert(campaign)
				.values({
					id: CAMPAIGN_ID,
					slug: CAMPAIGN_SLUG,
					title: 'Nuclear Disarmament',
					description: 'Campaign pledge',
					isActive: true,
					createdAt: new Date()
				})
				.onConflictDoNothing();

			campaignRecord = {
				id: CAMPAIGN_ID,
				slug: CAMPAIGN_SLUG,
				title: 'Nuclear Disarmament',
				description: 'Campaign pledge',
				flowDefinition: null,
				isActive: true,
				createdAt: new Date()
			};
		}

		// 2. Identify user / anonymous visitor
		const userId = locals.user?.id;
		let anonId: string | undefined = undefined;

		if (!userId) {
			anonId = cookies.get('anon_id');
			if (!anonId) {
				anonId = crypto.randomUUID();
				cookies.set('anon_id', anonId, {
					path: '/',
					maxAge: 60 * 60 * 24 * 365,
					httpOnly: true,
					sameSite: 'lax'
				});
			}
		}

		// 3. Record or update pledge in DB
		if (userId) {
			const [existingPledge] = await db
				.select()
				.from(pledge)
				.where(and(eq(pledge.userId, userId), eq(pledge.campaignId, campaignRecord.id)))
				.limit(1);

			if (existingPledge) {
				if (existingPledge.choice !== answer) {
					await db
						.update(pledge)
						.set({ choice: answer })
						.where(eq(pledge.id, existingPledge.id));
				}
			} else {
				await db.insert(pledge).values({
					id: crypto.randomUUID(),
					userId,
					choice: answer,
					campaignId: campaignRecord.id,
					createdAt: new Date()
				});
			}
		} else if (anonId) {
			const [existingPledge] = await db
				.select()
				.from(pledge)
				.where(and(eq(pledge.anonId, anonId), eq(pledge.campaignId, campaignRecord.id)))
				.limit(1);

			if (existingPledge) {
				if (existingPledge.choice !== answer) {
					await db
						.update(pledge)
						.set({ choice: answer })
						.where(eq(pledge.id, existingPledge.id));
				}
			} else {
				await db.insert(pledge).values({
					id: crypto.randomUUID(),
					anonId,
					choice: answer,
					campaignId: campaignRecord.id,
					createdAt: new Date()
				});
			}
		}

		// 4. Compute live community consensus numbers
		const [agreeResult] = await db
			.select({ value: count() })
			.from(pledge)
			.where(and(eq(pledge.campaignId, campaignRecord.id), eq(pledge.choice, 'no')));

		const [otherResult] = await db
			.select({ value: count() })
			.from(pledge)
			.where(and(eq(pledge.campaignId, campaignRecord.id), eq(pledge.choice, 'yes')));

		const agreeCount = agreeResult?.value ?? 0;
		const otherCount = otherResult?.value ?? 0;
		const totalVotes = agreeCount + otherCount;

		const agreePercentage = totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0;
		const otherPercentage = totalVotes > 0 ? 100 - agreePercentage : 0;

		stats = {
			totalVotes,
			agreeCount,
			agreePercentage,
			otherCount,
			otherPercentage
		};
	}

	return {
		answer,
		isAnon: isAnon || !locals.user,
		stats
	};
};
