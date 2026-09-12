import { and, eq } from 'drizzle-orm';
import { campaign, pledge, user, userProfile, type UserProfile } from '$lib/server/db/schema.js';
import type { getDb } from '$lib/server/db/client.js';

export type DbClient = ReturnType<typeof getDb>;

export interface ProfileInputData {
	displayName?: string | null;
	isDisplayNamePublic?: boolean;
	bio?: string | null;
	isBioPublic?: boolean;
	location?: string | null;
	isLocationPublic?: boolean;
	website?: string | null;
	isWebsitePublic?: boolean;
	isPledgePublic?: boolean;
}

export interface UserPledgeInfo {
	id: string;
	campaignId: string;
	campaignTitle: string;
	campaignSlug: string;
	choice: 'no' | 'yes';
	commitmentLevels: string[];
	createdAt: Date;
}

export interface PublicProfileView {
	id: string;
	name: string;
	image: string | null;
	memberSince: Date;
	isOwner: boolean;
	displayName: string | null;
	bio: string | null;
	location: string | null;
	website: string | null;
	pledges: UserPledgeInfo[];
	// Privacy toggle states (only populated if viewer is owner)
	privacyToggles?: {
		isDisplayNamePublic: boolean;
		isBioPublic: boolean;
		isLocationPublic: boolean;
		isWebsitePublic: boolean;
		isPledgePublic: boolean;
	};
}

/**
 * Normalizes and validates website URLs.
 * Ensures the URL uses http:// or https:// protocol.
 */
export function sanitizeWebsiteUrl(url?: string | null): string | null {
	if (!url) return null;
	const trimmed = url.trim();
	if (!trimmed) return null;

	// Check if already has valid scheme
	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const parsed = new URL(trimmed);
			return parsed.href;
		} catch {
			return null;
		}
	}

	// Try prepending https://
	try {
		const parsed = new URL(`https://${trimmed}`);
		return parsed.href;
	} catch {
		return null;
	}
}

/**
 * Pure function: filters user profile and pledges based on privacy toggles and owner state.
 * Guaranteed zero leakage of private fields to unauthorized viewers.
 */
export function filterPublicProfile(
	targetUser: { id: string; name: string; image: string | null; createdAt: Date },
	profile: UserProfile | null,
	pledges: UserPledgeInfo[],
	isOwner: boolean
): PublicProfileView {
	if (isOwner) {
		return {
			id: targetUser.id,
			name: targetUser.name,
			image: targetUser.image,
			memberSince: targetUser.createdAt,
			isOwner: true,
			displayName: profile?.displayName ?? null,
			bio: profile?.bio ?? null,
			location: profile?.location ?? null,
			website: profile?.website ?? null,
			pledges,
			privacyToggles: {
				isDisplayNamePublic: profile?.isDisplayNamePublic ?? false,
				isBioPublic: profile?.isBioPublic ?? false,
				isLocationPublic: profile?.isLocationPublic ?? false,
				isWebsitePublic: profile?.isWebsitePublic ?? false,
				isPledgePublic: profile?.isPledgePublic ?? false
			}
		};
	}

	// Public viewer: strictly filter according to toggles (defaulting to false / private)
	const isDisplayNamePublic = profile?.isDisplayNamePublic === true;
	const isBioPublic = profile?.isBioPublic === true;
	const isLocationPublic = profile?.isLocationPublic === true;
	const isWebsitePublic = profile?.isWebsitePublic === true;
	const isPledgePublic = profile?.isPledgePublic === true;

	return {
		id: targetUser.id,
		name: targetUser.name,
		image: targetUser.image,
		memberSince: targetUser.createdAt,
		isOwner: false,
		displayName: isDisplayNamePublic && profile?.displayName ? profile.displayName : null,
		bio: isBioPublic && profile?.bio ? profile.bio : null,
		location: isLocationPublic && profile?.location ? profile.location : null,
		website: isWebsitePublic && profile?.website ? profile.website : null,
		pledges: isPledgePublic ? pledges : []
	};
}

/**
 * Fetch or initialize a user profile. All privacy toggles default to private (false).
 */
export async function getOrCreateUserProfile(db: DbClient, userId: string): Promise<UserProfile> {
	const [existing] = await db
		.select()
		.from(userProfile)
		.where(eq(userProfile.userId, userId))
		.limit(1);

	if (existing) {
		return existing;
	}

	const now = new Date();
	const newProfile: UserProfile = {
		userId,
		displayName: null,
		isDisplayNamePublic: false,
		bio: null,
		isBioPublic: false,
		location: null,
		isLocationPublic: false,
		website: null,
		isWebsitePublic: false,
		isPledgePublic: false,
		createdAt: now,
		updatedAt: now
	};

	await db
		.insert(userProfile)
		.values(newProfile)
		.onConflictDoNothing();

	const [created] = await db
		.select()
		.from(userProfile)
		.where(eq(userProfile.userId, userId))
		.limit(1);

	return created ?? newProfile;
}

/**
 * Update user profile details and privacy toggles.
 */
export async function updateUserProfile(
	db: DbClient,
	userId: string,
	data: ProfileInputData
): Promise<UserProfile> {
	// Ensure the profile row exists
	await getOrCreateUserProfile(db, userId);

	const now = new Date();
	const sanitizedWebsite = sanitizeWebsiteUrl(data.website);

	const updatePayload: Partial<UserProfile> = {
		updatedAt: now
	};

	if (data.displayName !== undefined) {
		updatePayload.displayName = data.displayName?.trim().slice(0, 50) || null;
	}
	if (data.isDisplayNamePublic !== undefined) {
		updatePayload.isDisplayNamePublic = Boolean(data.isDisplayNamePublic);
	}
	if (data.bio !== undefined) {
		updatePayload.bio = data.bio?.trim().slice(0, 500) || null;
	}
	if (data.isBioPublic !== undefined) {
		updatePayload.isBioPublic = Boolean(data.isBioPublic);
	}
	if (data.location !== undefined) {
		updatePayload.location = data.location?.trim().slice(0, 100) || null;
	}
	if (data.isLocationPublic !== undefined) {
		updatePayload.isLocationPublic = Boolean(data.isLocationPublic);
	}
	if (data.website !== undefined) {
		updatePayload.website = sanitizedWebsite;
	}
	if (data.isWebsitePublic !== undefined) {
		updatePayload.isWebsitePublic = Boolean(data.isWebsitePublic);
	}
	if (data.isPledgePublic !== undefined) {
		updatePayload.isPledgePublic = Boolean(data.isPledgePublic);
	}

	await db
		.update(userProfile)
		.set(updatePayload)
		.where(eq(userProfile.userId, userId));

	const [updated] = await db
		.select()
		.from(userProfile)
		.where(eq(userProfile.userId, userId))
		.limit(1);

	return updated;
}

/**
 * Fetch all pledges submitted by a given user, including campaign details.
 */
export async function getUserPledges(db: DbClient, userId: string): Promise<UserPledgeInfo[]> {
	const records = await db
		.select({
			id: pledge.id,
			campaignId: campaign.id,
			campaignTitle: campaign.title,
			campaignSlug: campaign.slug,
			choice: pledge.choice,
			commitmentLevel: pledge.commitmentLevel,
			responses: pledge.responses,
			createdAt: pledge.createdAt
		})
		.from(pledge)
		.innerJoin(campaign, eq(pledge.campaignId, campaign.id))
		.where(eq(pledge.userId, userId));

	return records.map((r) => {
		let commitmentLevels: string[] = [];
		if (r.responses && typeof r.responses === 'object') {
			const res = r.responses as { commitmentLevels?: string[] };
			if (Array.isArray(res.commitmentLevels) && res.commitmentLevels.length > 0) {
				commitmentLevels = res.commitmentLevels;
			}
		}
		if (commitmentLevels.length === 0 && r.commitmentLevel) {
			commitmentLevels = [r.commitmentLevel];
		}

		return {
			id: r.id,
			campaignId: r.campaignId,
			campaignTitle: r.campaignTitle,
			campaignSlug: r.campaignSlug,
			choice: r.choice as 'no' | 'yes',
			commitmentLevels,
			createdAt: r.createdAt
		};
	});
}

/**
 * Fetches a profile view for display.
 * Strips private fields if the viewer is not the profile owner.
 */
export async function getPublicUserProfile(
	db: DbClient,
	targetUserId: string,
	viewerUserId?: string | null
): Promise<PublicProfileView | null> {
	const [targetUser] = await db
		.select({
			id: user.id,
			name: user.name,
			image: user.image,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.id, targetUserId))
		.limit(1);

	if (!targetUser) {
		return null;
	}

	const [profile] = await db
		.select()
		.from(userProfile)
		.where(eq(userProfile.userId, targetUserId))
		.limit(1);

	const isOwner = Boolean(viewerUserId && viewerUserId === targetUserId);
	const pledges = await getUserPledges(db, targetUserId);

	return filterPublicProfile(targetUser, profile ?? null, pledges, isOwner);
}
