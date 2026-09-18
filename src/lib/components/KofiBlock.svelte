<script lang="ts">
	interface Props {
		href?: string;
		text?: string;
		class?: string;
	}

	let {
		href = 'https://ko-fi.com/xcorat/goal?g=0',
		text = 'Support the developement on Ko-Fi <3',
		class: className = ''
	}: Props = $props();
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="flex items-center justify-between gap-3 border-2 border-border bg-secondary/15 hover:bg-secondary/25 p-4 sm:p-5 rounded-theme shadow-theme-sm transition-all hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none group text-foreground font-display cursor-pointer {className}"
>
	<div class="flex items-center gap-3 min-w-0">
		<span class="text-2xl select-none shrink-0" role="img" aria-label="Ko-fi">☕</span>
		<span class="font-black text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
			{text}
		</span>
	</div>
	<span
		class="shrink-0 inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-border transition-all"
	>
		<span>Support on Ko-fi</span>
		<span class="text-sm select-none" aria-hidden="true">→</span>
	</span>
</a>
