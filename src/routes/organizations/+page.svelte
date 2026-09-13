<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.title} · We Don't Need Nukes</title>
	{#if data.summary}
		<meta name="description" content={data.summary} />
	{/if}
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-3xl">
		<!-- Top Bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Home
			</a>
			<MenuButton />
		</div>

		<!-- Section Tabs Navigation -->
		<nav aria-label="Movement Navigation" class="mb-6 flex flex-wrap gap-2">
			<a
				href="/campaigns"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[1px]"
			>
				<span>📣 Active Campaigns</span>
			</a>
			<a
				href="/organizations"
				class="inline-flex items-center gap-2 border-2 border-border bg-primary px-4 py-2 text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display"
			>
				<span>🌐 Partner Organizations</span>
			</a>
		</nav>

		<!-- Main Article Card -->
		<article class="border-2 border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md flex flex-col gap-6">
			<header class="flex flex-col gap-2 border-b-2 border-border/20 pb-4">
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="w-fit inline-block px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground"
					>
						Organizations &amp; Alliances
					</span>
					{#if data.updatedAt}
						<span class="text-xs text-muted-foreground font-mono">
							Updated {data.updatedAt}
						</span>
					{/if}
				</div>
				<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
					{data.title}
				</h1>
				{#if data.summary}
					<p class="text-base sm:text-lg text-muted-foreground leading-relaxed font-body">
						{data.summary}
					</p>
				{/if}
			</header>

			<!-- Rendered Markdown Body -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="wiki-prose">
				{@html data.html}
			</div>

			<!-- Quick Action Footer -->
			<div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-border/20 pt-6">
				<div class="flex flex-wrap items-center gap-4 text-sm font-bold">
					<a
						href="/campaigns"
						class="text-muted-foreground hover:text-foreground underline underline-offset-4"
					>
						Active Campaigns →
					</a>
					<a
						href="/wiki"
						class="text-muted-foreground hover:text-foreground underline underline-offset-4"
					>
						Wiki &amp; FAQ →
					</a>
				</div>
				<a
					href="/"
					class="inline-flex border-2 border-border bg-primary px-5 py-2.5 text-base font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					Record Your Vote →
				</a>
			</div>
		</article>
	</div>
</main>
