<script lang="ts">
	export interface WidgetStats {
		totalVotes: number;
		agreeCount: number;
		agreePercentage: number;
		otherCount: number;
		otherPercentage: number;
	}

	interface Props {
		answer?: 'no' | 'yes' | string | null;
		stats: WidgetStats;
		showUserBadge?: boolean;
		showVoteChoiceBanner?: boolean;
		variant?: 'card' | 'compact' | 'inline';
		class?: string;
	}

	let {
		answer = null,
		stats,
		showUserBadge = true,
		showVoteChoiceBanner = true,
		variant = 'card',
		class: className = ''
	}: Props = $props();

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
	<!-- Confirmed vote banner -->
	{#if showVoteChoiceBanner && hasAnswer}
		<div class="mb-5 inline-flex items-center gap-2 border-2 border-border bg-background px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-theme shadow-theme-sm">
			<span>{answeredNo ? '🕊️' : '🤔'}</span>
			<span>
				Your choice: <strong>{answeredNo ? "Agree (We don't need nukes)" : 'We do | Not sure'}</strong>
			</span>
		</div>
	{/if}

	<!-- Results Bars -->
	<div class="space-y-4">
		<!-- Agree Bar -->
		<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
			<div class="mb-2 flex items-center justify-between text-sm font-bold">
				<span class="flex items-center gap-1.5">
					<span class="text-foreground font-display">We don't need nukes</span>
					{#if showUserBadge && hasAnswer && answeredNo}
						<span class="border border-border bg-primary px-1.5 py-0.2 text-[10px] font-black uppercase text-primary-foreground rounded-theme">
							You
						</span>
					{/if}
				</span>
				<span class="text-base font-black text-primary font-display">{stats.agreePercentage}%</span>
			</div>

			<!-- Progress Bar Track -->
			<div class="h-4 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme">
				<div
					class="h-full bg-primary transition-all duration-700 rounded-theme"
					style="width: {stats.agreePercentage}%"
				></div>
			</div>

			<p class="mt-1.5 text-right text-xs text-muted-foreground font-medium">
				{stats.agreeCount.toLocaleString()} votes
			</p>
		</div>

		<!-- Other Bar -->
		<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
			<div class="mb-2 flex items-center justify-between text-sm font-bold">
				<span class="flex items-center gap-1.5">
					<span class="text-foreground font-display">We do | Not sure</span>
					{#if showUserBadge && hasAnswer && !answeredNo}
						<span class="border border-border bg-secondary px-1.5 py-0.2 text-[10px] font-black uppercase text-secondary-foreground rounded-theme">
							You
						</span>
					{/if}
				</span>
				<span class="text-base font-black text-secondary font-display">{stats.otherPercentage}%</span>
			</div>

			<!-- Progress Bar Track -->
			<div class="h-4 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme">
				<div
					class="h-full bg-secondary transition-all duration-700 rounded-theme"
					style="width: {stats.otherPercentage}%"
				></div>
			</div>

			<p class="mt-1.5 text-right text-xs text-muted-foreground font-medium">
				{stats.otherCount.toLocaleString()} votes
			</p>
		</div>
	</div>
</div>
