<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types.js';
	import MenuBar from '$lib/components/MenuBar.svelte';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<aside
	aria-label="Under Construction"
	class="sticky top-0 z-50 flex h-8 w-full items-center justify-center border-b-2 border-[#212121] px-4 select-none font-['Poppins',sans-serif]"
	style="background: repeating-linear-gradient(-45deg, #FFD600, #FFD600 12px, #FFFDE7 12px, #FFFDE7 24px);"
>
	<div class="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black tracking-wider uppercase text-[#212121]">
		<span>Under Construction</span>
		<svg
			class="h-4 w-4 shrink-0 text-[#212121]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			role="img"
			aria-label="Warning"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	</div>
</aside>

{@render children()}

<MenuBar />
