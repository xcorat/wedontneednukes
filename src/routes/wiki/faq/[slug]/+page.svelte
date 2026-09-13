<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import { WikiArticleWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();

	const article = $derived(data.article);
</script>

<svelte:head>
	<title>{article.title} · Wiki · We Don't Need Nukes</title>
	{#if article.summary}
		<meta name="description" content={article.summary} />
	{/if}
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col bg-background px-4 sm:px-6 py-10 sm:py-14 text-foreground font-body">
	<div class="w-full max-w-3xl mx-auto flex flex-col gap-6">
		<header class="flex items-center justify-between gap-3">
			<a
				href="/wiki"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Wiki
			</a>
			<MenuButton />
		</header>

		<WikiArticleWidget article={article} relatedEntries={data.relatedEntries} />
	</div>
</main>
