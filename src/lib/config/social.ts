/**
 * Social channels and sharing configuration for We Don't Need Nukes.
 */

export const OFFICIAL_CHANNELS = {
	facebook: {
		name: 'Facebook',
		handle: 'wedontneednukes',
		url: 'https://www.facebook.com/wedontneednukes'
	},
	x: {
		name: 'X (Twitter)',
		handle: '@wedontneednukes',
		url: 'https://x.com/wedontneednukes'
	},
	bluesky: {
		name: 'Bluesky',
		handle: 'wedontneednukes.bsky.social',
		url: 'https://bsky.app/profile/wedontneednukes.bsky.social'
	},
	tiktok: {
		name: 'TikTok',
		handle: '@wedontneednukes',
		url: 'https://www.tiktok.com/@wedontneednukes'
	}
} as const;

export type OfficialChannelKey = keyof typeof OFFICIAL_CHANNELS;

export const DEFAULT_SHARE_HASHTAGS = ['WeDontNeedNukes'] as const;

export const DEFAULT_SHARE_TEXT =
	"We don't need nukes. One fundamental premise. See where the world stands and record your perspective:";

export const RESULTS_SHARE_TEXT =
	"I just cast my vote on We Don't Need Nukes. See live community results and take a stand:";

export type SharePlatform = 'x' | 'bluesky' | 'facebook' | 'threads' | 'whatsapp' | 'linkedin';

export interface ShareUrlOptions {
	url: string;
	text?: string;
	hashtags?: readonly string[] | string[];
	title?: string;
}

/**
 * Strips leading '#' if provided in hashtags list
 */
function cleanHashtag(tag: string): string {
	return tag.replace(/^#/, '').trim();
}

/**
 * Builds the URL for X / Twitter web intent.
 */
export function buildXShareUrl({
	url,
	text = DEFAULT_SHARE_TEXT,
	hashtags = DEFAULT_SHARE_HASHTAGS
}: ShareUrlOptions): string {
	const params = new URLSearchParams();
	if (text) params.set('text', text);
	if (url) params.set('url', url);
	if (hashtags && hashtags.length > 0) {
		params.set('hashtags', hashtags.map(cleanHashtag).filter(Boolean).join(','));
	}
	return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Builds the URL for Bluesky compose intent.
 */
export function buildBlueskyShareUrl({
	url,
	text = DEFAULT_SHARE_TEXT,
	hashtags = DEFAULT_SHARE_HASHTAGS
}: ShareUrlOptions): string {
	const tagsStr =
		hashtags && hashtags.length > 0
			? ' ' + hashtags.map(cleanHashtag).filter(Boolean).map((t) => `#${t}`).join(' ')
			: '';
	const combined = `${text}${tagsStr} ${url}`.trim();
	return `https://bsky.app/intent/compose?text=${encodeURIComponent(combined)}`;
}

/**
 * Builds the URL for Facebook sharer dialog.
 */
export function buildFacebookShareUrl({ url }: ShareUrlOptions): string {
	const params = new URLSearchParams();
	if (url) params.set('u', url);
	return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Builds the URL for Threads post intent.
 */
export function buildThreadsShareUrl({
	url,
	text = DEFAULT_SHARE_TEXT,
	hashtags = DEFAULT_SHARE_HASHTAGS
}: ShareUrlOptions): string {
	const tagsStr =
		hashtags && hashtags.length > 0
			? ' ' + hashtags.map(cleanHashtag).filter(Boolean).map((t) => `#${t}`).join(' ')
			: '';
	const combined = `${text}${tagsStr} ${url}`.trim();
	return `https://www.threads.net/intent/post?text=${encodeURIComponent(combined)}`;
}

/**
 * Builds the URL for WhatsApp send intent.
 */
export function buildWhatsAppShareUrl({ url, text = DEFAULT_SHARE_TEXT }: ShareUrlOptions): string {
	const combined = `${text} ${url}`.trim();
	return `https://api.whatsapp.com/send?text=${encodeURIComponent(combined)}`;
}

/**
 * Builds the URL for LinkedIn share-offsite.
 */
export function buildLinkedInShareUrl({ url }: ShareUrlOptions): string {
	const params = new URLSearchParams();
	if (url) params.set('url', url);
	return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Generic resolver for any supported share platform.
 */
export function buildShareUrl(platform: SharePlatform, options: ShareUrlOptions): string {
	switch (platform) {
		case 'x':
			return buildXShareUrl(options);
		case 'bluesky':
			return buildBlueskyShareUrl(options);
		case 'facebook':
			return buildFacebookShareUrl(options);
		case 'threads':
			return buildThreadsShareUrl(options);
		case 'whatsapp':
			return buildWhatsAppShareUrl(options);
		case 'linkedin':
			return buildLinkedInShareUrl(options);
	}
}
