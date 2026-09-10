<script lang="ts">
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');

	const headline = $derived(
		answeredNo
			? "You are not alone, join the community."
			: "Hope you change your mind, but your voice matters."
	);

	const sub = $derived(
		answeredNo
			? 'Sign in to record your pledge and join the community.'
			: 'Sign in to record your perspective.'
	);

	/** Redirect URL passed through to Better Auth's callbackURL */
	const callbackUrl = $derived(`/campaign/${data.slug}/pledge?answer=${data.answer}`);

	let email = $state('');
	let isSubmitting = $state(false);
	let emailSent = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleEmailSignIn(e: SubmitEvent) {
		e.preventDefault();
		if (!email || isSubmitting) return;

		isSubmitting = true;
		errorMessage = null;

		try {
			const res = await fetch('/api/auth/sign-in/magic-link', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: email.trim(),
					callbackURL: callbackUrl
				})
			});

			if (!res.ok) {
				const errorData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(errorData.message || 'Failed to send one-time link. Please try again.');
			}

			emailSent = true;
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
		} finally {
			isSubmitting = false;
		}
	}

	function socialLogin(provider: 'github' | 'google') {
		const params = new URLSearchParams({
			callbackURL: callbackUrl
		});
		window.location.href = `/api/auth/${provider}?${params.toString()}`;
	}

	function continueAnonymously() {
		// Turnstile verification will go here in Phase 2
		window.location.href = `/campaign/${data.slug}/pledge?answer=${data.answer}&anon=1`;
	}
</script>

<svelte:head>
	<title>{answeredNo ? 'Join the pledge' : 'Share your view'} · WeDoNotNeedNukes</title>
</svelte:head>

<main class="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
	<div class="w-full max-w-sm">
		<!-- Back link -->
		<a
			href="/"
			class="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
		>
			← Back
		</a>

		<!-- Answer badge -->
		<div class="mb-6 flex items-center gap-2">
			<span class="text-2xl">{answeredNo ? '🕊️' : '🤔'}</span>
			<span class="text-sm font-medium text-zinc-400">
				You said: <strong class="text-white">{answeredNo ? 'No, we don\'t' : 'Yes, we do'}</strong>
			</span>
		</div>

		<!-- Headline -->
		<h1 class="mb-2 text-3xl font-black text-white sm:text-4xl">{headline}</h1>
		<p class="mb-8 text-sm leading-relaxed text-zinc-400">{sub}</p>

		{#if emailSent}
			<!-- Email Sent State -->
			<div class="rounded-2xl border border-zinc-700 bg-zinc-900/80 p-6 text-center">
				<div class="mb-3 text-3xl">✉️</div>
				<h2 class="text-lg font-bold text-white">Check your email</h2>
				<p class="mt-2 text-sm leading-relaxed text-zinc-300">
					We sent a one-time sign-in link to:
				</p>
				<p class="mt-1 text-sm font-semibold text-white break-all">{email}</p>
				<p class="mt-4 text-xs text-zinc-500">
					Click the link in the message to sign in instantly. The link will expire shortly.
				</p>

				<button
					type="button"
					onclick={() => {
						emailSent = false;
						email = '';
					}}
					class="mt-6 inline-block text-xs text-zinc-400 underline hover:text-white"
				>
					Use a different email or sign-in method
				</button>
			</div>
		{:else}
			<!-- Email Magic Link Form -->
			<form onsubmit={handleEmailSignIn} class="flex flex-col gap-3">
				<div>
					<label for="email-input" class="mb-1.5 block text-xs font-medium text-zinc-400">
						Sign in with email
					</label>
					<input
						id="email-input"
						type="email"
						required
						bind:value={email}
						placeholder="you@example.com"
						disabled={isSubmitting}
						class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500
						       transition-colors focus:border-zinc-400 focus:outline-none disabled:opacity-50"
					/>
				</div>

				{#if errorMessage}
					<div class="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
						{errorMessage}
					</div>
				{/if}

				<button
					type="submit"
					disabled={isSubmitting || !email}
					class="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950
					       transition-all hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
				>
					{#if isSubmitting}
						<svg class="h-4 w-4 animate-spin text-zinc-950" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
						</svg>
						Sending link...
					{:else}
						Send one-time link →
					{/if}
				</button>
			</form>

			<!-- Divider -->
			<div class="my-6 flex items-center gap-4">
				<div class="h-px flex-1 bg-zinc-800"></div>
				<span class="text-xs text-zinc-600">or continue with</span>
				<div class="h-px flex-1 bg-zinc-800"></div>
			</div>

			<!-- Social login buttons -->
			<div class="flex flex-col gap-3">
				<button
					type="button"
					onclick={() => socialLogin('google')}
					class="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3.5
					       text-sm font-semibold text-white transition-all hover:border-zinc-500 hover:bg-zinc-800 active:scale-95"
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					Google
				</button>

				<button
					type="button"
					onclick={() => socialLogin('github')}
					class="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3.5
					       text-sm font-semibold text-white transition-all hover:border-zinc-500 hover:bg-zinc-800 active:scale-95"
				>
					<svg class="h-5 w-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.435 9.813 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 6.844c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 22.31 24 17.807 24 12.5 24 5.87 18.627.5 12 .5z"/>
					</svg>
					GitHub
				</button>
			</div>

			<!-- Divider -->
			<div class="my-6 flex items-center gap-4">
				<div class="h-px flex-1 bg-zinc-800"></div>
				<span class="text-xs text-zinc-600">or</span>
				<div class="h-px flex-1 bg-zinc-800"></div>
			</div>

			<!-- Anonymous -->
			<button
				type="button"
				onclick={continueAnonymously}
				class="w-full rounded-xl border border-zinc-800 bg-transparent px-5 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
			>
				Continue anonymously
			</button>
		{/if}

		<!-- Privacy note -->
		<p class="mt-8 text-center text-xs leading-relaxed text-zinc-600">
			Your login is used <em>only</em> for this campaign. We never share your data or send unsolicited messages.
		</p>
	</div>
</main>
