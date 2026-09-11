<script lang="ts">
	import { menuState } from '$lib/menu.svelte.js';

	let { class: className = '' }: { class?: string } = $props();
</script>

<button
	type="button"
	aria-label="Menu"
	onclick={() => menuState.toggle()}
	class="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#212121] bg-white text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer {className}"
>
	<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
	</svg>
</button>
