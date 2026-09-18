<script lang="ts">
	import type { PublicVoteItem } from '$lib/server/results/index.js';

	interface Props {
		votes: PublicVoteItem[];
		totalCount?: number;
		showMoreButton?: boolean;
		moreHref?: string;
		class?: string;
	}

	let {
		votes = [],
		totalCount = 0,
		showMoreButton = true,
		moreHref = '/results/votes',
		class: className = ''
	}: Props = $props();

	function formatTimeAgo(isoString: string): string {
		try {
			const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
			if (diff < 60) return 'just now';
			if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
			if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
			if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
			return new Date(isoString).toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return '';
		}
	}
</script>

<div class="border-2 sm:border-[3px] border-border bg-surface p-5 sm:p-6 rounded-theme shadow-theme-md {className}">
	<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-border/20 pb-3">
		<div>
			<div class="mb-1 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
				Live Stream
			</div>
			<h3 class="text-xl sm:text-2xl font-black text-foreground font-display">
				Latest Votes &amp; Commitments
			</h3>
		</div>
		{#if totalCount > 0}
			<span class="inline-flex items-center self-start sm:self-auto border-2 border-border bg-background px-2.5 py-1 text-xs font-mono font-bold text-muted-foreground rounded-theme shadow-theme-xs">
				{totalCount} total participant{totalCount === 1 ? '' : 's'}
			</span>
		{/if}
	</div>

	{#if votes.length === 0}
		<div class="py-10 text-center text-muted-foreground font-medium text-sm">
			<p class="text-2xl mb-2">🕊️</p>
			<p>No public votes recorded yet.</p>
			<p class="text-xs mt-1">Be the first to vote and pledge your commitment!</p>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each votes as vote (vote.id)}
				<div class="border-2 border-border bg-background p-3.5 sm:p-4 rounded-theme shadow-theme-sm transition-all hover:translate-y-[-1px]">
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-start gap-3 min-w-0">
							<!-- Avatar or Fallback -->
							{#if vote.user?.image}
								<img
									src={vote.user.image}
									alt={vote.user.name}
									class="h-9 w-9 rounded-full border-2 border-border object-cover shrink-0 mt-0.5"
								/>
							{:else}
								<div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-secondary/80 text-xs font-bold text-secondary-foreground shrink-0 mt-0.5 font-display">
									{#if vote.user?.id}
										{vote.user.name ? vote.user.name[0]?.toUpperCase() : '👤'}
									{:else if vote.isValidated}
										🛡️
									{:else}
										🕊️
									{/if}
								</div>
							{/if}

							<!-- User & Metadata -->
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-1.5">
									{#if vote.user?.id}
										<a
											href={`/profile/${vote.user.id}`}
											class="text-sm font-black text-foreground hover:text-primary transition-colors truncate font-display underline-offset-2 hover:underline"
										>
											{vote.user.name}
										</a>
									{:else}
										<span class="text-sm font-black text-foreground truncate font-display">
											{vote.user?.name ?? 'Supporter'}
										</span>
									{/if}

									{#if vote.isValidated}
										<span
											title="Verified authenticated supporter"
											class="inline-flex items-center gap-0.5 border border-primary/40 bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary rounded-theme"
										>
											✓ Verified
										</span>
									{/if}

									{#if vote.user?.location}
										<span class="text-[11px] text-muted-foreground font-medium">
											📍 {vote.user.location}
										</span>
									{/if}
								</div>

								<!-- Stance and commitments chips -->
								<div class="mt-1.5 flex flex-wrap items-center gap-1.5">
									<span class="inline-flex items-center gap-1 border-2 border-border bg-surface px-2 py-0.5 text-xs font-bold text-foreground rounded-theme shadow-theme-xs">
										{#if vote.choice === 'no'}
											<span class="text-green-600 dark:text-green-400">🕊️ Agreed</span>
										{:else}
											<span class="text-amber-600 dark:text-amber-400">🤔 Discussion</span>
										{/if}
									</span>

									{#each vote.commitmentLabels as lvl}
										<span class="inline-block border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-bold uppercase text-secondary-foreground rounded-theme">
											{lvl}
										</span>
									{/each}
								</div>

								<!-- Feedback quote if available -->
								{#if vote.feedback}
									<p class="mt-2 text-xs italic text-muted-foreground border-l-2 border-border pl-2 py-0.5 line-clamp-2">
										"{vote.feedback}"
									</p>
								{/if}
							</div>
						</div>

						<!-- Time ago -->
						<div class="text-[11px] font-mono font-medium text-muted-foreground shrink-0 whitespace-nowrap">
							{formatTimeAgo(vote.createdAt)}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- More button -->
		{#if showMoreButton}
			<div class="mt-5 text-center">
				<a
					href={moreHref}
					class="inline-flex items-center justify-center gap-2 w-full sm:w-auto border-2 sm:border-[3px] border-border bg-primary px-6 py-2.5 text-sm font-black uppercase tracking-wider text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-display cursor-pointer"
				>
					<span>View Full Listing of Votes</span>
					<span>→</span>
				</a>
			</div>
		{/if}
	{/if}
</div>
