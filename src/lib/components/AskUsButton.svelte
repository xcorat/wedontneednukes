<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		class?: string;
		href?: string;
		text?: string;
		position?: 'bottom' | 'top';
	}

	let {
		class: className = '',
		href = '/assistant',
		text = 'The AI Assistant is available for signed-in members. Log in to explore disarmament research and ask us questions.',
		position = 'bottom'
	}: Props = $props();

	const user = $derived(page.data.user);

	let isOpen = $state(false);
	let isHovered = $state(false);
	let isFocused = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);

	const isVisible = $derived(!user && (isOpen || isHovered || isFocused));
	const tooltipId = 'ask-us-tooltip';

	function handleTriggerClick(e: MouseEvent) {
		e.stopPropagation();
		if (!user) {
			isOpen = !isOpen;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isVisible) {
			isOpen = false;
			isHovered = false;
			isFocused = false;
		}
	}

	function handleWindowClick(e: MouseEvent) {
		if (!isVisible) return;
		if (containerEl && !containerEl.contains(e.target as Node)) {
			isOpen = false;
			isHovered = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerEl}
	class="relative inline-flex items-center {className}"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	{#if user}
		<a
			{href}
			aria-label="Ask Us - Open AI Assistant"
			class="inline-flex items-center gap-2 border-2 border-border bg-surface px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer font-display"
		>
			<span class="text-base sm:text-lg">🤖</span>
			<span>Ask Us</span>
		</a>
	{:else}
		<button
			type="button"
			aria-label="Sign in to Ask Us"
			aria-describedby={isVisible ? tooltipId : undefined}
			aria-expanded={isVisible}
			onclick={handleTriggerClick}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			class="inline-flex items-center gap-2 border-2 border-border bg-surface px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer font-display"
		>
			<span class="text-base sm:text-lg">🤖</span>
			<span>Ask Us</span>
		</button>
	{/if}

	<!-- Tooltip Popover (only for non-logged-in users) -->
	{#if isVisible}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			id={tooltipId}
			role="tooltip"
			class="absolute z-50 w-60 sm:w-64 max-w-[calc(100vw-2rem)] rounded-theme border-2 border-border bg-surface p-3.5 text-left font-body text-xs leading-relaxed text-foreground shadow-theme-md transition-opacity duration-150 select-text {position ===
			'top'
				? 'bottom-full mb-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2'
				: 'top-full mt-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2'}"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="flex items-center gap-1.5 mb-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
				<span class="inline-block h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
				<span>AI Assistant</span>
			</div>
			<p class="font-bold text-foreground text-xs leading-snug mb-3">
				{text}
			</p>
			<a
				href={`/auth?redirect=${encodeURIComponent(href)}`}
				class="inline-flex w-full items-center justify-center gap-1.5 border-2 border-border bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary-foreground rounded-theme shadow-theme-primary hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all font-display"
			>
				<span>Sign In to Chat</span>
				<span aria-hidden="true">→</span>
			</a>

			<!-- Pointer arrow -->
			{#if position === 'top'}
				<div
					class="absolute top-full right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 -mt-[5px] h-2 w-2 rotate-45 border-r-2 border-b-2 border-border bg-surface"
					aria-hidden="true"
				></div>
			{:else}
				<div
					class="absolute bottom-full right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 -mb-[5px] h-2 w-2 rotate-45 border-l-2 border-t-2 border-border bg-surface"
					aria-hidden="true"
				></div>
			{/if}
		</div>
	{/if}
</div>
