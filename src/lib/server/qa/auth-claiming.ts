import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { Cookies } from '@sveltejs/kit';
import { userResponse } from '$lib/server/db/schema';

export const ANON_COOKIE_NAME = 'anon_id';
export const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Reads or generates a persistent anonymous identifier cookie.
 */
export function getOrCreateAnonId(cookies: Cookies): string {
	let anonId = cookies.get(ANON_COOKIE_NAME);
	if (!anonId) {
		anonId = `anon_${crypto.randomUUID().replace(/-/g, '')}`;
		cookies.set(ANON_COOKIE_NAME, anonId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: ANON_COOKIE_MAX_AGE
		});
	}
	return anonId;
}

/**
 * Claims anonymous responses and links them to an authenticated user account.
 * Handles conflicts gracefully if the user has already answered the question.
 */
export async function claimAnonymousResponses(
	db: DrizzleD1Database<any>,
	params: { anonId: string; userId: string }
): Promise<{ claimedCount: number }> {
	const { anonId, userId } = params;
	if (!anonId || !userId) return { claimedCount: 0 };

	const anonResponses = await db
		.select()
		.from(userResponse)
		.where(eq(userResponse.anonId, anonId))
		.all();

	let claimedCount = 0;
	const now = new Date();

	for (const resp of anonResponses) {
		// Check if user already answered this exact question
		const existingUserResponse = await db
			.select()
			.from(userResponse)
			.where(
				and(
					eq(userResponse.userId, userId),
					eq(userResponse.questionId, resp.questionId)
				)
			)
			.get();

		if (!existingUserResponse) {
			// Migrate anonymous response to user account
			await db
				.update(userResponse)
				.set({
					userId,
					anonId: null,
					updatedAt: now
				})
				.where(eq(userResponse.id, resp.id));

			claimedCount++;
		} else {
			// User already answered; remove the redundant anonymous response
			await db
				.delete(userResponse)
				.where(eq(userResponse.id, resp.id));
		}
	}

	return { claimedCount };
}
