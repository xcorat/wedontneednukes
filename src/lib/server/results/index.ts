import { eq, inArray, desc } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import {
	user,
	userProfile,
	userResponse,
	type UserProfile
} from '$lib/server/db/schema.js';
import { createHeroQuestion } from '$lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '$lib/fixtures/commitmentQuestion.js';
import { getQuestionStats } from '$lib/server/qa/repository.js';

export type DbClient = DrizzleD1Database<any>;

export interface PublicVoteItem {
	id: string;
	choice: 'no' | 'yes';
	choiceLabel: string;
	commitmentLevels: string[];
	commitmentLabels: string[];
	isValidated: boolean;
	isAnonymous: boolean;
	user?: {
		id?: string;
		name: string;
		image: string | null;
		location: string | null;
	};
	feedback?: string | null;
	createdAt: string;
}

export interface ResultsSummary {
	totalVotes: number;
	agreeCount: number;
	agreePercentage: number;
	otherCount: number;
	otherPercentage: number;
	validated: {
		totalVotes: number;
		agreeCount: number;
		agreePercentage: number;
		otherCount: number;
		otherPercentage: number;
	};
	commitments: {
		totalPledges: number;
		tiers: {
			passive: { label: string; count: number; percentage: number };
			active: { label: string; count: number; percentage: number };
			direct: { label: string; count: number; percentage: number };
		};
	};
}

export interface ListVotesOptions {
	limit?: number;
	offset?: number;
	filter?: 'all' | 'validated' | 'pledges';
}

const TIER_LABELS: Record<string, string> = {
	passive: 'Ally',
	active: 'Advocate',
	direct: 'Contributor'
};

/**
 * Calculates complete campaign results summary including consensus stats and commitment tier breakdowns.
 */
export async function getPublicResultsSummary(db: DbClient): Promise<ResultsSummary> {
	const hero = await createHeroQuestion();
	const commitmentQ = await createCommitmentQuestion();

	const agreeChoiceId = hero.ans.choices[0].id;
	const otherChoiceId = hero.ans.choices[1].id;

	// Overall consensus stats
	const allStatsResult = await getQuestionStats(db, hero.id);
	const agreeCount = allStatsResult.countsByChoiceId[agreeChoiceId] ?? 0;
	const otherCount = allStatsResult.countsByChoiceId[otherChoiceId] ?? 0;
	const totalVotes = allStatsResult.totalResponses;
	const agreePercentage = totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0;
	const otherPercentage = totalVotes > 0 ? 100 - agreePercentage : 0;

	// Validated (authenticated) consensus stats
	const valStatsResult = await getQuestionStats(db, hero.id, { validatedOnly: true });
	const valAgreeCount = valStatsResult.countsByChoiceId[agreeChoiceId] ?? 0;
	const valOtherCount = valStatsResult.countsByChoiceId[otherChoiceId] ?? 0;
	const valTotalVotes = valStatsResult.totalResponses;
	const valAgreePercentage = valTotalVotes > 0 ? Math.round((valAgreeCount / valTotalVotes) * 100) : 0;
	const valOtherPercentage = valTotalVotes > 0 ? 100 - valAgreePercentage : 0;

	// Commitment stats
	const commitmentResponses = await db
		.select()
		.from(userResponse)
		.where(eq(userResponse.questionId, commitmentQ.id))
		.all();

	let passiveCount = 0;
	let activeCount = 0;
	let directCount = 0;

	const passiveChoiceId = commitmentQ.ans.choices.find((c) => c.value === 'passive')?.id;
	const activeChoiceId = commitmentQ.ans.choices.find((c) => c.value === 'active')?.id;
	const directChoiceId = commitmentQ.ans.choices.find((c) => c.value === 'direct')?.id;

	for (const resp of commitmentResponses) {
		const choiceIds = (resp.selectedChoiceIds as string[]) ?? [];
		if (passiveChoiceId && choiceIds.includes(passiveChoiceId)) passiveCount++;
		if (activeChoiceId && choiceIds.includes(activeChoiceId)) activeCount++;
		if (directChoiceId && choiceIds.includes(directChoiceId)) directCount++;
	}

	const totalPledges = commitmentResponses.length;

	return {
		totalVotes,
		agreeCount,
		agreePercentage,
		otherCount,
		otherPercentage,
		validated: {
			totalVotes: valTotalVotes,
			agreeCount: valAgreeCount,
			agreePercentage: valAgreePercentage,
			otherCount: valOtherCount,
			otherPercentage: valOtherPercentage
		},
		commitments: {
			totalPledges,
			tiers: {
				passive: {
					label: TIER_LABELS.passive,
					count: passiveCount,
					percentage: totalPledges > 0 ? Math.round((passiveCount / totalPledges) * 100) : 0
				},
				active: {
					label: TIER_LABELS.active,
					count: activeCount,
					percentage: totalPledges > 0 ? Math.round((activeCount / totalPledges) * 100) : 0
				},
				direct: {
					label: TIER_LABELS.direct,
					count: directCount,
					percentage: totalPledges > 0 ? Math.round((directCount / totalPledges) * 100) : 0
				}
			}
		}
	};
}

/**
 * Returns a privacy-safe, paginated list of public votes and commitments.
 */
export async function listPublicVotesAndPledges(
	db: DbClient,
	options: ListVotesOptions = {}
): Promise<{ items: PublicVoteItem[]; total: number; hasMore: boolean }> {
	const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
	const offset = Math.max(options.offset ?? 0, 0);
	const filter = options.filter ?? 'all';

	const hero = await createHeroQuestion();
	const commitmentQ = await createCommitmentQuestion();

	const agreeChoiceId = hero.ans.choices[0].id;
	const otherChoiceId = hero.ans.choices[1].id;

	const choiceValueMap: Record<string, string> = {};
	for (const choice of commitmentQ.ans.choices) {
		choiceValueMap[choice.id] = choice.value;
	}

	// Fetch all responses for both hero and commitment questions
	const [heroResponses, commitmentResponses] = await Promise.all([
		db
			.select()
			.from(userResponse)
			.where(eq(userResponse.questionId, hero.id))
			.orderBy(desc(userResponse.createdAt))
			.all(),
		db
			.select()
			.from(userResponse)
			.where(eq(userResponse.questionId, commitmentQ.id))
			.orderBy(desc(userResponse.createdAt))
			.all()
	]);

	// Build lookup for commitment responses by userId and anonId
	const commitmentsByUser = new Map<string, typeof userResponse.$inferSelect>();
	const commitmentsByAnon = new Map<string, typeof userResponse.$inferSelect>();

	for (const cr of commitmentResponses) {
		if (cr.userId && !commitmentsByUser.has(cr.userId)) {
			commitmentsByUser.set(cr.userId, cr);
		} else if (cr.anonId && !commitmentsByAnon.has(cr.anonId)) {
			commitmentsByAnon.set(cr.anonId, cr);
		}
	}

	// Collect userIds to fetch profiles
	const userIdsToFetch = new Set<string>();
	for (const hr of heroResponses) {
		if (hr.userId) userIdsToFetch.add(hr.userId);
	}
	for (const cr of commitmentResponses) {
		if (cr.userId) userIdsToFetch.add(cr.userId);
	}

	const userMap = new Map<string, { id: string; name: string; image: string | null }>();
	const profileMap = new Map<string, UserProfile>();

	if (userIdsToFetch.size > 0) {
		const userIdsList = Array.from(userIdsToFetch);
		const [users, profiles] = await Promise.all([
			db
				.select({ id: user.id, name: user.name, image: user.image })
				.from(user)
				.where(inArray(user.id, userIdsList))
				.all(),
			db
				.select()
				.from(userProfile)
				.where(inArray(userProfile.userId, userIdsList))
				.all()
		]);

		for (const u of users) {
			userMap.set(u.id, u);
		}
		for (const p of profiles) {
			profileMap.set(p.userId, p);
		}
	}

	// Consolidate into activity records
	// Each unique participant (userId or anonId) becomes an item
	const participantKeysSeen = new Set<string>();
	const allItems: PublicVoteItem[] = [];

	for (const hr of heroResponses) {
		const key = hr.userId ? `user_${hr.userId}` : `anon_${hr.anonId}`;
		if (participantKeysSeen.has(key)) continue;
		participantKeysSeen.add(key);

		const choiceIds = (hr.selectedChoiceIds as string[]) ?? [];
		const isAgree = choiceIds.includes(agreeChoiceId);
		const choice: 'no' | 'yes' = isAgree ? 'no' : 'yes';
		const choiceLabel = isAgree ? "We don't need nukes" : 'Needs discussion / Other';

		// Associated commitment response if any
		const cr = hr.userId
			? commitmentsByUser.get(hr.userId)
			: hr.anonId
			? commitmentsByAnon.get(hr.anonId)
			: undefined;

		const commitmentLevels: string[] = [];
		let feedback: string | null = null;

		if (cr) {
			const cChoiceIds = (cr.selectedChoiceIds as string[]) ?? [];
			for (const cid of cChoiceIds) {
				const val = choiceValueMap[cid];
				if (val) commitmentLevels.push(val);
			}

			if (cr.payloadJson && typeof cr.payloadJson === 'object') {
				const payload = cr.payloadJson as { feedback?: string; name?: string };
				if (payload.feedback && typeof payload.feedback === 'string' && payload.feedback.trim()) {
					feedback = payload.feedback.trim();
				}
			}
		}

		const commitmentLabels = commitmentLevels.map((lvl) => TIER_LABELS[lvl] ?? lvl);
		const isValidated = Boolean(hr.userId);

		// Privacy resolution
		let publicUser: PublicVoteItem['user'] = undefined;
		let isAnonymous = true;

		if (hr.userId) {
			const u = userMap.get(hr.userId);
			const p = profileMap.get(hr.userId);

			if (p?.isPledgePublic) {
				isAnonymous = false;
				const displayName =
					p.isDisplayNamePublic && p.displayName ? p.displayName : u?.name ?? 'Supporter';
				const location = p.isLocationPublic && p.location ? p.location : null;

				publicUser = {
					id: hr.userId,
					name: displayName,
					image: u?.image ?? null,
					location
				};
			} else {
				// Private profile: zero leakage
				isAnonymous = true;
				publicUser = {
					name: 'Verified Citizen',
					image: null,
					location: null
				};
			}
		} else {
			// Anonymous participant
			isAnonymous = true;
			publicUser = {
				name: 'Anonymous Supporter',
				image: null,
				location: null
			};
		}

		// Most recent activity timestamp between hero and commitment
		const latestDate =
			cr && cr.createdAt > hr.createdAt ? cr.createdAt : hr.createdAt;

		allItems.push({
			id: hr.id,
			choice,
			choiceLabel,
			commitmentLevels,
			commitmentLabels,
			isValidated,
			isAnonymous,
			user: publicUser,
			feedback: isAnonymous ? null : feedback,
			createdAt: latestDate.toISOString()
		});
	}

	// Sort by timestamp descending
	allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	// Apply filtering
	let filteredItems = allItems;
	if (filter === 'validated') {
		filteredItems = allItems.filter((item) => item.isValidated);
	} else if (filter === 'pledges') {
		filteredItems = allItems.filter((item) => item.commitmentLevels.length > 0);
	}

	const total = filteredItems.length;
	const paginatedItems = filteredItems.slice(offset, offset + limit);
	const hasMore = offset + limit < total;

	return {
		items: paginatedItems,
		total,
		hasMore
	};
}
