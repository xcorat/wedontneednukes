<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// 2FA Setup flow states
	let isSettingUp2FA = $state(false);
	let isEnabling = $state(false);
	let isVerifying = $state(false);
	let totpURI = $state<string | null>(null);
	let backupCodes = $state<string[]>([]);
	let verifyCode = $state('');
	let setupError = $state<string | null>(null);
	let setupSuccess = $state(false);

	// Session management states
	let revokingId = $state<string | null>(null);
	let isRevokingOthers = $state(false);

	async function start2FASetup() {
		isSettingUp2FA = true;
		isEnabling = true;
		setupError = null;
		totpURI = null;
		backupCodes = [];

		try {
			const res = await fetch('/api/auth/two-factor/enable', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(errData.message || 'Failed to initiate 2FA setup.');
			}

			const result = (await res.json()) as { totpURI?: string; backupCodes?: string[] };
			totpURI = result.totpURI || null;
			backupCodes = result.backupCodes || [];
		} catch (err: unknown) {
			setupError = err instanceof Error ? err.message : 'An error occurred setting up 2FA.';
		} finally {
			isEnabling = false;
		}
	}

	async function confirm2FA(e: SubmitEvent) {
		e.preventDefault();
		if (!verifyCode || verifyCode.trim().length < 6 || isVerifying) return;

		isVerifying = true;
		setupError = null;

		try {
			const res = await fetch('/api/auth/two-factor/verify-totp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					code: verifyCode.trim()
				})
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(errData.message || 'Invalid verification code. Please try again.');
			}

			setupSuccess = true;
			await invalidateAll();
		} catch (err: unknown) {
			setupError = err instanceof Error ? err.message : 'Failed to verify 2FA code.';
		} finally {
			isVerifying = false;
		}
	}

	function closeSetup() {
		isSettingUp2FA = false;
		setupSuccess = false;
		totpURI = null;
		backupCodes = [];
		verifyCode = '';
		setupError = null;
	}
</script>

<svelte:head>
	<title>Security Settings · We Don't Need Nukes</title>
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
				class="border-2 border-border bg-surface px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground rounded-theme shadow-theme-sm transition-all hover:text-foreground font-display"
			>
				🔗 Connected Accounts
			</a>
			<a
				href="/settings/security"
				class="border-2 border-border bg-primary px-4 py-2 text-xs sm:text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display"
			>
				🛡️ Security
			</a>
		</div>

		<!-- Feedback Alerts -->
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

		<!-- Security Card Container -->
		<div class="space-y-8">
			<!-- Section 1: Two-Factor Authentication -->
			<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
				<header class="mb-6 border-b-2 border-border pb-4">
					<div class="flex items-center justify-between">
						<div>
							<h1 class="text-xl sm:text-2xl font-black text-foreground leading-tight font-display">
								Two-Factor Authentication (2FA)
							</h1>
							<p class="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
								Protect your account with an extra verification layer using an authenticator app (Google Authenticator, 1Password, etc.).
							</p>
						</div>
						<div>
							{#if data.twoFactorEnabled}
								<span class="inline-flex items-center gap-1 rounded-theme border-2 border-border bg-success/20 px-2.5 py-1 text-xs font-bold text-success">
									✓ Enabled
								</span>
							{:else}
								<span class="inline-flex items-center rounded-theme border-2 border-border/40 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
									Disabled
								</span>
							{/if}
						</div>
					</div>
				</header>

				{#if !data.twoFactorEnabled && !isSettingUp2FA}
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-theme border-2 border-border bg-background p-4 shadow-theme-sm">
						<div>
							<h3 class="text-sm font-bold text-foreground font-display">Authenticator App (TOTP)</h3>
							<p class="text-xs text-muted-foreground">
								Generate verification codes on your phone or password manager.
							</p>
						</div>
						<button
							type="button"
							onclick={start2FASetup}
							class="border-2 border-border bg-primary px-4 py-2 text-xs font-black text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer shrink-0"
						>
							Enable 2FA →
						</button>
					</div>
				{:else if isSettingUp2FA}
					<!-- Setup Wizard Container -->
					<div class="rounded-theme border-2 border-border bg-background p-5 shadow-theme-sm space-y-5">
						{#if isEnabling}
							<div class="flex items-center justify-center gap-3 py-8">
								<svg class="h-6 w-6 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
								</svg>
								<span class="text-sm font-bold text-foreground">Generating 2FA security credentials...</span>
							</div>
						{:else if setupSuccess}
							<div class="space-y-4">
								<div class="flex items-center gap-2 border-2 border-success bg-success/20 p-3 text-sm font-bold text-success rounded-theme">
									<span>✓</span>
									<span>Two-Factor Authentication is now enabled on your account!</span>
								</div>

								{#if backupCodes.length > 0}
									<div class="space-y-2">
										<h4 class="text-xs font-black uppercase tracking-wider text-foreground font-display">
											Emergency Recovery Codes
										</h4>
										<p class="text-xs text-muted-foreground leading-relaxed">
											Save these single-use recovery codes in a safe place. You can use them to log in if you lose access to your authenticator device:
										</p>
										<div class="grid grid-cols-2 gap-2 rounded-theme border-2 border-border bg-surface p-3 font-mono text-xs font-bold text-foreground select-all">
											{#each backupCodes as code}
												<div class="p-1 text-center bg-background rounded-theme border border-border">{code}</div>
											{/each}
										</div>
									</div>
								{/if}

								<button
									type="button"
									onclick={closeSetup}
									class="w-full border-2 border-border bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground rounded-theme shadow-theme-primary cursor-pointer font-display"
								>
									Done
								</button>
							</div>
						{:else}
							<div class="space-y-4">
								<div class="flex items-center justify-between">
									<h3 class="text-sm font-black text-foreground font-display">Scan or Enter Code</h3>
									<button
										type="button"
										onclick={closeSetup}
										class="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
									>
										✕ Cancel
									</button>
								</div>

								{#if setupError}
									<div class="border-2 border-primary bg-primary/15 p-3 text-xs font-bold text-primary rounded-theme">
										{setupError}
									</div>
								{/if}

								{#if totpURI}
									<div class="space-y-2">
										<p class="text-xs text-muted-foreground">
											Import this configuration key into Google Authenticator, 1Password, or Authy:
										</p>
										<div class="overflow-x-auto rounded-theme border-2 border-border bg-surface p-3 font-mono text-xs font-bold text-foreground break-all select-all">
											{totpURI}
										</div>
									</div>
								{/if}

								<form onsubmit={confirm2FA} class="space-y-3">
									<div>
										<label for="code-input" class="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground font-display">
											6-digit verification code
										</label>
										<input
											id="code-input"
											type="text"
											required
											inputmode="numeric"
											maxlength="6"
											pattern="[0-9]*"
											placeholder="123456"
											bind:value={verifyCode}
											disabled={isVerifying}
											class="w-full border-2 border-border bg-surface px-3.5 py-2 text-center font-mono text-lg tracking-widest text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm focus:bg-background focus:outline-none"
										/>
									</div>

									<button
										type="submit"
										disabled={isVerifying || verifyCode.trim().length < 6}
										class="flex w-full items-center justify-center gap-2 border-2 border-border bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground rounded-theme shadow-theme-primary font-display disabled:opacity-50 cursor-pointer"
									>
										{#if isVerifying}
											<span>Verifying...</span>
										{:else}
											<span>Verify &amp; Activate 2FA →</span>
										{/if}
									</button>
								</form>
							</div>
						{/if}
					</div>
				{:else}
					<!-- 2FA is Enabled State -->
					<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-theme border-2 border-border bg-background p-4 shadow-theme-sm">
						<div>
							<h3 class="text-sm font-bold text-foreground font-display">Authenticator App Active</h3>
							<p class="text-xs text-muted-foreground">
								Your account requires a 6-digit TOTP code during sign-in.
							</p>
						</div>

						<form method="POST" action="?/disableTwoFactor">
							<button
								type="submit"
								onclick={(e) => {
									if (!confirm('Are you sure you want to disable two-factor authentication?')) {
										e.preventDefault();
									}
								}}
								class="border-2 border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-destructive rounded-theme shadow-theme-sm hover:bg-destructive/10 cursor-pointer font-display"
							>
								Disable 2FA
							</button>
						</form>
					</div>
				{/if}
			</div>

			<!-- Section 2: Active Sessions & Device Management -->
			<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
				<header class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-4">
					<div>
						<h2 class="text-xl sm:text-2xl font-black text-foreground leading-tight font-display">
							Active Sessions
						</h2>
						<p class="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
							Devices currently logged into your account across browsers and locations.
						</p>
					</div>

					{#if data.sessions.length > 1}
						<form method="POST" action="?/revokeOtherSessions" onsubmit={() => (isRevokingOthers = true)}>
							<button
								type="submit"
								disabled={isRevokingOthers}
								class="border-2 border-border bg-secondary px-3.5 py-1.5 text-xs font-black uppercase text-secondary-foreground rounded-theme shadow-theme-sm hover:translate-y-[1px] active:shadow-none cursor-pointer font-display"
							>
								{isRevokingOthers ? 'Signing out...' : 'Sign out all other devices'}
							</button>
						</form>
					{/if}
				</header>

				<div class="flex flex-col gap-3">
					{#each data.sessions as s (s.id)}
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-theme border-2 border-border bg-background p-4 shadow-theme-sm">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-theme border-2 border-border bg-surface text-lg">
									{#if s.os === 'iPhone' || s.os === 'Android'}
										📱
									{:else if s.os === 'iPad'}
										📟
									{:else}
										💻
									{/if}
								</div>

								<div>
									<div class="flex items-center gap-2">
										<span class="text-sm font-black text-foreground font-display">
											{s.browser} on {s.os}
										</span>
										{#if s.isCurrent}
											<span class="inline-flex items-center rounded-theme border-2 border-border bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-foreground">
												This device
											</span>
										{/if}
									</div>
									<p class="text-[11px] text-muted-foreground font-mono">
										{s.ipAddress ? `IP: ${s.ipAddress} · ` : ''}
										Signed in: {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									</p>
								</div>
							</div>

							<div>
								{#if !s.isCurrent}
									<form method="POST" action="?/revokeSession" onsubmit={() => (revokingId = s.id)}>
										<input type="hidden" name="sessionId" value={s.id} />
										<button
											type="submit"
											disabled={revokingId === s.id}
											class="border-2 border-border bg-surface px-3 py-1 text-xs font-bold text-destructive rounded-theme shadow-theme-sm hover:bg-destructive/10 cursor-pointer font-display"
										>
											{revokingId === s.id ? 'Revoking...' : 'Revoke'}
										</button>
									</form>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>
