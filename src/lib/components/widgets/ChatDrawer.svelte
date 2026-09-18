<script lang="ts">
	import { page } from '$app/stores';
	import { chatState } from '$lib/chat.svelte.js';
	import ResearchChatWidget from './ResearchChatWidget.svelte';

	const user = $derived($page.data.user);
	const isWikiRoute = $derived($page.url.pathname.startsWith('/wiki'));

	let isTooltipOpen = $state(false);
	let isHovered = $state(false);
	let isFocused = $state(false);
	let triggerContainerEl = $state<HTMLDivElement | null>(null);

	const isTooltipVisible = $derived(!user && (isTooltipOpen || isHovered || isFocused));

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (chatState.isOpen) {
				chatState.close();
			}
			if (isTooltipVisible) {
				isTooltipOpen = false;
				isHovered = false;
				isFocused = false;
			}
		}
	}

	function handleTriggerClick(e: MouseEvent) {
		e.stopPropagation();
		if (user) {
			chatState.open();
		} else {
			isTooltipOpen = !isTooltipOpen;
		}
	}

	function handleWindowClick(e: MouseEvent) {
		if (!isTooltipVisible) return;
		if (triggerContainerEl && !triggerContainerEl.contains(e.target as Node)) {
			isTooltipOpen = false;
			isHovered = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<!-- Floating Action Button Trigger (ONLY on wiki pages when closed) -->
{#if isWikiRoute && !chatState.isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={triggerContainerEl}
		class="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6 select-none font-display"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<button
			type="button"
			onclick={handleTriggerClick}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			class="group flex items-center gap-2 border-2 border-border bg-primary px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
			aria-label={user ? 'Ask Questions' : 'Sign in to Ask Questions'}
			aria-expanded={user ? chatState.isOpen : isTooltipVisible}
		>
			<span class="text-base sm:text-lg">🤖</span>
			<span class="tracking-wider uppercase">Ask Questions</span>
		</button>

		<!-- Tooltip for unauthenticated users on wiki pages -->
		{#if isTooltipVisible}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				role="tooltip"
				class="absolute bottom-full right-0 mb-3 w-64 max-w-[calc(100vw-2rem)] rounded-theme border-2 border-border bg-surface p-3.5 text-left font-body text-xs leading-relaxed text-foreground shadow-theme-md transition-opacity duration-150 select-text"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="flex items-center gap-1.5 mb-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
					<span class="inline-block h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
					<span>AI Assistant</span>
				</div>
				<p class="font-bold text-foreground text-xs leading-snug mb-3">
					The AI Assistant is available for signed-in members. Log in to ask questions about the wiki and disarmament research.
				</p>
				<a
					href={`/auth?redirect=${encodeURIComponent($page.url.pathname + $page.url.search)}`}
					class="inline-flex w-full items-center justify-center gap-1.5 border-2 border-border bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary-foreground rounded-theme shadow-theme-primary hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
				>
					<span>Sign In</span>
					<span aria-hidden="true">→</span>
				</a>
				<!-- Pointer arrow -->
				<div
					class="absolute top-full right-6 -mt-[5px] h-2 w-2 rotate-45 border-r-2 border-b-2 border-border bg-surface"
					aria-hidden="true"
				></div>
			</div>
		{/if}
	</div>
{/if}

<!-- Drawer Panel (when open) -->
{#if chatState.isOpen}
	<!-- Backdrop -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-xs transition-opacity duration-200"
		onclick={() => chatState.close()}
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
				onClose={() => chatState.close()}
				showFullViewLink={true}
			/>
		</div>
	</div>
{/if}
