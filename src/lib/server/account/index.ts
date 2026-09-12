import { eq, and } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { account, user, type schema } from '$lib/server/db/schema.js';

export type SupportedSocialProvider = 'google' | 'github' | 'facebook' | 'twitter';

export const SUPPORTED_PROVIDERS: { id: SupportedSocialProvider; name: string }[] = [
	{ id: 'google', name: 'Google' },
	{ id: 'github', name: 'GitHub' },
	{ id: 'facebook', name: 'Facebook' },
	{ id: 'twitter', name: 'X / Twitter' }
];

export interface LinkedAccountSummary {
	id: string;
	providerId: string;
	accountId: string;
	createdAt: Date;
}

export interface ProviderConnectionStatus {
	providerId: SupportedSocialProvider;
	name: string;
	isConnected: boolean;
	accountId?: string;
	connectedAt?: Date;
	canUnlink: boolean;
}

/**
 * Fetch all linked accounts for a given user from the database.
 */
export async function getUserLinkedAccounts(
	db: DrizzleD1Database<typeof schema>,
	userId: string
): Promise<LinkedAccountSummary[]> {
	const accounts = await db
		.select({
			id: account.id,
			providerId: account.providerId,
			accountId: account.accountId,
			createdAt: account.createdAt
		})
		.from(account)
		.where(eq(account.userId, userId));

	return accounts;
}

/**
 * Get status of all supported social providers for a user,
 * including connection state and whether unlinking is permitted.
 */
export async function getProvidersStatus(
	db: DrizzleD1Database<typeof schema>,
	userId: string,
	userEmail?: string | null
): Promise<ProviderConnectionStatus[]> {
	const linkedAccounts = await getUserLinkedAccounts(db, userId);
	const linkedMap = new Map<string, LinkedAccountSummary>();
	for (const acc of linkedAccounts) {
		linkedMap.set(acc.providerId.toLowerCase(), acc);
	}

	// Calculate if the user has an alternative login method:
	// 1. A registered email address for magic link sign-in.
	// 2. Or more than one linked social provider.
	const hasEmailLogin = Boolean(userEmail && userEmail.trim().length > 0);
	const totalLinkedAccounts = linkedAccounts.length;

	return SUPPORTED_PROVIDERS.map((provider) => {
		const linked = linkedMap.get(provider.id);
		const isConnected = Boolean(linked);

		// Safety check: unlinking is allowed only if the user has another sign-in method:
		// either an email login or at least one other linked social account.
		const canUnlink = isConnected && (hasEmailLogin || totalLinkedAccounts > 1);

		return {
			providerId: provider.id,
			name: provider.name,
			isConnected,
			accountId: linked?.accountId,
			connectedAt: linked?.createdAt,
			canUnlink
		};
	});
}

/**
 * Safely unlink a social provider account for a user.
 * Prevents lockout by checking that the user has at least one other login mechanism.
 */
export async function unlinkSocialAccount(
	db: DrizzleD1Database<typeof schema>,
	userId: string,
	providerId: string
): Promise<{ success: boolean; error?: string }> {
	const normalizedProviderId = providerId.toLowerCase();

	// Fetch user details to check email
	const [currentUser] = await db
		.select({ id: user.id, email: user.email })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!currentUser) {
		return { success: false, error: 'User not found.' };
	}

	const linkedAccounts = await getUserLinkedAccounts(db, userId);
	const targetAccount = linkedAccounts.find(
		(acc) => acc.providerId.toLowerCase() === normalizedProviderId
	);

	if (!targetAccount) {
		return { success: false, error: `No linked account found for provider "${providerId}".` };
	}

	const hasEmailLogin = Boolean(currentUser.email && currentUser.email.trim().length > 0);
	if (!hasEmailLogin && linkedAccounts.length <= 1) {
		return {
			success: false,
			error: 'Cannot disconnect this account. It is your only login method and you have no registered email.'
		};
	}

	// Delete target account
	await db
		.delete(account)
		.where(and(eq(account.userId, userId), eq(account.providerId, targetAccount.providerId)));

	return { success: true };
}
