<script lang="ts">
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let connectingProvider = $state<string | null>(null);
	let unlinkingProvider = $state<string | null>(null);
	let clientError = $state<string | null>(null);
	let showEmailForm = $state(false);
	let emailInput = $state('');

	$effect(() => {
		emailInput = data.user.email ?? '';
	});

	const urlParams = $derived(page.url.searchParams);
	const justLinked = $derived(urlParams.get('linked'));
	const linkError = $derived(urlParams.get('error'));

	async function handleConnect(providerId: string) {
		connectingProvider = providerId;
		clientError = null;

		try {
			const res = await fetch('/api/auth/link-social', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					provider: providerId,
					callbackURL: `${page.url.origin}/settings/account?linked=${providerId}`,
					errorCallbackURL: `${page.url.origin}/settings/account?error=${providerId}_failed`
				})
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(errData.message || `Failed to initiate connection to ${providerId}.`);
			}

			const result = (await res.json()) as { url?: string };
			if (result?.url) {
				window.location.href = result.url;
			} else {
				throw new Error('No redirect URL returned by authorization service.');
			}
		} catch (err: unknown) {
			clientError = err instanceof Error ? err.message : 'An error occurred while connecting.';
			connectingProvider = null;
		}
	}
</script>

<svelte:head>
	<title>Connected Accounts · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-start bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-2xl">
		<!-- Navigation header -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/profile"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← My Profile
			</a>

			<div class="flex items-center gap-2">
				<MenuButton />
			</div>
		</div>

		<!-- Settings Navigation Tabs -->
		<div class="mb-6 flex flex-wrap gap-2 border-b-2 border-border pb-2">
			<a
				href="/settings/profile"
				class="border-2 border-border bg-surface px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground rounded-theme shadow-theme-sm transition-all hover:text-foreground font-display"
			>
				👤 Profile &amp; Privacy
			</a>
			<a
				href="/settings/account"
				class="border-2 border-border bg-primary px-4 py-2 text-xs sm:text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display"
			>
				🔗 Connected Accounts
			</a>
			<a
				href="/settings/security"
				class="border-2 border-border bg-surface px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground rounded-theme shadow-theme-sm transition-all hover:text-foreground font-display"
			>
				🛡️ Security
			</a>
		</div>

		<!-- Main Card -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
			<header class="mb-6 border-b-2 border-border pb-4">
				<h1 class="text-2xl sm:text-3xl font-black text-foreground leading-tight font-display">
					Connected Accounts
				</h1>
				<p class="mt-1 text-sm text-muted-foreground font-medium">
					Link social accounts to your profile for faster, passwordless sign-in across your devices.
				</p>
			</header>

			<!-- Feedback alerts -->
			{#if form?.success}
				<div class="mb-6 flex items-center gap-2.5 border-2 border-success bg-success/15 px-4 py-3 text-sm font-bold text-success rounded-theme">
					<span class="text-lg">✓</span>
					<span>{form.message}</span>
				</div>
			{:else if form?.message}
				<div class="mb-6 flex items-center gap-2.5 border-2 border-primary bg-primary/15 px-4 py-3 text-sm font-bold text-primary rounded-theme">
					<span class="text-lg">⚠</span>
					<span>{form.message}</span>
				</div>
			{/if}

			{#if justLinked}
				<div class="mb-6 flex items-center gap-2.5 border-2 border-success bg-success/15 px-4 py-3 text-sm font-bold text-success rounded-theme">
					<span class="text-lg">✓</span>
					<span>Successfully connected your {justLinked} account!</span>
				</div>
			{/if}

			{#if linkError || clientError}
				<div class="mb-6 flex items-center gap-2.5 border-2 border-primary bg-primary/15 px-4 py-3 text-sm font-bold text-primary rounded-theme">
					<span class="text-lg">⚠</span>
					<span>{clientError || `Failed to connect account (${linkError}). Please check permissions and try again.`}</span>
				</div>
			{/if}

			<!-- Primary Account Strip -->
			<div class="mb-6 border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
				<div class="flex items-center gap-3.5">
					{#if data.user.image}
						<img
							src={data.user.image}
							alt={data.user.name}
							class="h-12 w-12 rounded-full border-2 border-border object-cover"
						/>
					{:else}
						<div class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-primary/20 text-lg font-black text-foreground">
							{data.user.name ? data.user.name[0]?.toUpperCase() : 'U'}
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<p class="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">
							Primary Email Identity
						</p>
						{#if data.user.email}
							<p class="text-sm font-bold text-foreground truncate">{data.user.email}</p>
							<p class="text-[11px] text-muted-foreground">
								{data.user.emailVerified ? '✓ Verified email' : 'Registered email address'}
							</p>
						{:else}
							<p class="text-sm font-bold text-muted-foreground italic">No email linked (signed in via social)</p>
							<p class="text-[11px] text-muted-foreground">
								Add an email to receive campaign updates or enable magic link sign-in.
							</p>
						{/if}
					</div>

					<div>
						<button
							type="button"
							onclick={() => (showEmailForm = !showEmailForm)}
							class="border-2 border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-background cursor-pointer"
						>
							{showEmailForm ? 'Cancel' : data.user.email ? 'Change Email' : 'Add Email'}
						</button>
					</div>
				</div>

				{#if showEmailForm}
					<form method="POST" action="?/updateEmail" class="mt-4 border-t-2 border-border pt-4 flex flex-col sm:flex-row gap-2.5">
						<input
							type="email"
							name="email"
							required
							bind:value={emailInput}
							placeholder="new-email@example.com"
							class="flex-1 border-2 border-border bg-surface px-3.5 py-2 text-sm text-foreground rounded-theme shadow-theme-sm focus:outline-none"
						/>
						<button
							type="submit"
							class="border-2 border-border bg-primary px-4 py-2 text-xs font-bold text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer font-display"
						>
							Save Email
						</button>
					</form>
				{/if}
			</div>

			<!-- Social Providers List -->
			<div class="space-y-4">
				<h2 class="text-base font-black uppercase tracking-wider text-foreground font-display">
					Social Providers
				</h2>

				<div class="flex flex-col gap-3">
					{#each data.providers as provider (provider.providerId)}
						{@const isConfigured = data.configuredProviders[provider.providerId]}
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
							<!-- Provider details & icon -->
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-theme border-2 border-border bg-surface">
									{#if provider.providerId === 'google'}
										<svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
											<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
											<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
											<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
											<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
										</svg>
									{:else if provider.providerId === 'github'}
										<svg class="h-5 w-5 fill-foreground" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.435 9.813 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 6.844c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 22.31 24 17.807 24 12.5 24 5.87 18.627.5 12 .5z"/>
										</svg>
									{:else if provider.providerId === 'facebook'}
										<svg class="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
										</svg>
									{:else if provider.providerId === 'twitter'}
										<svg class="h-5 w-5 fill-foreground" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
										</svg>
									{/if}
								</div>

								<div>
									<div class="flex items-center gap-2">
										<span class="text-sm font-black text-foreground font-display">{provider.name}</span>
										{#if provider.isConnected}
											<span class="inline-flex items-center gap-1 rounded-theme border-2 border-border bg-success/20 px-2 py-0.5 text-[11px] font-bold text-success">
												✓ Connected
											</span>
										{:else}
											<span class="inline-flex items-center rounded-theme border-2 border-border/40 bg-surface px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
												Not linked
											</span>
										{/if}
									</div>
									{#if provider.isConnected && provider.connectedAt}
										<p class="text-[11px] text-muted-foreground">
											Connected on {new Date(provider.connectedAt).toLocaleDateString()}
										</p>
									{:else if !isConfigured}
										<p class="text-[11px] text-muted-foreground">
											(API keys not configured in current environment)
										</p>
									{/if}
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="flex items-center gap-2">
								{#if provider.isConnected}
									<form
										method="POST"
										action="?/unlink"
										onsubmit={() => (unlinkingProvider = provider.providerId)}
									>
										<input type="hidden" name="providerId" value={provider.providerId} />
										<button
											type="submit"
											disabled={!provider.canUnlink || Boolean(unlinkingProvider)}
											title={!provider.canUnlink ? 'Cannot disconnect your only authentication method.' : 'Disconnect account'}
											class="inline-flex items-center justify-center border-2 border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-destructive/10 hover:text-destructive active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
										>
											{#if unlinkingProvider === provider.providerId}
												<span>Disconnecting...</span>
											{:else}
												<span>Disconnect</span>
											{/if}
										</button>
									</form>
								{:else}
									<button
										type="button"
										onclick={() => handleConnect(provider.providerId)}
										disabled={!isConfigured || Boolean(connectingProvider)}
										class="inline-flex items-center justify-center border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-black text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
									>
										{#if connectingProvider === provider.providerId}
											<svg class="mr-1.5 h-3.5 w-3.5 animate-spin text-primary-foreground" viewBox="0 0 24 24" fill="none">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
											</svg>
											<span>Connecting...</span>
										{:else}
											<span>Connect →</span>
										{/if}
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Informational note -->
			<div class="mt-8 border-t-2 border-border pt-4">
				<p class="text-xs leading-relaxed text-muted-foreground font-medium">
					🔒 <strong>Privacy Guarantee</strong>: Connecting a social identity is used solely for secure authentication. We never post to your timeline or access private messages.
				</p>
			</div>
		</div>
	</div>
</main>
