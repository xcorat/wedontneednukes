import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseUserAgent } from '../src/lib/server/security/sessions.js';
import { verifyTurnstileToken } from '../src/lib/server/security/turnstile.js';
import { getAuth } from '../src/lib/server/auth/index.js';

describe('User-Agent parser for active session devices', () => {
	it('identifies Chrome on macOS', () => {
		const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
		const result = parseUserAgent(ua);
		assert.equal(result.browser, 'Chrome');
		assert.equal(result.os, 'macOS');
	});

	it('identifies Safari on iPhone', () => {
		const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
		const result = parseUserAgent(ua);
		assert.equal(result.browser, 'Safari');
		assert.equal(result.os, 'iPhone');
	});

	it('identifies Firefox on Linux', () => {
		const ua = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
		const result = parseUserAgent(ua);
		assert.equal(result.browser, 'Firefox');
		assert.equal(result.os, 'Linux');
	});

	it('identifies Edge on Windows', () => {
		const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
		const result = parseUserAgent(ua);
		assert.equal(result.browser, 'Microsoft Edge');
		assert.equal(result.os, 'Windows');
	});

	it('handles missing or empty user agents gracefully', () => {
		assert.deepEqual(parseUserAgent(null), { browser: 'Unknown Browser', os: 'Unknown Device' });
		assert.deepEqual(parseUserAgent(''), { browser: 'Unknown Browser', os: 'Unknown Device' });
		assert.deepEqual(parseUserAgent(undefined), { browser: 'Unknown Browser', os: 'Unknown Device' });
	});
});

describe('Cloudflare Turnstile token verification', () => {
	it('passes when secretKey is undefined or test key', async () => {
		const res1 = await verifyTurnstileToken(undefined, undefined);
		assert.equal(res1.success, true);

		const res2 = await verifyTurnstileToken('token123', '1x0000000000000000000000000000000AA');
		assert.equal(res2.success, true);
	});

	it('fails when token is missing and production secret is set', async () => {
		const res = await verifyTurnstileToken(null, '0x4AAAAAAABBBBBBBCCCCCCCC');
		assert.equal(res.success, false);
		assert.ok(res.error?.includes('Turnstile verification token is required'));
	});

	it('allows dummy pass token in testing environments', async () => {
		const res = await verifyTurnstileToken('XXXX.DUMMY.TOKEN.XXXX', '0x4AAAAAAABBBBBBBCCCCCCCC');
		assert.equal(res.success, true);
	});
});

describe('Better Auth Two-Factor Configuration', () => {
	const mockD1 = {
		prepare: () => ({
			bind: () => ({
				all: async () => ({ results: [] }),
				first: async () => null,
				run: async () => ({ success: true })
			})
		}),
		batch: async () => [],
		exec: async () => ({ count: 0, duration: 0 })
	} as unknown as App.Platform['env']['DB'];

	it('registers two-factor plugin in Better Auth instance', () => {
		const mockEnv = {
			DB: mockD1,
			BETTER_AUTH_SECRET: 'test_secret_that_is_at_least_32_characters_long',
			BETTER_AUTH_URL: 'http://localhost:5173',
			TURNSTILE_SITE_KEY: 'test_site_key',
			TURNSTILE_SECRET_KEY: 'test_secret_key'
		} as App.Platform['env'];

		const auth = getAuth(mockEnv, 'http://localhost:5173');
		assert.ok(auth);

		// Check that two-factor endpoints are present
		const pluginIds = auth.options.plugins?.map((p: any) => p.id) ?? [];
		assert.ok(pluginIds.includes('two-factor'));
		assert.ok(pluginIds.includes('magic-link'));
	});
});
