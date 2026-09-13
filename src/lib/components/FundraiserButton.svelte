<script lang="ts">
	interface Props {
		variant?: 'icon' | 'cartoon' | 'unicode' | 'compact' | 'pill';
		class?: string;
		href?: string;
		title?: string;
		ariaLabel?: string;
		text?: string;
	}

	let {
		variant = 'icon',
		class: className = '',
		href = '/fundraiser',
		title = 'Campaign Fundraiser',
		ariaLabel = 'Campaign Fundraiser',
		text = 'Fundraiser'
	}: Props = $props();

	// Convert standard ASCII letters to cartoonish unicode sans-serif bold characters
	function toCartoonUnicode(str: string): string {
		return str
			.split('')
			.map((char) => {
				const code = char.charCodeAt(0);
				// A-Z -> Mathematical Sans-Serif Bold (0x1D5D4 - 0x1D5ED)
				if (code >= 65 && code <= 90) {
					return String.fromCodePoint(0x1d5d4 + (code - 65));
				}
				// a-z -> Mathematical Sans-Serif Bold (0x1D5EE - 0x1D607)
				if (code >= 97 && code <= 122) {
					return String.fromCodePoint(0x1d5ee + (code - 97));
				}
				return char;
			})
			.join('');
	}

	const unicodeText = $derived(toCartoonUnicode(text));
</script>

{#if variant === 'icon'}
	<!-- Just the yellow heart button (square matching MenuButton) -->
	<a
		{href}
		{title}
		aria-label={ariaLabel}
		class="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-surface text-foreground shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
	>
		<span class="text-base select-none leading-none" role="img" aria-hidden="true">💛</span>
	</a>
{:else if variant === 'cartoon'}
	<!-- Cartoonish font text with yellow heart -->
	<a
		{href}
		{title}
		aria-label={ariaLabel}
		class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground font-display shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
	>
		<span class="text-base select-none leading-none" role="img" aria-hidden="true">💛</span>
		<span class="text-[15px] tracking-wide">{text}</span>
	</a>
{:else if variant === 'unicode'}
	<!-- Unicode cartoon/bold stylized text with yellow heart -->
	<a
		{href}
		{title}
		aria-label={ariaLabel}
		class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm text-foreground shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
	>
		<span class="text-base select-none leading-none" role="img" aria-hidden="true">💛</span>
		<span class="font-normal tracking-wide">{unicodeText}</span>
	</a>
{:else if variant === 'pill'}
	<!-- Playful rounded pill variant -->
	<a
		{href}
		{title}
		aria-label={ariaLabel}
		class="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-secondary px-4 py-1.5 text-xs font-black uppercase tracking-wider text-secondary-foreground font-display shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {className}"
	>
		<span class="text-sm select-none leading-none" role="img" aria-hidden="true">💛</span>
		<span>{text}</span>
	</a>
{:else}
	<!-- Compact variant -->
	<a
		{href}
		{title}
		aria-label={ariaLabel}
		class="inline-flex items-center gap-1 border-2 border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground font-display shadow-theme-sm rounded-theme transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer {className}"
	>
		<span class="text-xs select-none leading-none" role="img" aria-hidden="true">💛</span>
		<span>{text}</span>
	</a>
{/if}
