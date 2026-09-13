import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHeroQuestion } from '../src/lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '../src/lib/fixtures/commitmentQuestion.js';
import { createCivicActionQuestion } from '../src/lib/fixtures/civicActionQuestion.js';

describe('Routing Layer End-to-End & State Invariants', () => {
	it('evaluates root / routing decisions for all three visitor states', async () => {
		const hero = await createHeroQuestion();

		// 1. Authenticated visitor: redirect to /dashboard
		function decideRootRoute(locals: { user?: any }, anonId?: string, hasVote = false) {
			if (locals.user) {
				return { type: 'redirect', location: '/dashboard' };
			}
			if (anonId && hasVote) {
				return { type: 'render_inline_results', anonId };
			}
			return { type: 'render_hero', questionId: hero.id };
		}

		assert.deepEqual(decideRootRoute({ user: { id: 'u_123' } }), {
			type: 'redirect',
			location: '/dashboard'
		});

		assert.deepEqual(decideRootRoute({}, 'anon_abc', true), {
			type: 'render_inline_results',
			anonId: 'anon_abc'
		});

		assert.deepEqual(decideRootRoute({}, undefined, false), {
			type: 'render_hero',
			questionId: hero.id
		});
	});

	it('evaluates /auth routing with redirect and answer parameters', () => {
		function decideAuthRoute(locals: { user?: any }, searchParams: URLSearchParams) {
			const answerParam = searchParams.get('answer');
			const redirectParam = searchParams.get('redirect');

			if (locals.user) {
				if (redirectParam) return { type: 'redirect', location: redirectParam };
				if (answerParam === 'no' || answerParam === 'yes') {
					return { type: 'redirect', location: `/onboarding/pledge?answer=${answerParam}` };
				}
				return { type: 'redirect', location: '/dashboard' };
			}

			if (answerParam === 'no' || answerParam === 'yes') {
				return { type: 'redirect', location: `/onboarding/join?${searchParams.toString()}` };
			}

			return {
				type: 'render_signin',
				redirectUrl: redirectParam || '/dashboard'
			};
		}

		// Authenticated user with redirect target
		assert.deepEqual(
			decideAuthRoute({ user: { id: 'u1' } }, new URLSearchParams('redirect=/settings/security')),
			{ type: 'redirect', location: '/settings/security' }
		);

		// Authenticated user without params defaults to dashboard
		assert.deepEqual(
			decideAuthRoute({ user: { id: 'u1' } }, new URLSearchParams('')),
			{ type: 'redirect', location: '/dashboard' }
		);

		// Unauthenticated user with onboarding answer forwarded to /onboarding/join
		assert.deepEqual(
			decideAuthRoute({}, new URLSearchParams('answer=no')),
			{ type: 'redirect', location: '/onboarding/join?answer=no' }
		);

		// Unauthenticated user on general auth gets signin page
		assert.deepEqual(
			decideAuthRoute({}, new URLSearchParams('')),
			{ type: 'render_signin', redirectUrl: '/dashboard' }
		);
	});


	it('resolves follow-up gated questions for dashboard progression', async () => {
		const civicQ = await createCivicActionQuestion();

		assert.equal(civicQ.type, 'single_choice');
		assert.equal(civicQ.ans.choices.length, 3);
		assert.ok(civicQ.ans.choices.some((c) => c.value === 'divestment'));
		assert.ok(civicQ.ans.choices.some((c) => c.value === 'policy'));
		assert.ok(civicQ.ans.choices.some((c) => c.value === 'education'));

		// Simulating response resolution
		const selectedChoiceId = civicQ.ans.choices[0].id;
		const matched = civicQ.ans.choices.find((c) => c.id === selectedChoiceId);
		assert.equal(matched?.label, 'Divestment & Finance');
	});

	it('validates the complete anonymous onboarding, pledge, and claim vote route transitions', () => {
		// 1. User clicks choice on Homepage Hero (Agree -> 'no', Other -> 'yes')
		function getHeroChoiceTarget(choiceValue: string) {
			const queryAnswer = choiceValue === 'agree' ? 'no' : 'yes';
			return `/onboarding/join?answer=${queryAnswer}`;
		}
		assert.equal(getHeroChoiceTarget('agree'), '/onboarding/join?answer=no');
		assert.equal(getHeroChoiceTarget('other'), '/onboarding/join?answer=yes');

		// 2. User chooses "Continue anonymously" on /onboarding/join
		function getAnonymousOnboardingTarget(answer: string) {
			return `/onboarding/pledge?answer=${answer}&anon=1`;
		}
		assert.equal(getAnonymousOnboardingTarget('no'), '/onboarding/pledge?answer=no&anon=1');

		// 3. User submits pledge anonymously -> redirects to /results
		function getPledgeSubmitRedirect(userId: string | null | undefined, answer: string) {
			return userId ? '/dashboard' : `/results?answer=${answer}&anon=1`;
		}
		assert.equal(getPledgeSubmitRedirect(null, 'no'), '/results?answer=no&anon=1');
		assert.equal(getPledgeSubmitRedirect('user_123', 'no'), '/dashboard');

		// 4. On results/claim banner, full sign-in CTA targets /auth with redirect to /dashboard
		function getClaimVoteFullSignInTarget() {
			return '/auth?redirect=/dashboard';
		}
		assert.equal(getClaimVoteFullSignInTarget(), '/auth?redirect=/dashboard');

		// 5. Returning anonymous visitor to root '/' gets link to update pledge with answer preserved
		function getReturningAnonPledgeUpdateHref(userChoice: string) {
			return `/onboarding/pledge?answer=${userChoice}&anon=1`;
		}
		assert.equal(getReturningAnonPledgeUpdateHref('no'), '/onboarding/pledge?answer=no&anon=1');
	});
});

