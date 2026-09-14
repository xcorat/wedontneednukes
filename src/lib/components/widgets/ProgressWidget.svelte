<script lang="ts">
	interface Props {
		currentVal: number;
		goal?: number;
		label?: string;
		unit?: string;
		class?: string;
	}

	let {
		currentVal = 0,
		goal = 100,
		label = 'Campaign Goal Progress',
		unit = 'votes',
		class: className = ''
	}: Props = $props();

	const percentage = $derived(
		goal > 0 ? Math.min(100, Math.round((currentVal / goal) * 100)) : 0
	);
</script>

<div class="border-2 border-border bg-background p-4 sm:p-5 rounded-theme shadow-theme-sm {className}">
	<!-- Header with label and value / goal -->
	<div class="mb-2.5 flex items-center justify-between gap-2">
		<div>
			<div class="text-xs sm:text-sm font-bold text-foreground font-display">
				{label}
			</div>
			<div class="text-[11px] sm:text-xs text-muted-foreground font-medium">
				Goal: {goal.toLocaleString()} {unit}
			</div>
		</div>
		<div class="text-right">
			<div class="text-lg sm:text-xl font-black text-primary font-display leading-tight">
				{percentage}%
			</div>
			<div class="text-[11px] sm:text-xs font-bold text-muted-foreground font-mono">
				{currentVal.toLocaleString()} / {goal.toLocaleString()}
			</div>
		</div>
	</div>

	<!-- Progress Track & Bar -->
	<div class="h-5 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme shadow-inner" role="progressbar" aria-valuenow={currentVal} aria-valuemin={0} aria-valuemax={goal}>
		<div
			class="h-full bg-primary transition-all duration-700 rounded-theme"
			style="width: {percentage}%"
		></div>
	</div>
</div>
