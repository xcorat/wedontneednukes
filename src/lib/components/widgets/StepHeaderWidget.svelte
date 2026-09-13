<script lang="ts">
	import type { Snippet } from 'svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import BotButton from '$lib/components/BotButton.svelte';

	interface Props {
		backHref?: string;
		backLabel?: string;
		answer?: 'no' | 'yes' | string | null;
		showFundraiser?: boolean;
		showShare?: boolean;
		showBot?: boolean;
		showMenu?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		backHref,
		backLabel = '← Back',
		answer = null,
		showFundraiser = false,
		showShare = true,
		showBot = true,
		showMenu = true,
		class: className = '',
		children
	}: Props = $props();

	const answeredNo = $derived(answer === 'no');
</script>

<div class="mb-5 sm:mb-6 flex items-center justify-between gap-3 {className}">
	<div>
		{#if backHref}
			<a
				href={backHref}
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				{backLabel}
			</a>
		{/if}
	</div>

	<div class="flex items-center gap-2 sm:gap-3">
		{#if answer !== null && answer !== undefined}
			<div
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm font-display"
			>
				<span>{answeredNo ? '🕊️' : '🤔'}</span>
				<span>{answeredNo ? "No, we don't" : 'Yes, we do'}</span>
			</div>
		{/if}

		{#if showFundraiser}
			<FundraiserButton variant="icon" />
		{/if}

		{#if showShare}
			<ShareButton />
		{/if}

		{#if showBot}
			<BotButton />
		{/if}

		{#if showMenu}
			<MenuButton />
		{/if}

		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
