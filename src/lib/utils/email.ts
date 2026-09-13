/**
 * Utility functions for user email addresses.
 */

/**
 * Checks whether an email address is a synthetic placeholder generated for
 * social OAuth providers that do not require or return an email address
 * (e.g. 14611186@twitter.placeholder.invalid or RFC 6761 .invalid domain).
 */
export function isPlaceholderEmail(email?: string | null): boolean {
	if (!email) return false;
	const lower = email.trim().toLowerCase();
	return lower.endsWith('.placeholder.invalid') || lower.endsWith('.invalid');
}
