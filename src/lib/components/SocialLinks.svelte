<script lang="ts">
	import { OFFICIAL_CHANNELS } from '$lib/constants/social.js';

	interface Props {
		variant?: 'icons' | 'pill' | 'list';
		size?: 'sm' | 'md';
		class?: string;
	}

	let { variant = 'icons', size = 'md', class: className = '' }: Props = $props();

	const channels = [
		{
			id: 'x',
			name: OFFICIAL_CHANNELS.x.name,
			handle: OFFICIAL_CHANNELS.x.handle,
			url: OFFICIAL_CHANNELS.x.url,
			svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
		},
		{
			id: 'bluesky',
			name: OFFICIAL_CHANNELS.bluesky.name,
			handle: OFFICIAL_CHANNELS.bluesky.handle,
			url: OFFICIAL_CHANNELS.bluesky.url,
			svg: 'M12 10.8c-1.787-4.14-5.25-6.8-8.25-6.8-4.5 0-5.25 4.5-2.25 9.75 2.25 3.938 6.75 5.25 10.5 2.25 3.75 3 8.25 1.688 10.5-2.25 3-5.25 2.25-9.75-2.25-9.75-3 0-6.463 2.66-8.25 6.8z'
		},
		{
			id: 'facebook',
			name: OFFICIAL_CHANNELS.facebook.name,
			handle: OFFICIAL_CHANNELS.facebook.handle,
			url: OFFICIAL_CHANNELS.facebook.url,
			svg: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
		},
		{
			id: 'tiktok',
			name: OFFICIAL_CHANNELS.tiktok.name,
			handle: OFFICIAL_CHANNELS.tiktok.handle,
			url: OFFICIAL_CHANNELS.tiktok.url,
			svg: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76c-.3-.02-.59-.04-.89-.07z'
		}
	];
</script>

{#if variant === 'icons'}
	<div class="flex items-center gap-2 {className}">
		{#each channels as channel (channel.id)}
			<a
				href={channel.url}
				target="_blank"
				rel="noopener noreferrer"
				title={`Follow on ${channel.name} (${channel.handle})`}
				aria-label={`Follow on ${channel.name}`}
				class="inline-flex items-center justify-center border-2 border-border bg-surface text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer {size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'}"
			>
				<svg class={size === 'sm' ? 'h-4 w-4' : 'h-4.5 w-4.5'} fill="currentColor" viewBox="0 0 24 24">
					<path d={channel.svg} />
				</svg>
			</a>
		{/each}
	</div>
{:else if variant === 'pill'}
	<div class="flex flex-wrap items-center gap-2 {className}">
		{#each channels as channel (channel.id)}
			<a
				href={channel.url}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground rounded-theme shadow-theme-sm hover:translate-y-[1px] hover:bg-secondary hover:text-secondary-foreground transition-all"
			>
				<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
					<path d={channel.svg} />
				</svg>
				<span>{channel.name}</span>
			</a>
		{/each}
	</div>
{:else}
	<div class="flex flex-col gap-2 {className}">
		{#each channels as channel (channel.id)}
			<a
				href={channel.url}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center justify-between border-2 border-border bg-background px-3 py-2 text-xs font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all"
			>
				<span class="flex items-center gap-2">
					<svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
						<path d={channel.svg} />
					</svg>
					<span>{channel.name}</span>
				</span>
				<span class="font-mono text-[11px] text-muted-foreground">{channel.handle}</span>
			</a>
		{/each}
	</div>
{/if}
