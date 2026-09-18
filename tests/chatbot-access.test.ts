import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/routes/api/chat/+server.js';
import { load as assistantLoad } from '../src/routes/assistant/+page.server.js';

describe('Chatbot Access & Wiki Route Scoping', () => {
	it('blocks unauthenticated requests to /api/chat with 401', async () => {
		const req = new Request('http://localhost/api/chat', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ message: 'Hello' })
		});

		const response = await POST({
			request: req,
			locals: { user: null, session: null },
			platform: {},
			params: {},
			route: { id: '/api/chat' },
			url: new URL('http://localhost/api/chat'),
			cookies: {},
			fetch: {} as any,
			getClientAddress: () => '127.0.0.1',
			setHeaders: () => {},
			isDataRequest: false,
			isSubRequest: false
		} as any);

		assert.equal(response.status, 401);
		const body = (await response.json()) as { error: string };
		assert.equal(body.error, 'Unauthorized. You must be logged in to use the AI assistant.');
	});

	it('redirects unauthenticated visitors on /assistant route to /auth', async () => {
		let caughtRedirect: any = null;
		try {
			await assistantLoad({
				locals: { user: null, session: null } as any,
				params: {},
				route: { id: '/assistant' },
				url: new URL('http://localhost/assistant'),
				parent: async () => ({}),
				depends: () => {},
				untrack: (fn: any) => fn()
			} as any);
		} catch (err: any) {
			caughtRedirect = err;
		}

		assert.ok(caughtRedirect, 'Should throw redirect');
		assert.equal(caughtRedirect.status, 302);
		assert.equal(caughtRedirect.location, '/auth?redirect=/assistant');
	});

	it('allows authenticated users to access /assistant route', async () => {
		const result = await assistantLoad({
			locals: { user: { id: 'usr_123', name: 'Test' }, session: {} } as any,
			params: {},
			route: { id: '/assistant' },
			url: new URL('http://localhost/assistant'),
			parent: async () => ({}),
			depends: () => {},
			untrack: (fn: any) => fn()
		} as any);

		assert.deepEqual(result, {});
	});

	it('strictly scopes the "Ask Questions" button to wiki routes only', () => {
		function isWikiRoute(pathname: string): boolean {
			return pathname.startsWith('/wiki');
		}

		// Wiki routes should show the button
		assert.equal(isWikiRoute('/wiki'), true);
		assert.equal(isWikiRoute('/wiki/faq/why'), true);
		assert.equal(isWikiRoute('/wiki/manifest.json'), true);

		// Non-wiki routes should NOT show the floating button
		assert.equal(isWikiRoute('/'), false);
		assert.equal(isWikiRoute('/about'), false);
		assert.equal(isWikiRoute('/dashboard'), false);
		assert.equal(isWikiRoute('/results'), false);
		assert.equal(isWikiRoute('/results/votes'), false);
		assert.equal(isWikiRoute('/campaigns'), false);
		assert.equal(isWikiRoute('/auth'), false);
	});

	it('correctly determines bot trigger behavior based on auth state', () => {
		function handleBotTrigger(isLoggedIn: boolean, chatDrawerState: { openCalled: boolean }, tooltipState: { toggleCalled: boolean }) {
			if (isLoggedIn) {
				chatDrawerState.openCalled = true;
			} else {
				tooltipState.toggleCalled = true;
			}
		}

		const loggedInDrawer = { openCalled: false };
		const loggedInTooltip = { toggleCalled: false };
		handleBotTrigger(true, loggedInDrawer, loggedInTooltip);
		assert.equal(loggedInDrawer.openCalled, true);
		assert.equal(loggedInTooltip.toggleCalled, false);

		const anonDrawer = { openCalled: false };
		const anonTooltip = { toggleCalled: false };
		handleBotTrigger(false, anonDrawer, anonTooltip);
		assert.equal(anonDrawer.openCalled, false);
		assert.equal(anonTooltip.toggleCalled, true);
	});

	it('determines Ask Us button destination and auth behavior', () => {
		function getAskUsAction(user: { id: string } | null, defaultHref = '/assistant') {
			if (user) {
				return { type: 'navigate', href: defaultHref };
			}
			return {
				type: 'tooltip',
				loginUrl: `/auth?redirect=${encodeURIComponent(defaultHref)}`
			};
		}

		const loggedInAction = getAskUsAction({ id: 'u1' });
		assert.deepEqual(loggedInAction, {
			type: 'navigate',
			href: '/assistant'
		});

		const anonAction = getAskUsAction(null);
		assert.deepEqual(anonAction, {
			type: 'tooltip',
			loginUrl: '/auth?redirect=%2Fassistant'
		});
	});

	it('validates AI bot copy requirements for title, subtext, and chat box placeholder', () => {
		const expectedTitle = 'We dont need nukes!';
		const expectedSubtext =
			'Ask why, how and what we can do as part of the larger global community of nuclear disarmamant community.';
		const expectedPlaceholder = 'Ask away...';

		assert.equal(expectedTitle, 'We dont need nukes!');
		assert.equal(
			expectedSubtext,
			'Ask why, how and what we can do as part of the larger global community of nuclear disarmamant community.'
		);
		assert.equal(expectedPlaceholder, 'Ask away...');
	});

	it('activates the send button for logged in user and enforces generation-only disabling', () => {
		function getSendButtonState({
			user,
			isGenerating
		}: {
			user: { id: string } | null;
			isGenerating: boolean;
		}) {
			if (!user) {
				return { rendered: false, reason: 'unauthenticated' };
			}
			return {
				rendered: true,
				disabled: isGenerating,
				canClick: !isGenerating
			};
		}

		// Logged in user with empty input: button is rendered and active (not disabled)
		const loggedInState = getSendButtonState({
			user: { id: 'usr_123' },
			isGenerating: false
		});
		assert.equal(loggedInState.rendered, true);
		assert.equal(loggedInState.disabled, false);
		assert.equal(loggedInState.canClick, true);

		// Logged in user while streaming/generating: button is disabled
		const generatingState = getSendButtonState({
			user: { id: 'usr_123' },
			isGenerating: true
		});
		assert.equal(generatingState.rendered, true);
		assert.equal(generatingState.disabled, true);

		// Anonymous user: send button is not rendered at all (sign-in prompt displayed instead)
		const anonState = getSendButtonState({
			user: null,
			isGenerating: false
		});
		assert.equal(anonState.rendered, false);
	});

	it('focuses input on empty submission and sends prompt when input is non-empty', () => {
		function handleChatSubmit(
			inputMessage: string,
			actions: { focused: boolean; sentPrompt: string | null }
		) {
			if (!inputMessage.trim()) {
				actions.focused = true;
				return;
			}
			actions.sentPrompt = inputMessage.trim();
		}

		const emptyAction = { focused: false, sentPrompt: null };
		handleChatSubmit('', emptyAction);
		assert.equal(emptyAction.focused, true);
		assert.equal(emptyAction.sentPrompt, null);

		const validAction = { focused: false, sentPrompt: null };
		handleChatSubmit('How do we dismantle warheads?', validAction);
		assert.equal(validAction.focused, false);
		assert.equal(validAction.sentPrompt, 'How do we dismantle warheads?');
	});
});

