<script lang="ts">
	import ResearchChatWidget from './ResearchChatWidget.svelte';

	let isOpen = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Floating Action Button Trigger (when closed) -->
{#if !isOpen}
	<div class="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 select-none font-display">
		<button
			type="button"
			onclick={() => (isOpen = true)}
			class="group flex items-center gap-2 border-2 border-border bg-primary px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
			aria-label="Ask Questions"
		>
			<span class="text-base sm:text-lg">🤖</span>
			<span class="tracking-wider uppercase">Ask Questions</span>
		</button>
	</div>
{/if}

<!-- Drawer Panel (when open) -->
{#if isOpen}
	<!-- Backdrop -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-xs transition-opacity duration-200"
		onclick={() => (isOpen = false)}
	></div>

	<!-- Drawer Container -->
	<div
		role="dialog"
		aria-label="AI Assistant Drawer"
		aria-modal="true"
		class="fixed bottom-0 right-0 z-50 flex h-[92vh] sm:h-[85vh] w-full sm:w-[480px] max-w-full flex-col border-t-4 sm:border-t-0 sm:border-l-4 border-border bg-surface text-foreground shadow-[-6px_0_0_var(--border)] font-body overflow-hidden"
	>
		<!-- Embedded ResearchChatWidget with single consolidated header -->
		<div class="flex-1 overflow-hidden h-full">
			<ResearchChatWidget
				compact={true}
				class="h-full border-0 shadow-none rounded-none"
				onClose={() => (isOpen = false)}
				showFullViewLink={true}
			/>
		</div>
	</div>
{/if}
