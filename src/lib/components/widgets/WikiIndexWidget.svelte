<script lang="ts">
	import type { WikiManifestEntry } from '$lib/types/wiki.js';

	export interface WikiIndexGroup {
		category: string;
		entries: WikiManifestEntry[];
	}

	interface Props {
		groups: WikiIndexGroup[];
		class?: string;
	}

	let { groups, class: className = '' }: Props = $props();
</script>

<div class="flex flex-col gap-8 {className}">
	{#each groups as group (group.category)}
		<section class="flex flex-col gap-3">
			<header class="flex items-baseline justify-between gap-3 border-b-2 border-border/30 pb-2">
				<h2 class="text-2xl font-extrabold tracking-tight text-foreground font-display">
					{group.category}
				</h2>
				<span class="text-xs font-mono uppercase tracking-wider text-muted-foreground">
					{group.entries.length} article{group.entries.length === 1 ? '' : 's'}
				</span>
			</header>

			<ul class="flex flex-col gap-3">
				{#each group.entries as entry (entry.slug)}
					<li>
						<a
							href={`/wiki/faq/${entry.slug}`}
							class="block border-2 border-border bg-surface p-4 sm:p-5 border-l-4 border-l-primary rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
						>
							<h3 class="text-lg sm:text-xl font-bold text-foreground font-display">
								{entry.title}
							</h3>
							<p class="mt-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
								{entry.summary}
							</p>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
