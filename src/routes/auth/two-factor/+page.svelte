<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();

	let code = $state('');
	let useBackupCode = $state(false);
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const trimmedCode = code.trim();
		if (!trimmedCode || isSubmitting) return;

		isSubmitting = true;
		errorMessage = null;

		try {
			const endpoint = useBackupCode
				? '/api/auth/two-factor/verify-backup-code'
				: '/api/auth/two-factor/verify-totp';

			const payload = useBackupCode
				? { code: trimmedCode }
				: { code: trimmedCode, trustDevice: true };

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(
					errData.message || (useBackupCode ? 'Invalid backup code.' : 'Invalid authenticator code.')
				);
			}

			// Successfully authenticated with 2FA -> redirect to destination
			window.location.href = data.callbackUrl;
		} catch (err: unknown) {
			errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Two-Factor Verification · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-12 text-foreground font-body">
	<div class="w-full max-w-md">
		<!-- Top Bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/auth"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back to Sign In
			</a>

			<MenuButton />
		</div>

		<!-- Card Container -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
			<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-theme border-2 border-border bg-primary/20 text-2xl">
				🛡️
			</div>

			<h1 class="mb-2 text-2xl font-black text-foreground leading-tight font-display">
				{useBackupCode ? 'Enter Backup Code' : 'Two-Factor Authentication'}
			</h1>
			<p class="mb-6 text-sm text-muted-foreground font-medium">
				{useBackupCode
					? 'Enter one of the emergency backup codes you saved when enabling 2FA.'
					: 'Open your authenticator app (Google Authenticator, 1Password, etc.) and enter the 6-digit code.'}
			</p>

			<form onsubmit={handleSubmit} class="flex flex-col gap-4">
				<div>
					<label for="2fa-code" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground font-display">
						{useBackupCode ? 'Backup Code' : '6-Digit Code'}
					</label>
					<input
						id="2fa-code"
						type="text"
						inputmode={useBackupCode ? 'text' : 'numeric'}
						autocomplete="one-time-code"
						required
						bind:value={code}
						placeholder={useBackupCode ? 'e.g. A1B2-C3D4' : '000000'}
						disabled={isSubmitting}
						class="w-full border-2 border-border bg-surface px-3.5 py-3 text-center text-xl font-bold tracking-widest text-foreground placeholder:text-muted-foreground rounded-theme
						       shadow-theme-sm transition-colors focus:bg-background focus:outline-none disabled:opacity-50 font-mono"
					/>
				</div>

				{#if errorMessage}
					<div class="border-2 border-primary bg-primary/10 px-3.5 py-2.5 text-xs font-bold text-primary rounded-theme">
						{errorMessage}
					</div>
				{/if}

				<button
					type="submit"
					disabled={isSubmitting || !code.trim()}
					class="flex w-full items-center justify-center gap-2 border-2 border-border bg-primary px-5 py-3 text-sm font-black text-primary-foreground rounded-theme
					       shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
				>
					{#if isSubmitting}
						<svg class="h-4 w-4 animate-spin text-primary-foreground" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
						</svg>
						<span>Verifying...</span>
					{:else}
						<span>Verify &amp; Continue →</span>
					{/if}
				</button>
			</form>

			<div class="mt-6 border-t-2 border-border pt-4 text-center">
				<button
					type="button"
					onclick={() => {
						useBackupCode = !useBackupCode;
						code = '';
						errorMessage = null;
					}}
					class="text-xs font-bold text-muted-foreground hover:text-foreground underline cursor-pointer"
				>
					{useBackupCode ? '← Use authenticator app instead' : 'Lost access to your authenticator? Use a backup code'}
				</button>
			</div>
		</div>
	</div>
</main>
