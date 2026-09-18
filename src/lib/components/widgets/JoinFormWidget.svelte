<script lang="ts">
	import Turnstile from '$lib/components/Turnstile.svelte';

	interface Props {
		answer: 'no' | 'yes' | string;
		turnstileSiteKey?: string;
		callbackUrl?: string;
		allowAnonymous?: boolean;
		variant?: 'card' | 'compact' | 'inline';
		stepLabel?: string;
		title?: string;
		subtitle?: string;
		onAnonymous?: () => void;
		onSuccess?: () => void;
		class?: string;
	}

	let {
		answer,
		turnstileSiteKey = '',
		callbackUrl,
		allowAnonymous = true,
		variant = 'card',
		stepLabel = 'Step 3 of 4 · Record',
		title,
		subtitle,
		onAnonymous,
		onSuccess,
		class: className = ''
	}: Props = $props();

	const answeredNo = $derived(answer === 'no');

	const headline = $derived(
		title ?? (answer ? 'Record your voice!' : 'Welcome back')
	);

	const sub = $derived(
		subtitle ??
			(answer
				? 'Sign in and validate that you are real. You can also continue anonymously.'
				: 'Sign in to access your account and preferences.')
	);

	const resolvedCallbackUrl = $derived(
		callbackUrl ?? (answer ? `/onboarding/results?answer=${answer}` : '/dashboard')
	);

	let email = $state('');
	let isSubmitting = $state(false);
	let activeProvider = $state<'github' | 'google' | 'facebook' | 'twitter' | null>(null);
	let emailSent = $state(false);
	let errorMessage = $state<string | null>(null);
	let turnstileToken = $state<string | null>(null);

	async function handleEmailSignIn(e: SubmitEvent) {
		e.preventDefault();
		if (!email || isSubmitting) return;

		isSubmitting = true;
		errorMessage = null;

		try {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json'
			};
			if (turnstileToken) {
				headers['cf-turnstile-response'] = turnstileToken;
			}

			const res = await fetch('/api/auth/sign-in/magic-link', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					email: email.trim(),
					callbackURL: resolvedCallbackUrl,
					turnstileToken
				})
			});

			if (!res.ok) {
				const errorData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(errorData.message || 'Failed to send one-time link. Please try again.');
			}

			const resData = (await res.json().catch(() => ({}))) as { twoFactorRedirect?: boolean };
			if (resData?.twoFactorRedirect) {
				window.location.href = `/auth/two-factor?callbackURL=${encodeURIComponent(resolvedCallbackUrl)}`;
				return;
			}

			emailSent = true;
			onSuccess?.();
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
		} finally {
			isSubmitting = false;
		}
	}

	async function socialLogin(provider: 'github' | 'google' | 'facebook' | 'twitter') {
		if (isSubmitting) return;
		isSubmitting = true;
		activeProvider = provider;
		errorMessage = null;

		try {
			const res = await fetch('/api/auth/sign-in/social', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					provider,
					callbackURL: resolvedCallbackUrl
				})
			});

			if (!res.ok) {
				const errorData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(errorData.message || `Failed to initiate ${provider} sign in.`);
			}

			const data = (await res.json()) as { url?: string };
			if (data?.url) {
				window.location.href = data.url;
			} else {
				throw new Error('No redirect URL returned by authentication service.');
			}
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
			isSubmitting = false;
			activeProvider = null;
		}
	}

	function handleAnonymousClick() {
		if (onAnonymous) {
			onAnonymous();
		} else {
			window.location.href = `/onboarding/results?answer=${answer}&anon=1`;
		}
	}

	const containerClasses = $derived.by(() => {
		if (variant === 'card') {
			return `border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md ${className}`;
		}
		if (variant === 'compact') {
			return `border-2 border-border bg-surface p-4 sm:p-5 rounded-theme shadow-theme-sm ${className}`;
		}
		return `w-full ${className}`;
	});
</script>

<div class={containerClasses}>
	{#if stepLabel}
		<div class="mb-2.5 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
			{stepLabel}
		</div>
	{/if}
	<!-- Headline -->
	<h2 class="mb-2 text-2xl sm:text-3xl font-black text-foreground leading-tight font-display">
		{headline}
	</h2>
	<p class="mb-6 text-sm leading-relaxed text-muted-foreground font-medium">
		{sub}
	</p>

	{#if emailSent}
		<!-- Email Sent State -->
		<div class="border-2 border-border bg-background p-5 text-center rounded-theme shadow-theme-sm">
			<div class="mb-2 text-3xl">✉️</div>
			<h3 class="text-base font-bold text-foreground font-display">Check your email</h3>
			<p class="mt-1 text-xs sm:text-sm text-foreground">
				We sent a one-time sign-in link to:
			</p>
			<p class="mt-1 text-sm font-bold text-foreground break-all">{email}</p>
			<p class="mt-3 text-xs text-muted-foreground">
				Click the link in the message to sign in instantly. The link will expire shortly.
			</p>

			<button
				type="button"
				onclick={() => {
					emailSent = false;
					email = '';
				}}
				class="mt-4 inline-block text-xs font-bold text-foreground underline hover:text-primary cursor-pointer"
			>
				Use a different email or sign-in method
			</button>
		</div>
	{:else}
		<!-- Email Magic Link Form -->
		<form onsubmit={handleEmailSignIn} class="flex flex-col gap-3">
			<div>
				<label
					for="widget-email-input"
					class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground font-display"
				>
					Sign in with email
				</label>
				<input
					id="widget-email-input"
					type="email"
					required
					bind:value={email}
					placeholder="you@example.com"
					disabled={isSubmitting}
					class="w-full border-2 border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm transition-colors focus:bg-background focus:outline-none disabled:opacity-50"
				/>
			</div>

			{#if turnstileSiteKey}
				<Turnstile
					siteKey={turnstileSiteKey}
					onSuccess={(token) => (turnstileToken = token)}
					onError={(err) => (errorMessage = err)}
				/>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting || !email}
				class="flex w-full items-center justify-center gap-2 border-2 border-border bg-primary px-5 py-3 text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				{#if isSubmitting && !activeProvider}
					<svg class="h-4 w-4 animate-spin text-primary-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>Sending link...</span>
				{:else}
					<span>Send one-time link →</span>
				{/if}
			</button>
		</form>

		{#if errorMessage}
			<div class="mt-4 border-2 border-primary bg-primary/10 px-3 py-2 text-xs font-bold text-primary rounded-theme">
				{errorMessage}
			</div>
		{/if}

		<!-- Divider -->
		<div class="my-5 flex items-center gap-3">
			<div class="h-[2px] flex-1 bg-border"></div>
			<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">or continue with</span>
			<div class="h-[2px] flex-1 bg-border"></div>
		</div>

		<!-- Social login buttons -->
		<div class="flex flex-col gap-2.5">
			<button
				type="button"
				onclick={() => socialLogin('google')}
				disabled={isSubmitting}
				class="flex w-full items-center justify-center gap-2.5 border-2 border-border bg-surface px-4 py-2.5 rounded-theme text-sm font-bold text-foreground shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				{#if activeProvider === 'google'}
					<svg class="h-4 w-4 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>Connecting to Google...</span>
				{:else}
					<svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					<span>Google</span>
				{/if}
			</button>

			<button
				type="button"
				onclick={() => socialLogin('facebook')}
				disabled={isSubmitting}
				class="flex w-full items-center justify-center gap-2.5 border-2 border-border bg-surface px-4 py-2.5 rounded-theme text-sm font-bold text-foreground shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				{#if activeProvider === 'facebook'}
					<svg class="h-4 w-4 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>Connecting to Facebook...</span>
				{:else}
					<svg class="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
					</svg>
					<span>Facebook</span>
				{/if}
			</button>

			<button
				type="button"
				onclick={() => socialLogin('github')}
				disabled={isSubmitting}
				class="flex w-full items-center justify-center gap-2.5 border-2 border-border bg-surface px-4 py-2.5 rounded-theme text-sm font-bold text-foreground shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				{#if activeProvider === 'github'}
					<svg class="h-4 w-4 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>Connecting to GitHub...</span>
				{:else}
					<svg class="h-4 w-4 fill-foreground" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.435 9.813 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 6.844c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 22.31 24 17.807 24 12.5 24 5.87 18.627.5 12 .5z"/>
					</svg>
					<span>GitHub</span>
				{/if}
			</button>

			<button
				type="button"
				onclick={() => socialLogin('twitter')}
				disabled={isSubmitting}
				class="flex w-full items-center justify-center gap-2.5 border-2 border-border bg-surface px-4 py-2.5 rounded-theme text-sm font-bold text-foreground shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				{#if activeProvider === 'twitter'}
					<svg class="h-4 w-4 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>Connecting to X / Twitter...</span>
				{:else}
					<svg class="h-4 w-4 fill-foreground" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
					</svg>
					<span>X / Twitter</span>
				{/if}
			</button>
		</div>

		{#if allowAnonymous}
			<!-- Divider -->
			<div class="my-5 flex items-center gap-3">
				<div class="h-[2px] flex-1 bg-border"></div>
				<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">or</span>
				<div class="h-[2px] flex-1 bg-border"></div>
			</div>

			<!-- Anonymous -->
			<button
				type="button"
				onclick={handleAnonymousClick}
				class="w-full border-2 border-border bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground rounded-theme shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
			>
				Continue anonymously →
			</button>
		{/if}

		<!-- OAuth & Legal compliance disclosure -->
		<p class="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
			By continuing, you agree to our
			<a href="/legal/terms" class="font-bold underline underline-offset-2 hover:text-foreground">Terms</a>
			and
			<a href="/legal/privacy" class="font-bold underline underline-offset-2 hover:text-foreground">Privacy Policy</a>,
			which is basically &ndash; <em>we don't sell your data, and we value your privacy &lt;3</em>.
		</p>
	{/if}
</div>
