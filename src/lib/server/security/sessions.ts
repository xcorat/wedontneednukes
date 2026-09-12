import { eq, and, ne } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { session, type schema } from '$lib/server/db/schema.js';

export interface SessionInfo {
	id: string;
	ipAddress: string | null;
	userAgent: string | null;
	browser: string;
	os: string;
	isCurrent: boolean;
	createdAt: Date;
	expiresAt: Date;
}

/**
 * Parses a raw User-Agent string into human-friendly browser and OS labels.
 */
export function parseUserAgent(ua?: string | null): { browser: string; os: string } {
	if (!ua) {
		return { browser: 'Unknown Browser', os: 'Unknown Device' };
	}

	let browser = 'Unknown Browser';
	if (ua.includes('Firefox/')) {
		browser = 'Firefox';
	} else if (ua.includes('Edg/')) {
		browser = 'Microsoft Edge';
	} else if (ua.includes('Chrome/')) {
		browser = 'Chrome';
	} else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
		browser = 'Safari';
	} else if (ua.includes('Opera') || ua.includes('OPR/')) {
		browser = 'Opera';
	}

	let os = 'Unknown Device';
	if (ua.includes('iPhone')) {
		os = 'iPhone';
	} else if (ua.includes('iPad')) {
		os = 'iPad';
	} else if (ua.includes('Android')) {
		os = 'Android';
	} else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
		os = 'macOS';
	} else if (ua.includes('Windows')) {
		os = 'Windows';
	} else if (ua.includes('Linux')) {
		os = 'Linux';
	}

	return { browser, os };
}

/**
 * Fetch all active sessions for a user, indicating which is the current active session.
 */
export async function getUserSessions(
	db: DrizzleD1Database<typeof schema>,
	userId: string,
	currentToken?: string | null
): Promise<SessionInfo[]> {
	const rawSessions = await db
		.select({
			id: session.id,
			token: session.token,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			createdAt: session.createdAt,
			expiresAt: session.expiresAt
		})
		.from(session)
		.where(eq(session.userId, userId));

	return rawSessions
		.map((s) => {
			const { browser, os } = parseUserAgent(s.userAgent);
			return {
				id: s.id,
				ipAddress: s.ipAddress,
				userAgent: s.userAgent,
				browser,
				os,
				isCurrent: Boolean(currentToken && s.token === currentToken),
				createdAt: s.createdAt,
				expiresAt: s.expiresAt
			};
		})
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Revoke a single session belonging to a user.
 */
export async function revokeSession(
	db: DrizzleD1Database<typeof schema>,
	userId: string,
	sessionId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await db
			.delete(session)
			.where(and(eq(session.id, sessionId), eq(session.userId, userId)));

		return { success: true };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Failed to revoke session.';
		return { success: false, error: message };
	}
}

/**
 * Revoke all sessions for a user except the current one.
 */
export async function revokeOtherSessions(
	db: DrizzleD1Database<typeof schema>,
	userId: string,
	currentToken: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await db
			.delete(session)
			.where(and(eq(session.userId, userId), ne(session.token, currentToken)));

		return { success: true };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Failed to revoke other sessions.';
		return { success: false, error: message };
	}
}
