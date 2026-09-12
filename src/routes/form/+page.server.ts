import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getDb } from '$lib/server/db/client.js';
import { campaign, pledge, user } from '$lib/server/db/schema.js';
import { and, eq } from 'drizzle-orm';

const CAMPAIGN_SLUG = 'nukes';
const CAMPAIGN_ID = 'camp_nukes_001';

async function ensureCampaign(db: ReturnType<typeof getDb>) {
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

	return campaignRecord;
}

export const load: PageServerLoad = async ({ locals, url, cookies, platform }) => {
	const answer = (url.searchParams.get('answer') === 'yes' ? 'yes' : 'no') as 'no' | 'yes';
	const isAnonParam = url.searchParams.get('anon') === '1';

	let anonId = cookies.get('anon_id');
	const userId = locals.user?.id;

	// If not authenticated and not marked anonymous, send to auth screen
	if (!userId && !anonId && !isAnonParam) {
		redirect(302, `/auth?answer=${answer}`);
	}

	// If anonymous, ensure anon_id cookie is initialized
	if (!userId && !anonId) {
		anonId = crypto.randomUUID();
		cookies.set('anon_id', anonId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: true,
			sameSite: 'lax'
		});
	}

	let existingName = locals.user?.name ?? '';
	let existingFeedback = '';

	if (platform?.env?.DB) {
		const db = getDb(platform.env);
		const campaignRecord = await ensureCampaign(db);

		let existingPledge: typeof pledge.$inferSelect | undefined;

		if (userId) {
			[existingPledge] = await db
				.select()
				.from(pledge)
				.where(and(eq(pledge.userId, userId), eq(pledge.campaignId, campaignRecord.id)))
				.limit(1);
		} else if (anonId) {
			[existingPledge] = await db
				.select()
				.from(pledge)
				.where(and(eq(pledge.anonId, anonId), eq(pledge.campaignId, campaignRecord.id)))
				.limit(1);
		}

		if (existingPledge?.responses && typeof existingPledge.responses === 'object') {
			const responses = existingPledge.responses as { name?: string; feedback?: string };
			if (responses.name) existingName = responses.name;
			if (responses.feedback) existingFeedback = responses.feedback;
		}
	}

	return {
		answer,
		name: existingName,
		feedback: existingFeedback,
		isAnon: !userId
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url, cookies, platform }) => {
		const answer = (url.searchParams.get('answer') === 'yes' ? 'yes' : 'no') as 'no' | 'yes';
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const feedback = formData.get('feedback')?.toString().trim() ?? '';

		const userId = locals.user?.id;
		let anonId = cookies.get('anon_id');
		if (!userId && !anonId) {
			anonId = crypto.randomUUID();
			cookies.set('anon_id', anonId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: true,
				sameSite: 'lax'
			});
		}

		if (platform?.env?.DB) {
			const db = getDb(platform.env);
			const campaignRecord = await ensureCampaign(db);

			const responsesData = {
				name,
				feedback
			};

			if (userId) {
				const [existingPledge] = await db
					.select()
					.from(pledge)
					.where(and(eq(pledge.userId, userId), eq(pledge.campaignId, campaignRecord.id)))
					.limit(1);

				if (existingPledge) {
					await db
						.update(pledge)
						.set({
							choice: answer,
							responses: responsesData,
							completed: true
						})
						.where(eq(pledge.id, existingPledge.id));
				} else {
					await db.insert(pledge).values({
						id: crypto.randomUUID(),
						userId,
						choice: answer,
						campaignId: campaignRecord.id,
						responses: responsesData,
						completed: true,
						createdAt: new Date()
					});
				}

				if (name) {
					await db
						.update(user)
						.set({ name, updatedAt: new Date() })
						.where(eq(user.id, userId));
				}
			} else if (anonId) {
				const [existingPledge] = await db
					.select()
					.from(pledge)
					.where(and(eq(pledge.anonId, anonId), eq(pledge.campaignId, campaignRecord.id)))
					.limit(1);

				if (existingPledge) {
					await db
						.update(pledge)
						.set({
							choice: answer,
							responses: responsesData,
							completed: true
						})
						.where(eq(pledge.id, existingPledge.id));
				} else {
					await db.insert(pledge).values({
						id: crypto.randomUUID(),
						anonId,
						choice: answer,
						campaignId: campaignRecord.id,
						responses: responsesData,
						completed: true,
						createdAt: new Date()
					});
				}
			}
		}

		const isAnon = !userId;
		redirect(303, `/results?answer=${answer}${isAnon ? '&anon=1' : ''}`);
	}
};
