<script lang="ts">
	import { page } from '$app/state';
	import { menuState } from '$lib/menu.svelte.js';
	import { VERSION_LABEL } from '$lib/version.js';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	const user = $derived(page.data.user);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menuState.isOpen) {
			menuState.close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if menuState.isOpen}
	<!-- Backdrop -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-xs transition-opacity duration-200"
		onclick={() => menuState.close()}
	></div>

	<!-- Drawer panel -->
	<div
		role="dialog"
		aria-label="Site Menu"
		aria-modal="true"
		class="fixed top-0 right-0 z-50 flex h-full w-full max-w-xs sm:max-w-sm flex-col border-l-4 border-border bg-surface text-foreground shadow-[-6px_0_0_var(--border)] transition-transform duration-200 ease-out font-body"
	>
		<!-- Header -->
		<header class="flex h-16 shrink-0 items-center justify-between border-b-2 border-border px-5 bg-background">
			<h2 class="text-xl font-black uppercase tracking-wider text-foreground font-display">Menu</h2>
			<button
				type="button"
				aria-label="Close menu"
				onclick={() => menuState.close()}
				class="inline-flex h-9 w-9 items-center justify-center border-2 border-border bg-surface text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</header>

		<!-- Menu content area -->
		<div class="flex-1 overflow-y-auto p-5 space-y-6">
			<!-- User Account / Auth Section -->
			<div class="border-b-2 border-border/20 pb-4">
				{#if user}
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-2.5 px-1 py-1">
							{#if user.image}
								<img
									src={user.image}
									alt={user.name}
									class="h-8 w-8 rounded-full border-2 border-border object-cover"
								/>
							{:else}
								<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-secondary text-xs font-bold text-secondary-foreground">
									{user.name ? user.name[0]?.toUpperCase() : 'U'}
								</div>
							{/if}
							<div class="min-w-0 flex-1">
								<p class="truncate text-xs font-bold text-foreground">{user.name}</p>
								<p class="truncate text-[11px] text-muted-foreground">{user.email}</p>
							</div>
						</div>

						<a
							href="/profile"
							onclick={() => menuState.close()}
							class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
						>
							<span>My Profile</span>
							<span>👤</span>
						</a>
						<a
							href="/settings/profile"
							onclick={() => menuState.close()}
							class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
						>
							<span>Profile Settings</span>
							<span>⚙️</span>
						</a>
						<a
							href="/settings/account"
							onclick={() => menuState.close()}
							class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
						>
							<span>Connected Accounts</span>
							<span>🔗</span>
						</a>
						<a
							href="/settings/security"
							onclick={() => menuState.close()}
							class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
						>
							<span>Security Settings</span>
							<span>🛡️</span>
						</a>
					</div>
				{:else}
					<a
						href="/auth"
						onclick={() => menuState.close()}
						class="flex items-center justify-between border-2 border-border bg-primary px-3.5 py-2 text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary hover:translate-y-[1px] transition-all"
					>
						<span>Sign In / Join</span>
						<span>✨</span>
					</a>
				{/if}
			</div>

			<!-- Quick Navigation Links -->
			<nav class="flex flex-col gap-2">
				<a
					href="/"
					onclick={() => menuState.close()}
					class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
				>
					<span>Home (Premise)</span>
					<span>→</span>
				</a>
				<a
					href="/why"
					onclick={() => menuState.close()}
					class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
				>
					<span>Why We Don't Need Nukes</span>
					<span>→</span>
				</a>
				<a
					href="/fundraiser"
					onclick={() => menuState.close()}
					class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
				>
					<span>Campaign Fundraiser</span>
					<span>💛</span>
				</a>
				<a
					href="/tests"
					onclick={() => menuState.close()}
					class="flex items-center justify-between border-2 border-border bg-background px-3.5 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
				>
					<span>Test Lab &amp; Prototypes</span>
					<span>🧪</span>
				</a>
			</nav>

			<!-- Theme Switcher section -->
			<div class="border-t-2 border-border/20 pt-4">
				<ThemeSwitcher />
			</div>
		</div>

		<!-- Status bar: aligned bottom showing version and git commit id -->
		<footer class="mt-auto border-t-2 border-border bg-background px-5 py-3 select-text">
			<p class="text-xs font-mono font-medium tracking-wide text-muted-foreground">
				{VERSION_LABEL}
			</p>
		</footer>
	</div>
{/if}
