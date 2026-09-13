<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();
	const doc = $derived(data.document);
</script>

<svelte:head>
	<title>{doc.title} · We Don't Need Nukes</title>
	{#if doc.summary}
		<meta name="description" content={doc.summary} />
	{/if}
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-2xl">
		<!-- Top Bar -->
		<div class="mb-8 flex items-center justify-between gap-3">
			<a
				href="/legal"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Legal Policies
			</a>
			<MenuButton />
		</div>

		<!-- Main Document Card -->
		<article class="border-2 border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md flex flex-col gap-6">
			<header class="flex flex-col gap-2 border-b-2 border-border/20 pb-4">
				<div class="flex items-center justify-between gap-2">
					<span
						class="inline-block px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground"
					>
						Legal
					</span>
					{#if doc.updatedAt}
						<span class="text-xs text-muted-foreground font-mono">
							Updated: {doc.updatedAt}
						</span>
					{/if}
				</div>
				<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
					{doc.title}
				</h1>
				{#if doc.summary}
					<p class="text-base sm:text-lg text-muted-foreground leading-relaxed font-body">
						{doc.summary}
					</p>
				{/if}
			</header>

			<!-- Rendered Markdown Body -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="wiki-prose">
				{@html doc.html}
			</div>

			<!-- Footer links -->
			<div class="mt-4 flex items-center justify-between border-t-2 border-border/20 pt-6 text-sm font-bold text-muted-foreground">
				{#if doc.slug === 'terms'}
					<a href="/legal/privacy" class="hover:text-foreground underline underline-offset-4">
						View Privacy Policy →
					</a>
				{:else}
					<a href="/legal/terms" class="hover:text-foreground underline underline-offset-4">
						View Terms of Service →
					</a>
				{/if}
				<a href="/" class="hover:text-foreground underline underline-offset-4">
					Home
				</a>
			</div>
		</article>
	</div>
</main>
