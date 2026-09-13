import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreateAnonId, ANON_COOKIE_NAME, claimAnonymousResponses } from '../src/lib/server/qa/auth-claiming.js';
import { createCommitmentQuestion, commitmentViewModel } from '../src/lib/fixtures/commitmentQuestion.js';
import type { Cookies } from '@sveltejs/kit';

describe('Anonymous Identity Cookie', () => {
	it('generates a new anon_id cookie when not present', () => {
		const cookieStore = new Map<string, string>();
		let setCall: any = null;

		const mockCookies = {
			get: (name: string) => cookieStore.get(name),
			set: (name: string, value: string, opts: any) => {
				cookieStore.set(name, value);
				setCall = { name, value, opts };
			}
		} as unknown as Cookies;

		const anonId = getOrCreateAnonId(mockCookies);
		assert.ok(anonId.startsWith('anon_'));
		assert.equal(setCall.name, ANON_COOKIE_NAME);
		assert.equal(setCall.opts.httpOnly, true);
		assert.equal(setCall.opts.sameSite, 'lax');
		assert.ok(setCall.opts.maxAge > 0);
	});

	it('returns existing anon_id cookie when present', () => {
		const existing = 'anon_test1234567890';
		const mockCookies = {
			get: (name: string) => (name === ANON_COOKIE_NAME ? existing : undefined),
			set: () => {
				assert.fail('Should not set cookie when already present');
			}
		} as unknown as Cookies;

		const anonId = getOrCreateAnonId(mockCookies);
		assert.equal(anonId, existing);
	});
});

describe('Commitment Question Fixture & View Model', () => {
	it('generates a valid multi_choice commitmentQuestion with content hashes', async () => {
		const q = await createCommitmentQuestion();

		assert.equal(q.type, 'multi_choice');
		assert.equal(q.text, 'How would you like to participate?');
		assert.ok(q.id.startsWith('q_'));
		assert.ok(q.textHash.startsWith('qt_'));
		assert.ok(q.answerSetHash.startsWith('as_'));
		assert.equal(q.contentSha256.length, 64);
		assert.equal(q.isActive, true);

		// Choices check
		assert.equal(q.ans.choices.length, 3);
		const values = q.ans.choices.map((c) => c.value);
		assert.deepEqual(values, ['passive', 'active', 'direct']);

		for (const choice of q.ans.choices) {
			assert.ok(choice.id.startsWith('opt_'));
			assert.ok(choice.labelHash.startsWith('al_'));
		}
	});

	it('maps commitmentViewModel with card layout and badge styles', async () => {
		const q = await createCommitmentQuestion();
		const vm = commitmentViewModel(q);

		assert.equal(vm.ui.layout, 'card');
		assert.equal(vm.ui.submitBehavior, 'manual');
		assert.equal(vm.ui.choiceStyles?.passive?.badge, 'Inform');
		assert.equal(vm.ui.choiceStyles?.active?.badge, 'Advocate');
		assert.equal(vm.ui.choiceStyles?.direct?.badge, 'Organize');
	});
});

describe('Anonymous Claiming Unit Logic', () => {
	it('returns claimedCount 0 when either anonId or userId is empty', async () => {
		const mockDb = {} as any;
		const r1 = await claimAnonymousResponses(mockDb, { anonId: '', userId: 'u1' });
		assert.equal(r1.claimedCount, 0);

		const r2 = await claimAnonymousResponses(mockDb, { anonId: 'a1', userId: '' });
		assert.equal(r2.claimedCount, 0);
	});
});
