import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	getPublicResultsSummary,
	listPublicVotesAndPledges
} from '../src/lib/server/results/index.js';
import { createHeroQuestion } from '../src/lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '../src/lib/fixtures/commitmentQuestion.js';

describe('Results & Pledges Data Layer & Privacy Guarantees', () => {
	it('enforces zero-leakage privacy on listPublicVotesAndPledges for private users and anonymous voters', async () => {
		const hero = await createHeroQuestion();
		const commitmentQ = await createCommitmentQuestion();

		const agreeChoiceId = hero.ans.choices[0].id;
		const passiveChoiceId = commitmentQ.ans.choices[0].id;

		// Mock responses
		const mockHeroResponses = [
			// User 1: Public profile & pledge
			{
				id: 'resp_h_1',
				questionId: hero.id,
				userId: 'user_public',
				anonId: null,
				selectedChoiceIds: [agreeChoiceId],
				createdAt: new Date('2026-09-01T10:00:00Z')
			},
			// User 2: Private profile & pledge
			{
				id: 'resp_h_2',
				questionId: hero.id,
				userId: 'user_private',
				anonId: null,
				selectedChoiceIds: [agreeChoiceId],
				createdAt: new Date('2026-09-01T11:00:00Z')
			},
			// User 3: Anonymous voter
			{
				id: 'resp_h_3',
				questionId: hero.id,
				userId: null,
				anonId: 'anon_xyz',
				selectedChoiceIds: [agreeChoiceId],
				createdAt: new Date('2026-09-01T12:00:00Z')
			}
		];

		const mockCommitmentResponses = [
			{
				id: 'resp_c_1',
				questionId: commitmentQ.id,
				userId: 'user_public',
				anonId: null,
				selectedChoiceIds: [passiveChoiceId],
				payloadJson: { feedback: 'Peace is the only rational path.' },
				createdAt: new Date('2026-09-01T10:05:00Z')
			},
			{
				id: 'resp_c_2',
				questionId: commitmentQ.id,
				userId: 'user_private',
				anonId: null,
				selectedChoiceIds: [passiveChoiceId],
				payloadJson: { feedback: 'Secret private comment' },
				createdAt: new Date('2026-09-01T11:05:00Z')
			}
		];

		const mockUsers = [
			{ id: 'user_public', name: 'Alice Walker', image: 'https://example.org/alice.jpg' },
			{ id: 'user_private', name: 'Bob Secret', image: 'https://example.org/bob.jpg' }
		];

		const mockProfiles = [
			{
				userId: 'user_public',
				displayName: 'Alice W.',
				isDisplayNamePublic: true,
				location: 'Oslo, Norway',
				isLocationPublic: true,
				isPledgePublic: true
			},
			{
				userId: 'user_private',
				displayName: 'Bob S.',
				isDisplayNamePublic: false,
				location: 'Stockholm, Sweden',
				isLocationPublic: false,
				isPledgePublic: false
			}
		];

		// Construct mock D1 database client matching Drizzle queries
		let callCount = 0;
		const mockDb: any = {
			select: (_fields?: any) => ({
				from: (table: any) => ({
					where: (_cond: any) => ({
						orderBy: (_order: any) => ({
							all: async () => {
								callCount++;
								if (callCount % 2 === 1) return mockHeroResponses;
								return mockCommitmentResponses;
							}
						}),
						all: async () => {
							const name = table?.[Symbol.for('drizzle:Name')];
							if (name === 'user') return mockUsers;
							if (name === 'user_profile') return mockProfiles;
							return [];
						}
					})
				})
			})
		};

		const result = await listPublicVotesAndPledges(mockDb, { limit: 10, offset: 0 });
		assert.equal(result.items.length, 3);

		// Item 1: Anonymous participant
		const anonItem = result.items.find((i) => i.id === 'resp_h_3');
		assert.ok(anonItem);
		assert.equal(anonItem.isValidated, false);
		assert.equal(anonItem.isAnonymous, true);
		assert.equal(anonItem.user?.name, 'Anonymous Supporter');
		assert.equal(anonItem.user?.image, null);
		assert.equal(anonItem.user?.id, undefined);
		assert.equal(anonItem.choice, 'no');
		assert.equal(anonItem.choiceLabel, "We don't need nukes");

		// Item 2: Private registered participant
		const privateItem = result.items.find((i) => i.id === 'resp_h_2');
		assert.ok(privateItem);
		assert.equal(privateItem.isValidated, true);
		assert.equal(privateItem.isAnonymous, true);
		assert.equal(privateItem.user?.name, 'Verified Citizen');
		assert.equal(privateItem.user?.image, null);
		assert.equal(privateItem.user?.id, undefined); // ZERO leakage of profile ID
		assert.equal(privateItem.feedback, null); // Feedback concealed

		// Item 3: Public registered participant
		const publicItem = result.items.find((i) => i.id === 'resp_h_1');
		assert.ok(publicItem);
		assert.equal(publicItem.isValidated, true);
		assert.equal(publicItem.isAnonymous, false);
		assert.equal(publicItem.user?.name, 'Alice W.');
		assert.equal(publicItem.user?.image, 'https://example.org/alice.jpg');
		assert.equal(publicItem.user?.location, 'Oslo, Norway');
		assert.equal(publicItem.user?.id, 'user_public');
		assert.equal(publicItem.feedback, 'Peace is the only rational path.');
		assert.deepEqual(publicItem.commitmentLabels, ['Ally']);
	});

	it('filters by validated and pledges appropriately', async () => {
		const hero = await createHeroQuestion();
		const commitmentQ = await createCommitmentQuestion();

		const agreeChoiceId = hero.ans.choices[0].id;
		const passiveChoiceId = commitmentQ.ans.choices[0].id;

		const mockHeroResponses = [
			{
				id: 'h1',
				questionId: hero.id,
				userId: 'u1',
				anonId: null,
				selectedChoiceIds: [agreeChoiceId],
				createdAt: new Date('2026-09-01T10:00:00Z')
			},
			{
				id: 'h2',
				questionId: hero.id,
				userId: null,
				anonId: 'a2',
				selectedChoiceIds: [agreeChoiceId],
				createdAt: new Date('2026-09-01T11:00:00Z')
			}
		];

		const mockCommitmentResponses = [
			{
				id: 'c1',
				questionId: commitmentQ.id,
				userId: 'u1',
				anonId: null,
				selectedChoiceIds: [passiveChoiceId],
				createdAt: new Date('2026-09-01T10:05:00Z')
			}
			// a2 has no commitment response
		];

		let callCount = 0;
		const mockDb: any = {
			select: () => ({
				from: (table: any) => ({
					where: () => ({
						orderBy: () => ({
							all: async () => {
								callCount++;
								if (callCount % 2 === 1) return mockHeroResponses;
								return mockCommitmentResponses;
							}
						}),
						all: async () => []
					})
				})
			})
		};

		// Test validated filter
		const validatedOnly = await listPublicVotesAndPledges(mockDb, { filter: 'validated' });
		assert.equal(validatedOnly.items.length, 1);
		assert.equal(validatedOnly.items[0].id, 'h1');
		assert.equal(validatedOnly.items[0].isValidated, true);

		// Test pledges filter
		const pledgesOnly = await listPublicVotesAndPledges(mockDb, { filter: 'pledges' });
		assert.equal(pledgesOnly.items.length, 1);
		assert.equal(pledgesOnly.items[0].id, 'h1');
		assert.ok(pledgesOnly.items[0].commitmentLevels.length > 0);
	});
});
