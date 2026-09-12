<script module lang="ts">
	export type HelpDisplayMode = 'tooltip' | 'inline' | 'responsive';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		text?: string;
		title?: string;
		mode?: HelpDisplayMode;
		breakpoint?: 'sm' | 'md' | 'lg';
		position?: 'top' | 'bottom';
		size?: 'sm' | 'md';
		ariaLabel?: string;
		class?: string;
		contentClass?: string;
		inlineClass?: string;
		children?: Snippet;
	}

	let {
		text = '',
		title = '',
		mode = 'tooltip',
		breakpoint = 'sm',
		position = 'top',
		size = 'sm',
		ariaLabel = 'More information',
		class: triggerClass = '',
		contentClass = '',
		inlineClass = '',
		children
	}: Props = $props();

	let isOpen = $state(false);
	let isHovered = $state(false);
	let isFocused = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);

	const isVisible = $derived(isOpen || isHovered || isFocused);
	const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;

	function handleTriggerClick(e: MouseEvent) {
		// Stop propagation so parent click handlers (e.g. card/row selection) are not invoked
		e.stopPropagation();
		isOpen = !isOpen;
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			e.stopPropagation();
			isOpen = !isOpen;
		} else if (e.key === 'Escape' && isVisible) {
			e.preventDefault();
			e.stopPropagation();
			isOpen = false;
			isHovered = false;
			isFocused = false;
		}
	}

	function handleWindowClick(e: MouseEvent) {
		if (mode === 'inline' || !isVisible) return;
		if (containerEl && !containerEl.contains(e.target as Node)) {
			isOpen = false;
			isHovered = false;
		}
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (mode === 'inline' || !isVisible) return;
		if (e.key === 'Escape') {
			isOpen = false;
			isHovered = false;
			isFocused = false;
		}
	}

	const sizeClasses = {
		sm: 'h-4 w-4 text-[10px]',
		md: 'h-5 w-5 text-xs'
	};

	const breakpointClasses = {
		sm: {
			trigger: 'inline-flex sm:hidden',
			inline: 'hidden sm:block'
		},
		md: {
			trigger: 'inline-flex md:hidden',
			inline: 'hidden md:block'
		},
		lg: {
			trigger: 'inline-flex lg:hidden',
			inline: 'hidden lg:block'
		}
	};
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

{#if mode === 'inline'}
	<!-- Always Inline Text Mode -->
	<div class="w-full basis-full mt-1">
		{#if text}
			<p class="text-xs text-muted-foreground leading-relaxed {inlineClass}">
				{text}
			</p>
		{/if}
		{#if children}
			<div class="text-xs text-muted-foreground leading-relaxed {inlineClass}">
				{@render children()}
			</div>
		{/if}
	</div>
{:else if mode === 'responsive'}
	<!-- Responsive Mode: Tooltip on Mobile, Inline Text on Desktop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={containerEl}
		class="relative {breakpointClasses[breakpoint].trigger} items-center align-middle"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<!-- Trigger Button -->
		<button
			type="button"
			aria-label={ariaLabel}
			aria-describedby={isVisible ? tooltipId : undefined}
			aria-expanded={isVisible}
			onclick={handleTriggerClick}
			onkeydown={handleTriggerKeydown}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			class="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-150 hover:bg-secondary hover:text-secondary-foreground hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer {sizeClasses[
				size
			]} {triggerClass}"
		>
			<svg
				class="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current"
				viewBox="0 0 20 20"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		<!-- Tooltip Popover -->
		{#if isVisible}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				id={tooltipId}
				role="tooltip"
				class="absolute z-50 w-64 sm:w-72 max-w-[calc(100vw-3rem)] rounded-theme border-2 border-border bg-surface p-3 text-left font-body text-xs leading-relaxed text-foreground shadow-theme-md transition-opacity duration-150 select-text {position ===
				'top'
					? 'bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2'
					: 'top-full mt-2 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2'} {contentClass}"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				{#if title}
					<div class="mb-1 text-xs font-black tracking-wide text-foreground font-display">
						{title}
					</div>
				{/if}

				{#if text}
					<p class="text-xs text-foreground/90 leading-relaxed">{text}</p>
				{/if}

				{#if children}
					{@render children()}
				{/if}

				<!-- Pointer arrow -->
				{#if position === 'top'}
					<div
						class="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] h-2 w-2 rotate-45 border-r-2 border-b-2 border-border bg-surface"
						aria-hidden="true"
					></div>
				{:else}
					<div
						class="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[5px] h-2 w-2 rotate-45 border-l-2 border-t-2 border-border bg-surface"
						aria-hidden="true"
					></div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Desktop Inline Text -->
	<div class="{breakpointClasses[breakpoint].inline} w-full basis-full mt-1">
		{#if text}
			<p class="text-xs text-muted-foreground leading-relaxed {inlineClass}">
				{text}
			</p>
		{/if}
		{#if children}
			<div class="text-xs text-muted-foreground leading-relaxed {inlineClass}">
				{@render children()}
			</div>
		{/if}
	</div>
{:else}
	<!-- Always Tooltip Mode -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={containerEl}
		class="relative inline-flex items-center align-middle"
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		<!-- Trigger Button -->
		<button
			type="button"
			aria-label={ariaLabel}
			aria-describedby={isVisible ? tooltipId : undefined}
			aria-expanded={isVisible}
			onclick={handleTriggerClick}
			onkeydown={handleTriggerKeydown}
			onfocus={() => (isFocused = true)}
			onblur={() => (isFocused = false)}
			class="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-all duration-150 hover:bg-secondary hover:text-secondary-foreground hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer {sizeClasses[
				size
			]} {triggerClass}"
		>
			<svg
				class="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current"
				viewBox="0 0 20 20"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		<!-- Tooltip Popover -->
		{#if isVisible}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				id={tooltipId}
				role="tooltip"
				class="absolute z-50 w-64 sm:w-72 max-w-[calc(100vw-3rem)] rounded-theme border-2 border-border bg-surface p-3 text-left font-body text-xs leading-relaxed text-foreground shadow-theme-md transition-opacity duration-150 select-text {position ===
				'top'
					? 'bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2'
					: 'top-full mt-2 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2'} {contentClass}"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				{#if title}
					<div class="mb-1 text-xs font-black tracking-wide text-foreground font-display">
						{title}
					</div>
				{/if}

				{#if text}
					<p class="text-xs text-foreground/90 leading-relaxed">{text}</p>
				{/if}

				{#if children}
					{@render children()}
				{/if}

				<!-- Pointer arrow -->
				{#if position === 'top'}
					<div
						class="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] h-2 w-2 rotate-45 border-r-2 border-b-2 border-border bg-surface"
						aria-hidden="true"
					></div>
				{:else}
					<div
						class="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[5px] h-2 w-2 rotate-45 border-l-2 border-t-2 border-border bg-surface"
						aria-hidden="true"
					></div>
				{/if}
			</div>
		{/if}
	</div>
{/if}
