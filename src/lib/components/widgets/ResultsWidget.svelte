<script lang="ts">
	import ProgressWidget from './ProgressWidget.svelte';

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
		showUserBadge = true,
		showVoteChoiceBanner = false,
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

	const hasAnswer = $derived(answer !== null && answer !== undefined);
	const answeredNo = $derived(answer === 'no');

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
	<div class="mb-5 flex items-center justify-between gap-2 border-b-2 border-border/20 pb-4">
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

	<!-- Progress Widget (takes current val, goal) -->
	<ProgressWidget
		currentVal={activeStats.totalVotes}
		{goal}
		label={activeTab === 'validated' ? 'Validated Campaign Goal' : 'Total Campaign Goal'}
		unit="votes"
	/>

	<!-- Breakdown below progress bar -->
	<div class="mt-5 space-y-3">
		<!-- Total votes card -->
		<div class="flex items-center justify-between border-2 border-border bg-background px-4 py-3 rounded-theme shadow-theme-sm">
			<div>
				<div class="text-xs font-black uppercase tracking-wider text-foreground font-display">
					Total {activeTab === 'validated' ? 'Validated' : 'Campaign'} Votes
				</div>
				<p class="text-[11px] text-muted-foreground font-medium">
					{activeTab === 'validated' ? 'Verified real human votes' : 'All recorded submissions'}
				</p>
			</div>
			<div class="text-xl sm:text-2xl font-black text-foreground font-mono">
				{activeStats.totalVotes.toLocaleString()}
			</div>
		</div>

		<!-- Yes / No cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<!-- Agreed: We don't need nukes (No) -->
			<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm">
				<div class="flex items-center justify-between mb-1.5">
					<span class="flex items-center gap-1.5 text-xs sm:text-sm font-black text-foreground font-display">
						<span>🕊️</span>
						<span>Agreed</span>
						{#if showUserBadge && hasAnswer && answeredNo}
							<span class="border border-border bg-primary px-1.5 py-0.2 text-[9px] font-black uppercase text-primary-foreground rounded-theme">
								You
							</span>
						{/if}
					</span>
					<span class="text-base font-black text-primary font-display">
						{activeStats.agreePercentage}%
					</span>
				</div>
				<div class="text-xs font-bold text-foreground font-mono">
					{activeStats.agreeCount.toLocaleString()} votes
				</div>
				<p class="text-[11px] text-muted-foreground mt-0.5">
					"We don't need nukes"
				</p>
			</div>

			<!-- Not Agreed: We do / Not sure (Yes) -->
			<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm">
				<div class="flex items-center justify-between mb-1.5">
					<span class="flex items-center gap-1.5 text-xs sm:text-sm font-black text-foreground font-display">
						<span>🤔</span>
						<span>Not agreed</span>
						{#if showUserBadge && hasAnswer && !answeredNo}
							<span class="border border-border bg-secondary px-1.5 py-0.2 text-[9px] font-black uppercase text-secondary-foreground rounded-theme">
								You
							</span>
						{/if}
					</span>
					<span class="text-base font-black text-secondary font-display">
						{activeStats.otherPercentage}%
					</span>
				</div>
				<div class="text-xs font-bold text-foreground font-mono">
					{activeStats.otherCount.toLocaleString()} votes
				</div>
				<p class="text-[11px] text-muted-foreground mt-0.5">
					"We do | Not sure"
				</p>
			</div>
		</div>

		<!-- Percentage of agreed to not comparison bar -->
		<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm">
			<div class="flex items-center justify-between text-xs font-bold mb-2">
				<span class="text-foreground font-display uppercase tracking-wider text-[11px]">Consensus Ratio</span>
				<div class="text-xs font-mono font-bold">
					<span class="text-primary font-black">{activeStats.agreePercentage}% agreed</span>
					<span class="text-muted-foreground"> to </span>
					<span class="text-secondary font-black">{activeStats.otherPercentage}% not</span>
				</div>
			</div>
			<!-- Dual color ratio bar -->
			<div class="h-3.5 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme flex">
				<div
					class="h-full bg-primary transition-all duration-700 rounded-l-theme"
					style="width: {activeStats.agreePercentage}%"
				></div>
				<div
					class="h-full bg-secondary transition-all duration-700 rounded-r-theme"
					style="width: {activeStats.otherPercentage}%"
				></div>
			</div>
		</div>
	</div>
</div>
