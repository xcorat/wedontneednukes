<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import BotButton from '$lib/components/BotButton.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import KofiBlock from '$lib/components/KofiBlock.svelte';
	import { SocialShareWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.title} · We Don't Need Nukes</title>
	{#if data.summary}
		<meta name="description" content={data.summary} />
	{/if}
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
			<div class="flex items-center gap-2">
				<FundraiserButton variant="icon" />
				<ShareButton />
				<BotButton />
				<MenuButton />
			</div>
		</div>

		<!-- Main Article Card -->
		<article class="border-2 border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md flex flex-col gap-6">
			<header class="flex flex-col gap-2 border-b-2 border-border/20 pb-4">
				<span
					class="w-fit inline-block px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground"
				>
					About
				</span>
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

			<!-- Connect & Share Section -->
			<div class="border-t-2 border-border/20 pt-6 flex flex-col gap-4">
				<div>
					<h3 class="text-sm font-black uppercase tracking-wider text-foreground font-display mb-2">
						Follow the Campaign
					</h3>
					<SocialLinks variant="pill" />
				</div>
				<div class="pt-2">
					<SocialShareWidget
						title="Spread the word"
						variant="card"
					/>
				</div>
			</div>

			<!-- Quick Action Footer -->
			<div class="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-border/20 pt-6">
				<a
					href="/wiki"
					class="text-sm font-bold text-muted-foreground hover:text-foreground underline underline-offset-4"
				>
					Browse Wiki &amp; FAQ →
				</a>
				<a
					href="/"
					class="inline-flex border-2 border-border bg-primary px-5 py-2.5 text-base font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					Record Your Vote →
				</a>
			</div>

			<!-- Ko-fi Support Block -->
			<div class="border-t-2 border-border/20 pt-4">
				<KofiBlock />
			</div>
		</article>
	</div>
</main>
