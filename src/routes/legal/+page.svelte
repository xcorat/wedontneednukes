<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
</script>

<svelte:head>
	<title>Legal Policies · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-2xl">
		<!-- Top Bar -->
		<div class="mb-8 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Home
			</a>
			<MenuButton />
		</div>

		<header class="mb-8">
			<span
				class="inline-block px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground mb-2"
			>
				Policies &amp; Legal
			</span>
			<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
				Legal Documents
			</h1>
			<p class="mt-2 text-base text-muted-foreground">
				Our commitment to transparency, privacy, and clear terms for community participation.
			</p>
		</header>

		<div class="grid grid-cols-1 gap-4">
			<a
				href="/legal/terms"
				class="group block border-2 border-border bg-surface p-6 rounded-theme shadow-theme-md transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				<div class="flex items-center justify-between gap-2">
					<h2 class="text-xl font-extrabold text-foreground font-display group-hover:text-primary transition-colors">
						Terms of Service
					</h2>
					<span class="text-xl">📜</span>
				</div>
				<p class="mt-2 text-sm text-muted-foreground leading-relaxed">
					Terms governing use of the platform, user conduct, abuse prevention, and third-party authentication.
				</p>
				<span class="mt-4 inline-block text-xs font-bold text-primary group-hover:underline">
					Read Terms of Service →
				</span>
			</a>

			<a
				href="/legal/privacy"
				class="group block border-2 border-border bg-surface p-6 rounded-theme shadow-theme-md transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				<div class="flex items-center justify-between gap-2">
					<h2 class="text-xl font-extrabold text-foreground font-display group-hover:text-primary transition-colors">
						Privacy Policy
					</h2>
					<span class="text-xl">🛡️</span>
				</div>
				<p class="mt-2 text-sm text-muted-foreground leading-relaxed">
					Detailed breakdown of how we handle anonymous voting cookies, third-party OAuth permissions, and your data rights.
				</p>
				<span class="mt-4 inline-block text-xs font-bold text-primary group-hover:underline">
					Read Privacy Policy →
				</span>
			</a>
		</div>
	</div>
</main>
