<script lang="ts">
	import { menuState } from '$lib/menu.svelte.js';

	let { class: className = '' }: { class?: string } = $props();
</script>

<button
	type="button"
	aria-label="Menu"
	onclick={() => menuState.toggle()}
	class="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-surface text-foreground shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
>
	<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
	</svg>
</button>
