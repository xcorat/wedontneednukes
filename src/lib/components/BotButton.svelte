<script lang="ts">
	interface Props {
		class?: string;
		text?: string;
		title?: string;
		position?: 'bottom' | 'top';
	}

	let {
		class: className = '',
		text = 'Helper chat bot coming soon.',
		title = 'Campaign Assistant',
		position = 'bottom'
	}: Props = $props();

	let isOpen = $state(false);
	let isHovered = $state(false);
	let isFocused = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);

	const isVisible = $derived(isOpen || isHovered || isFocused);
	const tooltipId = 'bot-helper-tooltip';

	function handleTriggerClick(e: MouseEvent) {
		e.stopPropagation();
		isOpen = !isOpen;
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
	class="relative inline-flex items-center"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<button
		type="button"
		aria-label={title}
		aria-describedby={isVisible ? tooltipId : undefined}
		aria-expanded={isVisible}
		onclick={handleTriggerClick}
		onfocus={() => (isFocused = true)}
		onblur={() => (isFocused = false)}
		class="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-surface text-foreground shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
	>
		<svg
			class="h-5 w-5 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<!-- Robot Antenna -->
			<circle cx="12" cy="4" r="1.5" fill="currentColor" />
			<line x1="12" y1="5.5" x2="12" y2="8" stroke-width="2" />
			<!-- Robot Head -->
			<rect x="4" y="8" width="16" height="13" rx="2" />
			<!-- Eyes -->
			<circle cx="9" cy="13" r="1.25" fill="currentColor" />
			<circle cx="15" cy="13" r="1.25" fill="currentColor" />
			<!-- Mouth / Grille -->
			<line x1="9" y1="17" x2="15" y2="17" stroke-width="1.5" />
			<!-- Ear bolts -->
			<line x1="2" y1="14.5" x2="4" y2="14.5" stroke-width="2" />
			<line x1="20" y1="14.5" x2="22" y2="14.5" stroke-width="2" />
		</svg>
	</button>

	<!-- Tooltip Popover -->
	{#if isVisible}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			id={tooltipId}
			role="tooltip"
			class="absolute z-50 w-56 sm:w-64 max-w-[calc(100vw-2rem)] rounded-theme border-2 border-border bg-surface p-3 text-left font-body text-xs leading-relaxed text-foreground shadow-theme-md transition-opacity duration-150 select-text {position ===
			'top'
				? 'bottom-full mb-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2'
				: 'top-full mt-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2'}"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="flex items-center gap-1.5 mb-1 text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
				<span class="inline-block h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
				<span>AI Assistant</span>
			</div>
			<p class="font-bold text-foreground text-xs leading-snug">
				{text}
			</p>

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
