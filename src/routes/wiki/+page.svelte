<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import { WikiIndexWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Wiki &amp; FAQ · We Don't Need Nukes</title>
	<meta
		name="description"
		content="Answers to the why's and how's of opposing nuclear weapons. Read short, plain-language FAQs."
	/>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col bg-background px-4 sm:px-6 py-10 sm:py-14 text-foreground font-body">
	<div class="w-full max-w-3xl mx-auto flex flex-col gap-8">
		<header class="flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Home
			</a>
			<MenuButton />
		</header>

		<div class="flex flex-col gap-3">
			<p class="text-xs font-black uppercase tracking-wider text-primary font-display">
				Wiki &amp; FAQ
			</p>
			<h1
				class="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-display"
			>
				Why?
			</h1>
			<p class="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
				Short answers to common questions about the campaign, the pledge, your
				data, and what we believe. Pick a topic below.
			</p>
		</div>

		<WikiIndexWidget groups={data.groups} />

		<footer class="text-xs text-muted-foreground font-mono">
			Manifest generated {new Date(data.generatedAt).toISOString().slice(0, 10)} · {data.manifest.entries.length} articles
		</footer>
	</div>
</main>
