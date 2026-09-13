<script lang="ts">
	import type { WikiArticle, WikiManifestEntry } from '$lib/types/wiki.js';
	import SocialShareWidget from './SocialShareWidget.svelte';

	interface Props {
		article: WikiArticle;
		relatedEntries?: WikiManifestEntry[];
		class?: string;
	}

	let { article, relatedEntries = [], class: className = '' }: Props = $props();
</script>

<article class="flex flex-col gap-6 {className}">
	<header class="flex flex-col gap-2 border-b-2 border-border/30 pb-4">
		<div class="flex items-center gap-2">
			<span
				class="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground"
			>
				{article.category}
			</span>
		</div>
		<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
			{article.title}
		</h1>
		{#if article.summary}
			<p class="text-base sm:text-lg text-muted-foreground leading-relaxed font-body">
				{article.summary}
			</p>
		{/if}
	</header>

	<!-- Markdown-rendered HTML; safe because marked is configured to drop raw HTML tokens. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="wiki-prose">
		{@html article.html}
	</div>

	<!-- Share this FAQ article -->
	<div class="border-t-2 border-border/30 pt-4">
		<SocialShareWidget
			variant="compact"
			title={article.title}
			text={`"${article.title}" — Learn more on We Don't Need Nukes:`}
		/>
	</div>

	{#if relatedEntries.length}
		<aside
			class="border-t-2 border-border/30 pt-5 mt-2 flex flex-col gap-3"
			aria-label="Related articles"
		>
			<h2 class="text-lg font-extrabold tracking-tight text-foreground font-display">
				Related
			</h2>
			<ul class="flex flex-col gap-2">
				{#each relatedEntries as r (r.slug)}
					<li>
						<a
							href={`/wiki/faq/${r.slug}`}
							class="block border border-border bg-surface px-4 py-3 text-sm sm:text-base font-bold text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] hover:text-primary"
						>
							→ {r.title}
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
</article>
