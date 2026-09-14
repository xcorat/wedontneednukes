<script lang="ts">
	export interface VoteStats {
		totalVotes: number;
		agreeCount: number;
		agreePercentage: number;
		otherCount: number;
		otherPercentage: number;
	}

	export interface WidgetStats extends VoteStats {
		validated?: VoteStats;
	}

	interface Props {
		answer?: 'no' | 'yes' | string | null;
		stats: WidgetStats;
		goal?: number;
		showUserBadge?: boolean;
		showVoteChoiceBanner?: boolean;
		variant?: 'card' | 'compact' | 'inline';
		class?: string;
	}

	let {
		answer = null,
		stats,
		goal = 100,
		variant = 'card',
		class: className = ''
	}: Props = $props();

	let activeTab = $state<'validated' | 'all'>('validated');

	const activeStats = $derived.by<VoteStats>(() => {
		if (activeTab === 'validated' && stats.validated) {
			return stats.validated;
		}
		return stats;
	});

	const percentage = $derived(
		goal > 0 ? Math.min(100, Math.round((activeStats.totalVotes / goal) * 100)) : 0
	);

	const containerClasses = $derived.by(() => {
		if (variant === 'card') {
			return `border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md ${className}`;
		}
		if (variant === 'compact') {
			return `border-2 border-border bg-surface p-4 sm:p-5 rounded-theme shadow-theme-sm ${className}`;
		}
		return `w-full ${className}`;
	});
</script>

<div class={containerClasses}>
	<!-- Tab Switcher: Validated Only | All votes -->
	<div class="mb-4 flex items-center justify-between gap-2 border-b-2 border-border/20 pb-3">
		<span class="text-xs font-black uppercase tracking-wider text-muted-foreground font-display">
			View Votes:
		</span>
		<div class="flex items-center gap-1.5 bg-background p-1 border-2 border-border rounded-theme shadow-theme-sm">
			<button
				type="button"
				onclick={() => (activeTab = 'validated')}
				class="px-3 py-1 text-xs font-black uppercase rounded-theme transition-all cursor-pointer font-display {activeTab === 'validated' ? 'bg-primary text-primary-foreground shadow-theme-sm' : 'text-foreground hover:bg-surface'}"
			>
				Validated Only
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-3 py-1 text-xs font-black uppercase rounded-theme transition-all cursor-pointer font-display {activeTab === 'all' ? 'bg-primary text-primary-foreground shadow-theme-sm' : 'text-foreground hover:bg-surface'}"
			>
				All votes
			</button>
		</div>
	</div>

	<!-- Progress top: keep only x/100 -->
	<div class="mb-1.5 flex justify-end text-xs sm:text-sm font-bold font-mono text-foreground">
		{activeStats.totalVotes}/{goal}
	</div>

	<!-- Progress Track & Bar -->
	<div
		class="h-5 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme shadow-inner"
		role="progressbar"
		aria-valuenow={activeStats.totalVotes}
		aria-valuemin={0}
		aria-valuemax={goal}
	>
		<div
			class="h-full bg-primary transition-all duration-700 rounded-theme"
			style="width: {percentage}%"
		></div>
	</div>

	<!-- Below progress bar: just text, left align (agreed x/total (percentage%)) -->
	<div class="mt-3 text-left text-xs sm:text-sm font-medium text-foreground">
		<p>
			agreed {activeStats.agreeCount}/{activeStats.totalVotes} ({activeStats.agreePercentage}%)
		</p>
		{#if activeStats.otherCount > 0}
			<p class="text-muted-foreground mt-0.5">
				not agreed {activeStats.otherCount}/{activeStats.totalVotes} ({activeStats.otherPercentage}%)
			</p>
		{/if}
	</div>
</div>
