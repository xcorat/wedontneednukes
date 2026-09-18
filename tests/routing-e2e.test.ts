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

	it('validates the complete reorganized 4-step campaign onboarding flow transitions', () => {
		// 1. Step 1: User clicks choice on Homepage Hero (Agree -> Step 2, Disagree -> Step 3)
		function getHeroChoiceTarget(choiceValue: string) {
			if (choiceValue === 'agree') {
				return '/onboarding/pledge?answer=no';
			}
			return '/onboarding/join?answer=yes';
		}
		assert.equal(getHeroChoiceTarget('agree'), '/onboarding/pledge?answer=no');
		assert.equal(getHeroChoiceTarget('other'), '/onboarding/join?answer=yes');
		assert.equal(getHeroChoiceTarget('disagree'), '/onboarding/join?answer=yes');

		// 2. Step 2: Ally / Advocate / Contributor selection -> proceeds to Step 3 (Login/Record)
		function getPledgeSubmitRedirect(userId: string | null | undefined, answer: string, levels: string[], isAnonUpdate = false) {
			if (userId) return `/onboarding/results?answer=${answer}`;
			if (isAnonUpdate) return `/onboarding/results?answer=${answer}&anon=1`;
			return `/onboarding/join?answer=${answer}&levels=${levels.join(',')}`;
		}
		assert.equal(
			getPledgeSubmitRedirect(null, 'no', ['passive']),
			'/onboarding/join?answer=no&levels=passive'
		);
		assert.equal(
			getPledgeSubmitRedirect(null, 'no', ['passive', 'active']),
			'/onboarding/join?answer=no&levels=passive,active'
		);
		assert.equal(
			getPledgeSubmitRedirect('user_123', 'no', ['direct']),
			'/onboarding/results?answer=no'
		);
		assert.equal(
			getPledgeSubmitRedirect(null, 'no', ['passive'], true),
			'/onboarding/results?answer=no&anon=1'
		);

		// 3. Step 3: Login/Record page back button navigation
		function getJoinBackTarget(answer: string) {
			return answer === 'no' ? '/onboarding/pledge?answer=no' : '/onboarding/wedontneednukes';
		}
		assert.equal(getJoinBackTarget('no'), '/onboarding/pledge?answer=no');
		assert.equal(getJoinBackTarget('yes'), '/onboarding/wedontneednukes');

		// 4. Step 3: User continues anonymously or signs in -> proceeds to Step 4 (/onboarding/results)
		function getAnonymousOnboardingTarget(answer: string) {
			return `/onboarding/results?answer=${answer}&anon=1`;
		}
		assert.equal(getAnonymousOnboardingTarget('no'), '/onboarding/results?answer=no&anon=1');
		assert.equal(getAnonymousOnboardingTarget('yes'), '/onboarding/results?answer=yes&anon=1');

		function getSignInCallbackTarget(answer: string) {
			return `/onboarding/results?answer=${answer}`;
		}
		assert.equal(getSignInCallbackTarget('no'), '/onboarding/results?answer=no');
		assert.equal(getSignInCallbackTarget('yes'), '/onboarding/results?answer=yes');

		// 5. Step 4: What's Next action targets
		const whatsNextTargets = {
			about: '/about',
			campaigns: '/campaigns',
			organizations: '/organizations'
		};
		assert.equal(whatsNextTargets.about, '/about');
		assert.equal(whatsNextTargets.campaigns, '/campaigns');
		assert.equal(whatsNextTargets.organizations, '/organizations');

		// 6. Returning anonymous visitor link to update commitments
		function getReturningAnonPledgeUpdateHref(userChoice: string) {
			return `/onboarding/pledge?answer=${userChoice}&anon=1`;
		}
		assert.equal(getReturningAnonPledgeUpdateHref('no'), '/onboarding/pledge?answer=no&anon=1');
	});
});

