<script lang="ts">
	import SocialShareWidget from '$lib/components/widgets/SocialShareWidget.svelte';

	interface Props {
		class?: string;
		title?: string;
		shareTitle?: string;
		shareText?: string;
		url?: string;
		hashtags?: readonly string[] | string[];
	}

	let {
		class: className = '',
		title = 'Share',
		shareTitle = 'Share this campaign',
		shareText,
		url,
		hashtags
	}: Props = $props();

	let isOpen = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative inline-flex items-center">
	<button
		type="button"
		aria-label={title}
		title={title}
		aria-expanded={isOpen}
		onclick={() => (isOpen = !isOpen)}
		class="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-surface text-foreground shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
	>
		<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
			/>
		</svg>
	</button>

	{#if isOpen}
		<!-- Backdrop -->
		<div
			role="presentation"
			class="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs"
			onclick={() => (isOpen = false)}
		></div>

		<!-- Share Popover / Modal -->
		<div
			role="dialog"
			aria-label={shareTitle}
			aria-modal="true"
			class="fixed sm:absolute top-16 right-4 sm:right-0 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-sm border-2 sm:border-[3px] border-border bg-surface p-4 sm:p-5 text-foreground rounded-theme shadow-theme-lg font-body"
		>
			<div class="flex items-center justify-between border-b-2 border-border/20 pb-3 mb-3">
				<h3 class="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-1.5">
					<span>📣</span>
					<span>{shareTitle}</span>
				</h3>
				<button
					type="button"
					aria-label="Close share dialog"
					onclick={() => (isOpen = false)}
					class="inline-flex h-7 w-7 items-center justify-center border-2 border-border bg-background text-foreground rounded-theme shadow-theme-sm hover:translate-y-[1px] cursor-pointer"
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<SocialShareWidget
				variant="card"
				title="One-click Share"
				text={shareText}
				{url}
				{hashtags}
				class="!border-0 !p-0 !shadow-none"
			/>
		</div>
	{/if}
</div>
