<script lang="ts">
	import { menuState } from '$lib/menu.svelte.js';
	import { VERSION_LABEL } from '$lib/version.js';

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menuState.isOpen) {
			menuState.close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if menuState.isOpen}
	<!-- Backdrop -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 bg-[#212121]/50 backdrop-blur-xs transition-opacity duration-200"
		onclick={() => menuState.close()}
	></div>

	<!-- Drawer panel -->
	<div
		role="dialog"
		aria-label="Site Menu"
		aria-modal="true"
		class="fixed top-0 right-0 z-50 flex h-full w-full max-w-xs sm:max-w-sm flex-col border-l-4 border-[#212121] bg-white text-[#212121] shadow-[-6px_0_0_#212121] transition-transform duration-200 ease-out font-['Poppins',sans-serif]"
	>
		<!-- Header -->
		<header class="flex h-16 shrink-0 items-center justify-between border-b-2 border-[#212121] px-5 bg-[#FFFDE7]">
			<h2 class="text-xl font-black uppercase tracking-wider text-[#212121]">Menu</h2>
			<button
				type="button"
				aria-label="Close menu"
				onclick={() => menuState.close()}
				class="inline-flex h-9 w-9 items-center justify-center border-2 border-[#212121] bg-white text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</header>

		<!-- Menu content area (empty for now, reserved for future buttons) -->
		<div class="flex-1 overflow-y-auto p-5">
			<!-- Future menu buttons and navigation will go here -->
		</div>

		<!-- Status bar: aligned bottom showing version and git commit id -->
		<footer class="mt-auto border-t-2 border-[#212121] bg-[#FFFDE7] px-5 py-3 select-text">
			<p class="text-xs font-mono font-medium tracking-wide text-[#757575]">
				{VERSION_LABEL}
			</p>
		</footer>
	</div>
{/if}
