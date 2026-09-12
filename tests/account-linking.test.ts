import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_PROVIDERS } from '../src/lib/server/account/index.js';
import { getAuth } from '../src/lib/server/auth/index.js';

describe('Supported Social Providers', () => {
	it('includes Google, GitHub, Facebook, and Twitter / X', () => {
		const providerIds = SUPPORTED_PROVIDERS.map((p) => p.id);
		assert.ok(providerIds.includes('google'));
		assert.ok(providerIds.includes('github'));
		assert.ok(providerIds.includes('facebook'));
		assert.ok(providerIds.includes('twitter'));
		assert.equal(providerIds.length, 4);
	});
});

describe('Better Auth Twitter Provider Integration', () => {
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

	it('configures twitter social provider when client credentials are provided', () => {
		const mockEnv = {
			DB: mockD1,
			BETTER_AUTH_SECRET: 'test_secret_that_is_at_least_32_characters_long',
			BETTER_AUTH_URL: 'http://localhost:5173',
			TURNSTILE_SITE_KEY: 'test_site_key',
			TURNSTILE_SECRET_KEY: 'test_secret_key',
			GITHUB_CLIENT_ID: 'gh_id',
			GITHUB_CLIENT_SECRET: 'gh_secret',
			GOOGLE_CLIENT_ID: 'goog_id',
			GOOGLE_CLIENT_SECRET: 'goog_secret',
			TWITTER_CLIENT_ID: 'twitter_client_id_123',
			TWITTER_CLIENT_SECRET: 'twitter_client_secret_xyz'
		} as App.Platform['env'];

		const auth = getAuth(mockEnv, 'http://localhost:5173');
		assert.ok(auth);
		// Check that socialProviders on options has twitter configured
		const options = auth.options;
		assert.ok(options.socialProviders?.twitter);
		assert.equal(options.socialProviders.twitter.clientId, 'twitter_client_id_123');
		assert.equal(options.socialProviders.twitter.clientSecret, 'twitter_client_secret_xyz');
	});

	it('omits twitter provider when credentials are not supplied', () => {
		const mockEnv = {
			DB: mockD1,
			BETTER_AUTH_SECRET: 'test_secret_that_is_at_least_32_characters_long',
			BETTER_AUTH_URL: 'http://localhost:5173',
			TURNSTILE_SITE_KEY: 'test_site_key',
			TURNSTILE_SECRET_KEY: 'test_secret_key',
			GITHUB_CLIENT_ID: 'gh_id',
			GITHUB_CLIENT_SECRET: 'gh_secret',
			GOOGLE_CLIENT_ID: 'goog_id',
			GOOGLE_CLIENT_SECRET: 'goog_secret'
		} as App.Platform['env'];

		const auth = getAuth(mockEnv, 'http://localhost:5173');
		assert.ok(auth);
		assert.equal(auth.options.socialProviders?.twitter, undefined);
	});

	it('includes twitter in trustedProviders for account linking', () => {
		const mockEnv = {
			DB: mockD1,
			BETTER_AUTH_SECRET: 'test_secret_that_is_at_least_32_characters_long',
			BETTER_AUTH_URL: 'http://localhost:5173',
			TURNSTILE_SITE_KEY: 'test_site_key',
			TURNSTILE_SECRET_KEY: 'test_secret_key',
			GITHUB_CLIENT_ID: 'gh_id',
			GITHUB_CLIENT_SECRET: 'gh_secret',
			GOOGLE_CLIENT_ID: 'goog_id',
			GOOGLE_CLIENT_SECRET: 'goog_secret'
		} as App.Platform['env'];

		const auth = getAuth(mockEnv, 'http://localhost:5173');
		const trusted = auth.options.account?.accountLinking?.trustedProviders;
		assert.ok(Array.isArray(trusted));
		assert.ok(trusted.includes('twitter'));
		assert.ok(trusted.includes('google'));
		assert.ok(trusted.includes('github'));
		assert.ok(trusted.includes('facebook'));
	});
});

describe('Account Unlink Safety Rules', () => {
	it('calculates canUnlink correctly when email is present', () => {
		const hasEmail = Boolean('user@example.org');
		const linkedCount = 1;
		const canUnlink = hasEmail || linkedCount > 1;
		assert.equal(canUnlink, true);
	});

	it('prevents unlinking when user has no email and only 1 linked account', () => {
		const hasEmail = false;
		const linkedCount = 1;
		const canUnlink = hasEmail || linkedCount > 1;
		assert.equal(canUnlink, false);
	});

	it('permits unlinking when user has no email but multiple linked accounts', () => {
		const hasEmail = false;
		const linkedCount = 2;
		const canUnlink = hasEmail || linkedCount > 1;
		assert.equal(canUnlink, true);
	});
});
