import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	OFFICIAL_CHANNELS,
	DEFAULT_SHARE_HASHTAGS,
	DEFAULT_SHARE_TEXT,
	buildXShareUrl,
	buildBlueskyShareUrl,
	buildFacebookShareUrl,
	buildThreadsShareUrl,
	buildWhatsAppShareUrl,
	buildLinkedInShareUrl,
	buildShareUrl
} from '../src/lib/constants/social.js';

describe('Official Social Channels configuration', () => {
	it('defines Facebook, X, Bluesky, and TikTok official profiles', () => {
		assert.equal(OFFICIAL_CHANNELS.facebook.url, 'https://www.facebook.com/wedontneednukes');
		assert.equal(OFFICIAL_CHANNELS.x.url, 'https://x.com/wedontneednukes');
		assert.equal(OFFICIAL_CHANNELS.bluesky.url, 'https://bsky.app/profile/wedontneednukes.bsky.social');
		assert.equal(OFFICIAL_CHANNELS.tiktok.url, 'https://www.tiktok.com/@wedontneednukes');
	});

	it('configures default hashtags strictly to #WeDontNeedNukes and never NuclearBan', () => {
		assert.deepEqual(DEFAULT_SHARE_HASHTAGS, ['WeDontNeedNukes']);
		assert.ok(!DEFAULT_SHARE_HASHTAGS.includes('NuclearBan' as any));
	});
});

describe('Social Share URL builders', () => {
	const testUrl = 'https://wedontneednukes.org/results?answer=no';
	const customText = 'Check out this nuclear disarmament campaign!';
	const customHashtags = ['Peace', 'NoNukes'];

	it('builds X / Twitter share intent URL with query params', () => {
		const shareUrl = buildXShareUrl({ url: testUrl, text: customText, hashtags: customHashtags });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.origin, 'https://twitter.com');
		assert.equal(parsed.pathname, '/intent/tweet');
		assert.equal(parsed.searchParams.get('url'), testUrl);
		assert.equal(parsed.searchParams.get('text'), customText);
		assert.equal(parsed.searchParams.get('hashtags'), 'Peace,NoNukes');
	});

	it('strips leading # from hashtags in X share intent', () => {
		const shareUrl = buildXShareUrl({ url: testUrl, hashtags: ['#WeDontNeedNukes', 'TPNW'] });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.searchParams.get('hashtags'), 'WeDontNeedNukes,TPNW');
	});

	it('builds Bluesky compose intent URL with combined text, hashtags, and URL', () => {
		const shareUrl = buildBlueskyShareUrl({ url: testUrl, text: customText, hashtags: customHashtags });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.origin, 'https://bsky.app');
		assert.equal(parsed.pathname, '/intent/compose');
		const textParam = parsed.searchParams.get('text');
		assert.ok(textParam?.includes(customText));
		assert.ok(textParam?.includes('#Peace #NoNukes'));
		assert.ok(textParam?.includes(testUrl));
	});

	it('builds Facebook share dialog URL', () => {
		const shareUrl = buildFacebookShareUrl({ url: testUrl });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.origin, 'https://www.facebook.com');
		assert.equal(parsed.pathname, '/sharer/sharer.php');
		assert.equal(parsed.searchParams.get('u'), testUrl);
	});

	it('builds Threads share intent URL', () => {
		const shareUrl = buildThreadsShareUrl({ url: testUrl, text: customText });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.origin, 'https://www.threads.net');
		assert.equal(parsed.pathname, '/intent/post');
		const textParam = parsed.searchParams.get('text');
		assert.ok(textParam?.includes(customText));
		assert.ok(textParam?.includes(testUrl));
	});

	it('builds WhatsApp send intent URL', () => {
		const shareUrl = buildWhatsAppShareUrl({ url: testUrl, text: customText });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.origin, 'https://api.whatsapp.com');
		assert.equal(parsed.pathname, '/send');
		assert.equal(parsed.searchParams.get('text'), `${customText} ${testUrl}`);
	});

	it('builds LinkedIn share-offsite URL', () => {
		const shareUrl = buildLinkedInShareUrl({ url: testUrl });
		const parsed = new URL(shareUrl);
		assert.equal(parsed.origin, 'https://www.linkedin.com');
		assert.equal(parsed.pathname, '/sharing/share-offsite/');
		assert.equal(parsed.searchParams.get('url'), testUrl);
	});

	it('delegates correctly through buildShareUrl generic resolver', () => {
		const xUrl = buildShareUrl('x', { url: testUrl });
		assert.ok(xUrl.startsWith('https://twitter.com/intent/tweet'));

		const bskyUrl = buildShareUrl('bluesky', { url: testUrl });
		assert.ok(bskyUrl.startsWith('https://bsky.app/intent/compose'));

		const fbUrl = buildShareUrl('facebook', { url: testUrl });
		assert.ok(fbUrl.startsWith('https://www.facebook.com/sharer/sharer.php'));
	});
});
