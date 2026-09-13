<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();
	const org = $derived(data.organization);
</script>

<svelte:head>
	<title>{org.title} · Organizations · We Don't Need Nukes</title>
	{#if org.summary}
		<meta name="description" content={org.summary} />
	{/if}
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-3xl">
		<!-- Top Bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/organizations"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← All Organizations
			</a>
			<MenuButton />
		</div>

		<!-- Main Article Card -->
		<article class="border-2 border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md flex flex-col gap-6">
			<header class="flex flex-col gap-3 border-b-2 border-border/20 pb-5">
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="w-fit inline-block px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground"
					>
						{org.category || 'Organization'}
					</span>
					{#if org.updatedAt}
						<span class="text-xs text-muted-foreground font-mono">
							Updated {org.updatedAt}
						</span>
					{/if}
				</div>

				<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
					{org.title}
				</h1>

				{#if org.summary}
					<p class="text-base sm:text-lg text-muted-foreground leading-relaxed font-body">
						{org.summary}
					</p>
				{/if}

				<!-- Metadata / Official Link Bar -->
				{#if org.website || org.founded || org.headquarters}
					<div class="mt-2 flex flex-wrap items-center gap-3 border-t border-border/20 pt-3">
						{#if org.website}
							<a
								href={org.website}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-black text-primary-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px]"
							>
								<span>Visit Official Website</span>
								<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke-linecap="round" stroke-linejoin="round" />
									<polyline points="15 3 21 3 21 9" stroke-linecap="round" stroke-linejoin="round" />
									<line x1="10" y1="14" x2="21" y2="3" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</a>
						{/if}
						{#if org.founded}
							<span class="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
								<span class="font-bold text-foreground">Established:</span> {org.founded}
							</span>
						{/if}
						{#if org.headquarters}
							<span class="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
								<span class="font-bold text-foreground">Headquarters:</span> {org.headquarters}
							</span>
						{/if}
					</div>
				{/if}
			</header>

			<!-- Rendered Markdown Body -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="wiki-prose">
				{@html org.html}
			</div>

			<!-- Quick Action Footer -->
			<div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-border/20 pt-6">
				<div class="flex flex-wrap items-center gap-4 text-sm font-bold">
					<a
						href="/organizations"
						class="text-muted-foreground hover:text-foreground underline underline-offset-4"
					>
						← Back to Organizations
					</a>
					<a
						href="/campaigns"
						class="text-muted-foreground hover:text-foreground underline underline-offset-4"
					>
						Active Campaigns →
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
