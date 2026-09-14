<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		DEFAULT_SHARE_HASHTAGS,
		DEFAULT_SHARE_TEXT,
		buildShareUrl,
		type SharePlatform
	} from '$lib/constants/social.js';

	interface Props {
		url?: string;
		text?: string;
		hashtags?: readonly string[] | string[];
		title?: string;
		variant?: 'card' | 'row' | 'compact';
		platforms?: SharePlatform[];
		showCopy?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		url = '',
		text = DEFAULT_SHARE_TEXT,
		hashtags = DEFAULT_SHARE_HASHTAGS,
		title = 'Share this campaign',
		variant = 'card',
		platforms = ['x', 'bluesky', 'threads', 'facebook', 'whatsapp', 'linkedin'],
		showCopy = true,
		class: className = '',
		children
	}: Props = $props();

	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	// Resolve target share URL: if prop is provided, use it; otherwise client location or fallback
	const targetUrl = $derived.by(() => {
		if (url) return url;
		if (typeof window !== 'undefined' && window.location?.href) {
			return window.location.href;
		}
		return 'https://wedontneednukes.org';
	});

	const platformMeta: Record<SharePlatform, { name: string; svg: string }> = {
		x: {
			name: 'X',
			svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
		},
		bluesky: {
			name: 'Bluesky',
			svg: 'M12 10.8c-1.787-4.14-5.25-6.8-8.25-6.8-4.5 0-5.25 4.5-2.25 9.75 2.25 3.938 6.75 5.25 10.5 2.25 3.75 3 8.25 1.688 10.5-2.25 3-5.25 2.25-9.75-2.25-9.75-3 0-6.463 2.66-8.25 6.8z'
		},
		threads: {
			name: 'Threads',
			svg: 'M12.186 24C5.467 24 0 18.533 0 11.814 0 5.095 5.467 0 12.186 0c6.643 0 12.09 5.371 12.186 11.974h-2.909c-.09-4.995-4.17-9.065-9.277-9.065-5.132 0-9.275 4.143-9.275 9.275s4.143 9.275 9.275 9.275c4.019 0 7.42-2.54 8.718-6.108H12.186v-2.909h11.628c.114.733.186 1.493.186 2.278C24 18.533 18.533 24 12.186 24z'
		},
		facebook: {
			name: 'Facebook',
			svg: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
		},
		whatsapp: {
			name: 'WhatsApp',
			svg: 'M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.2-.351.226-.652.075s-1.271-.469-2.422-1.496c-.896-.799-1.501-1.787-1.677-2.088-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.588-.493-.508-.678-.517-.175-.009-.376-.011-.577-.011s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.911 1.23 3.112.15.2 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.722.23 1.379.197 1.9.12.58-.086 1.78-.728 2.031-1.431.251-.703.251-1.306.175-1.431-.076-.126-.276-.201-.577-.351zM12.04 21.786h-.008a9.8 9.8 0 0 1-4.992-1.371l-.358-.213-3.712.973.991-3.619-.233-.372a9.78 9.78 0 0 1-1.5-5.176c0-5.417 4.408-9.825 9.83-9.825 2.625 0 5.093 1.023 6.95 2.88 1.856 1.857 2.878 4.326 2.877 6.952-.001 5.418-4.41 9.827-9.832 9.827l-.013-.056zM20.52 3.468C18.253 1.2 15.234 0 12.04 0 5.463 0 .114 5.35.111 11.928c-.001 2.099.548 4.148 1.59 5.962L0 24l6.304-1.654a11.88 11.88 0 0 0 5.733 1.472h.005c6.576 0 11.928-5.35 11.93-11.93 0-3.19-.948-6.192-3.452-8.42z'
		},
		linkedin: {
			name: 'LinkedIn',
			svg: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
		}
	};

	async function copyLink() {
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(targetUrl);
			} else {
				// Fallback for older browsers
				const input = document.createElement('textarea');
				input.value = targetUrl;
				document.body.appendChild(input);
				input.select();
				document.execCommand('copy');
				document.body.removeChild(input);
			}
			copied = true;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copied = false;
			}, 2500);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}
</script>

{#if variant === 'card'}
	<section
		aria-label="Social Sharing"
		class="border-2 sm:border-[3px] border-border bg-surface p-5 sm:p-6 rounded-theme shadow-theme-sm sm:shadow-theme-md {className}"
	>
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-border/20 pb-3 mb-4">
			<div>
				<h3 class="text-base sm:text-lg font-black uppercase tracking-wide text-foreground font-display">
					{title}
				</h3>
				<p class="text-xs text-muted-foreground font-body">
					Amplify the premise. Every voice shared moves us closer to zero.
				</p>
			</div>
			<div class="hidden sm:block">
				<span class="border border-border bg-secondary px-2 py-0.5 text-[10px] font-black uppercase text-secondary-foreground rounded-theme">
					#WeDontNeedNukes
				</span>
			</div>
		</div>

		<!-- Share Buttons Row -->
		<div class="flex flex-wrap items-center gap-2">
			{#each platforms as platform (platform)}
				{@const meta = platformMeta[platform]}
				<a
					href={buildShareUrl(platform, { url: targetUrl, text, hashtags, title })}
					target="_blank"
					rel="noopener noreferrer"
					title={`Share on ${meta.name}`}
					aria-label={`Share on ${meta.name}`}
					class="inline-flex items-center gap-1.5 border-2 border-border bg-background px-3 py-2 text-xs font-bold text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
				>
					<svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
						<path d={meta.svg} />
					</svg>
					<span>{meta.name}</span>
				</a>
			{/each}

			{#if showCopy}
				<button
					type="button"
					onclick={copyLink}
					aria-label={copied ? 'Link copied' : 'Copy link to clipboard'}
					class="inline-flex items-center gap-1.5 border-2 border-border px-3 py-2 text-xs font-bold rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {copied ? 'bg-success text-success-foreground' : 'bg-surface text-foreground hover:bg-muted/20'}"
				>
					{#if copied}
						<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
						</svg>
						<span>Copied! ✓</span>
					{:else}
						<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-4.316l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
						</svg>
						<span>Copy Link</span>
					{/if}
				</button>
			{/if}
		</div>

		{#if children}
			<div class="mt-4 pt-3 border-t-2 border-border/20">
				{@render children()}
			</div>
		{/if}
	</section>
{:else if variant === 'compact'}
	<div class="flex items-center gap-1.5 {className}">
		<span class="text-xs font-bold text-muted-foreground mr-1">Share:</span>
		{#each platforms as platform (platform)}
			{@const meta = platformMeta[platform]}
			<a
				href={buildShareUrl(platform, { url: targetUrl, text, hashtags, title })}
				target="_blank"
				rel="noopener noreferrer"
				title={`Share on ${meta.name}`}
				aria-label={`Share on ${meta.name}`}
				class="inline-flex h-8 w-8 items-center justify-center border-2 border-border bg-surface text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
			>
				<svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
					<path d={meta.svg} />
				</svg>
			</a>
		{/each}

		{#if showCopy}
			<button
				type="button"
				onclick={copyLink}
				title={copied ? 'Copied!' : 'Copy link'}
				aria-label={copied ? 'Link copied' : 'Copy link'}
				class="inline-flex h-8 w-8 items-center justify-center border-2 border-border rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {copied ? 'bg-success text-success-foreground' : 'bg-surface text-foreground hover:bg-muted/20'}"
			>
				{#if copied}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
					</svg>
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-4.316l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
					</svg>
				{/if}
			</button>
		{/if}
	</div>
{:else}
	<!-- row variant -->
	<div class="flex flex-wrap items-center gap-2 {className}">
		{#each platforms as platform (platform)}
			{@const meta = platformMeta[platform]}
			<a
				href={buildShareUrl(platform, { url: targetUrl, text, hashtags, title })}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground transition-all"
			>
				<svg class="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
					<path d={meta.svg} />
				</svg>
				<span>{meta.name}</span>
			</a>
		{/each}

		{#if showCopy}
			<button
				type="button"
				onclick={copyLink}
				class="inline-flex items-center gap-1.5 border-2 border-border px-3 py-1.5 text-xs font-bold rounded-theme shadow-theme-sm hover:translate-y-[1px] transition-all cursor-pointer {copied ? 'bg-success text-success-foreground' : 'bg-surface text-foreground hover:bg-muted/20'}"
			>
				{#if copied}
					<span>Copied! ✓</span>
				{:else}
					<span>Copy Link 🔗</span>
				{/if}
			</button>
		{/if}
	</div>
{/if}
