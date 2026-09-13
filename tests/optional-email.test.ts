import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { user } from '../src/lib/server/db/schema.js';
import { getAuth } from '../src/lib/server/auth/index.js';
import { getProvidersStatus } from '../src/lib/server/account/index.js';

describe('Optional User Email & Social Sign-In Support', () => {
	it('defines email column as nullable in user schema', () => {
		// Verify email column does not enforce notNull
		assert.equal(user.email.notNull, false);
	});

	it('configures Twitter and Facebook providers with safe email mapping', () => {
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

		const mockEnv = {
			DB: mockD1,
			BETTER_AUTH_SECRET: 'test_secret_that_is_at_least_32_characters_long',
			BETTER_AUTH_URL: 'http://localhost:5173',
			TWITTER_CLIENT_ID: 'tw_client_id',
			TWITTER_CLIENT_SECRET: 'tw_client_secret',
			FACEBOOK_APP_ID: 'fb_app_id',
			FACEBOOK_APP_SECRET: 'fb_app_secret'
		} as App.Platform['env'];

		const auth = getAuth(mockEnv, 'http://localhost:5173');
		assert.ok(auth);

		const socialProviders = (auth.options as any).socialProviders;
		assert.ok(socialProviders.twitter);
		assert.ok(socialProviders.facebook);

		// Test mapProfileToUser for Twitter (no email in profile)
		const twitterUser = socialProviders.twitter.mapProfileToUser({
			data: { id: '14611186', name: 'TwitterUser' }
		});
		assert.equal(twitterUser.email, '14611186@twitter.placeholder.invalid');
		assert.equal(twitterUser.emailVerified, false);

		// Test mapProfileToUser for Twitter (with email in profile)
		const twitterUserWithEmail = socialProviders.twitter.mapProfileToUser({
			data: { id: '14611186', name: 'TwitterUser', email: 'twitter@example.com' }
		});
		assert.equal(twitterUserWithEmail.email, 'twitter@example.com');
		assert.equal(twitterUserWithEmail.emailVerified, true);

		// Test mapProfileToUser for Facebook without email (phone signup)
		const fbUserNoEmail = socialProviders.facebook.mapProfileToUser({ id: 'fb_123', name: 'FBUser' });
		assert.equal(fbUserNoEmail.email, 'fb_123@facebook.placeholder.invalid');
		assert.equal(fbUserNoEmail.emailVerified, false);

		// Test mapProfileToUser for Facebook with email
		const fbUserWithEmail = socialProviders.facebook.mapProfileToUser({
			id: 'fb_123',
			name: 'FBUser',
			email: 'user@example.com'
		});
		assert.equal(fbUserWithEmail.email, 'user@example.com');
		assert.equal(fbUserWithEmail.emailVerified, true);
	});

	it('safely handles unlinking rules when user has null or empty email', async () => {
		// Mock db returning 1 linked account
		const mockDbSingle = {
			select: () => ({
				from: () => ({
					where: async () => [
						{ id: 'acc_1', providerId: 'twitter', accountId: 'tw_123', createdAt: new Date() }
					]
				})
			})
		} as any;

		const statusesSingle = await getProvidersStatus(mockDbSingle, 'usr_1', null);
		const twitterSingle = statusesSingle.find((p) => p.providerId === 'twitter');
		assert.ok(twitterSingle?.isConnected);
		// Single login method and NO email -> cannot unlink (would be locked out)
		assert.equal(twitterSingle?.canUnlink, false);

		// Mock db returning 2 linked accounts
		const mockDbMultiple = {
			select: () => ({
				from: () => ({
					where: async () => [
						{ id: 'acc_1', providerId: 'twitter', accountId: 'tw_123', createdAt: new Date() },
						{ id: 'acc_2', providerId: 'github', accountId: 'gh_456', createdAt: new Date() }
					]
				})
			})
		} as any;

		const statusesMultiple = await getProvidersStatus(mockDbMultiple, 'usr_1', null);
		const twitterMultiple = statusesMultiple.find((p) => p.providerId === 'twitter');
		assert.ok(twitterMultiple?.isConnected);
		// Multiple login methods even with NO email -> CAN unlink
		assert.equal(twitterMultiple?.canUnlink, true);
	});

	it('safely handles unlinking rules when user has a placeholder email', async () => {
		const mockDbSingle = {
			select: () => ({
				from: () => ({
					where: async () => [
						{ id: 'acc_1', providerId: 'twitter', accountId: 'tw_123', createdAt: new Date() }
					]
				})
			})
		} as any;

		// Single login method and PLACEHOLDER email -> cannot unlink (would be locked out)
		const statusesSingle = await getProvidersStatus(
			mockDbSingle,
			'usr_1',
			'14611186@twitter.placeholder.invalid'
		);
		const twitterSingle = statusesSingle.find((p) => p.providerId === 'twitter');
		assert.ok(twitterSingle?.isConnected);
		assert.equal(twitterSingle?.canUnlink, false);
	});
});
