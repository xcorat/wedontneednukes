import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterPublicProfile, sanitizeWebsiteUrl } from '../src/lib/server/profile/index.js';
import type { UserProfile } from '../src/lib/server/db/schema.js';

describe('Website URL sanitization', () => {
	it('normalizes valid https URLs', () => {
		assert.equal(sanitizeWebsiteUrl('https://example.org/about'), 'https://example.org/about');
	});

	it('prepends https:// if scheme is missing', () => {
		assert.equal(sanitizeWebsiteUrl('example.org'), 'https://example.org/');
	});

	it('preserves valid http URLs', () => {
		assert.equal(sanitizeWebsiteUrl('http://localhost:3000'), 'http://localhost:3000/');
	});

	it('returns null for empty or invalid inputs', () => {
		assert.equal(sanitizeWebsiteUrl(''), null);
		assert.equal(sanitizeWebsiteUrl('   '), null);
		assert.equal(sanitizeWebsiteUrl(undefined), null);
		assert.equal(sanitizeWebsiteUrl(null), null);
	});
});

describe('Privacy toggle enforcement and profile filtering', () => {
	const mockTargetUser = {
		id: 'user_123',
		name: 'alice_crypto',
		image: 'https://example.org/alice.jpg',
		createdAt: new Date('2026-01-01T00:00:00Z')
	};

	const mockPledges = [
		{
			id: 'pledge_1',
			campaignId: 'camp_nukes_001',
			campaignTitle: 'Nuclear Disarmament',
			campaignSlug: 'nukes',
			choice: 'no' as const,
			commitmentLevels: ['direct', 'active'],
			createdAt: new Date('2026-01-02T00:00:00Z')
		}
	];

	it('defaults all new profile fields to private (hidden) when profile is null', () => {
		const publicView = filterPublicProfile(mockTargetUser, null, mockPledges, false);

		// Username remains public
		assert.equal(publicView.id, 'user_123');
		assert.equal(publicView.name, 'alice_crypto');
		assert.equal(publicView.isOwner, false);

		// All new fields must be null/empty
		assert.equal(publicView.displayName, null);
		assert.equal(publicView.bio, null);
		assert.equal(publicView.location, null);
		assert.equal(publicView.website, null);
		assert.deepEqual(publicView.pledges, []);
		assert.equal(publicView.privacyToggles, undefined);
	});

	it('hides all fields when toggles are false (default private)', () => {
		const profileWithData: UserProfile = {
			userId: 'user_123',
			displayName: 'Alice In Wonderland',
			isDisplayNamePublic: false,
			bio: 'Peace activist and software architect.',
			isBioPublic: false,
			location: 'Geneva, Switzerland',
			isLocationPublic: false,
			website: 'https://alice.org',
			isWebsitePublic: false,
			isPledgePublic: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const publicView = filterPublicProfile(mockTargetUser, profileWithData, mockPledges, false);

		assert.equal(publicView.name, 'alice_crypto');
		assert.equal(publicView.displayName, null);
		assert.equal(publicView.bio, null);
		assert.equal(publicView.location, null);
		assert.equal(publicView.website, null);
		assert.deepEqual(publicView.pledges, []);
	});

	it('selectively reveals only fields where privacy toggles are explicitly set to true', () => {
		const profileWithSelectiveVisibility: UserProfile = {
			userId: 'user_123',
			displayName: 'Alice In Wonderland',
			isDisplayNamePublic: true, // PUBLIC
			bio: 'Peace activist and software architect.',
			isBioPublic: false, // PRIVATE
			location: 'Geneva, Switzerland',
			isLocationPublic: true, // PUBLIC
			website: 'https://alice.org',
			isWebsitePublic: false, // PRIVATE
			isPledgePublic: true, // PUBLIC
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const publicView = filterPublicProfile(mockTargetUser, profileWithSelectiveVisibility, mockPledges, false);

		assert.equal(publicView.displayName, 'Alice In Wonderland');
		assert.equal(publicView.location, 'Geneva, Switzerland');
		assert.equal(publicView.bio, null); // Remains hidden
		assert.equal(publicView.website, null); // Remains hidden
		assert.equal(publicView.pledges.length, 1);
		assert.equal(publicView.pledges[0].choice, 'no');
	});

	it('returns all profile information and privacy toggles if viewer is owner', () => {
		const privateProfile: UserProfile = {
			userId: 'user_123',
			displayName: 'Alice Private',
			isDisplayNamePublic: false,
			bio: 'Top secret bio.',
			isBioPublic: false,
			location: 'Underground Bunker',
			isLocationPublic: false,
			website: 'https://private.net',
			isWebsitePublic: false,
			isPledgePublic: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const ownerView = filterPublicProfile(mockTargetUser, privateProfile, mockPledges, true);

		assert.equal(ownerView.isOwner, true);
		assert.equal(ownerView.displayName, 'Alice Private');
		assert.equal(ownerView.bio, 'Top secret bio.');
		assert.equal(ownerView.location, 'Underground Bunker');
		assert.equal(ownerView.website, 'https://private.net');
		assert.equal(ownerView.pledges.length, 1);
		assert.deepEqual(ownerView.privacyToggles, {
			isDisplayNamePublic: false,
			isBioPublic: false,
			isLocationPublic: false,
			isWebsitePublic: false,
			isPledgePublic: false
		});
	});
});
