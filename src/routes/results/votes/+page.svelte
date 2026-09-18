<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import BotButton from '$lib/components/BotButton.svelte';
	import { LatestVotesWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();

	function getFilterUrl(newFilter: string): string {
		const params = new URLSearchParams();
		if (newFilter !== 'all') params.set('filter', newFilter);
		params.set('page', '1');
		const qs = params.toString();
		return `/results/votes${qs ? `?${qs}` : ''}`;
	}

	function getPageUrl(targetPage: number): string {
		const params = new URLSearchParams();
		if (data.filter !== 'all') params.set('filter', data.filter);
		params.set('page', targetPage.toString());
		return `/results/votes?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>All Public Votes &amp; Commitments · We Don't Need Nukes</title>
	<meta
		name="description"
		content="Complete public listing of citizen votes, stances, and disarmament commitments."
	/>
</svelte:head>

<div class="min-h-screen bg-background text-foreground font-body">
	<!-- Navigation Bar -->
	<header class="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-2 border-border bg-background/95 px-4 sm:px-8 backdrop-blur-xs">
		<a
			href="/results"
			class="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-foreground font-display transition-colors hover:text-primary"
		>
			<span>←</span>
			<span>Results Overview</span>
		</a>

		<div class="flex items-center gap-2 sm:gap-2.5">
			<FundraiserButton variant="icon" />
			<ShareButton />
			<BotButton />
			<MenuButton />
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
		<!-- Header -->
		<div class="space-y-2">
			<div class="inline-block border border-border bg-secondary px-3 py-1 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
				Public Ledger
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-foreground font-display tracking-tight">
				Public Votes &amp; Commitments
			</h1>
			<p class="text-sm sm:text-base text-muted-foreground font-medium">
				Browse all verified citizens, supporters, and public pledge commitments across the campaign.
			</p>
		</div>

		<!-- Filter Bar -->
		<div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border/20 pb-4">
			<div class="flex items-center gap-1.5 bg-surface p-1 border-2 border-border rounded-theme shadow-theme-sm">
				<a
					href={getFilterUrl('all')}
					class="px-3 py-1 text-xs font-black uppercase rounded-theme transition-all font-display {data.filter === 'all' ? 'bg-primary text-primary-foreground shadow-theme-xs' : 'text-foreground hover:bg-background'}"
				>
					All ({data.filter === 'all' ? data.total : 'All'})
				</a>
				<a
					href={getFilterUrl('validated')}
					class="px-3 py-1 text-xs font-black uppercase rounded-theme transition-all font-display {data.filter === 'validated' ? 'bg-primary text-primary-foreground shadow-theme-xs' : 'text-foreground hover:bg-background'}"
				>
					Verified Citizens
				</a>
				<a
					href={getFilterUrl('pledges')}
					class="px-3 py-1 text-xs font-black uppercase rounded-theme transition-all font-display {data.filter === 'pledges' ? 'bg-primary text-primary-foreground shadow-theme-xs' : 'text-foreground hover:bg-background'}"
				>
					With Commitments
				</a>
			</div>

			<div class="text-xs font-mono font-bold text-muted-foreground">
				Page {data.page} of {data.totalPages} ({data.total} entries)
			</div>
		</div>

		<!-- Listing Widget -->
		<LatestVotesWidget
			votes={data.items}
			totalCount={data.total}
			showMoreButton={false}
		/>

		<!-- Pagination Navigation -->
		{#if data.totalPages > 1}
			<nav class="flex items-center justify-center gap-2 pt-4" aria-label="Pagination">
				{#if data.page > 1}
					<a
						href={getPageUrl(data.page - 1)}
						class="border-2 border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all font-display"
					>
						← Previous
					</a>
				{:else}
					<span class="border-2 border-border/40 bg-surface/40 px-4 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground rounded-theme cursor-not-allowed font-display">
						← Previous
					</span>
				{/if}

				<span class="px-3 text-xs font-mono font-bold text-foreground">
					{data.page} / {data.totalPages}
				</span>

				{#if data.hasMore || data.page < data.totalPages}
					<a
						href={getPageUrl(data.page + 1)}
						class="border-2 border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all font-display"
					>
						Next →
					</a>
				{:else}
					<span class="border-2 border-border/40 bg-surface/40 px-4 py-2 text-xs font-black uppercase tracking-wider text-muted-foreground rounded-theme cursor-not-allowed font-display">
						Next →
					</span>
				{/if}
			</nav>
		{/if}
	</main>
</div>
