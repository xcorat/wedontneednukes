<script lang="ts">
	import { themeState, THEMES, type Theme } from '$lib/theme.svelte.js';

	interface Props {
		compact?: boolean;
		class?: string;
	}

	let { compact = false, class: className = '' }: Props = $props();
</script>

<div class="flex flex-col gap-2.5 {className}" role="radiogroup" aria-label="Visual Themes">
	<div class="flex items-center justify-between">
		<span class="text-xs font-black uppercase tracking-wider text-muted-foreground">
			Theme Style
		</span>
		<span class="text-[11px] font-mono text-muted-foreground">
			active: <strong>{themeState.current}</strong>
		</span>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group">
		{#each THEMES as theme}
			{@const isActive = themeState.current === theme.id}
			<button
				type="button"
				role="radio"
				aria-checked={isActive}
				onclick={() => themeState.setTheme(theme.id)}
				class="flex flex-col text-left border-2 p-2.5 transition-all cursor-pointer rounded-theme {isActive
					? 'border-border bg-secondary text-secondary-foreground shadow-theme-sm'
					: 'border-border/40 bg-surface/70 text-foreground hover:border-border hover:bg-surface'}"
			>
				<div class="flex items-center justify-between gap-1 w-full">
					<div class="flex items-center gap-1.5">
						<span
							class="inline-block h-2.5 w-2.5 rounded-full border border-border shrink-0 {isActive
								? 'bg-primary'
								: 'bg-transparent'}"
						></span>
						<span class="text-xs font-bold leading-tight">{theme.name}</span>
					</div>
					<span
						class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 border border-border/60 shrink-0 {isActive
							? 'bg-primary text-primary-foreground'
							: 'bg-muted/30 text-muted-foreground'}"
					>
						{theme.badge}
					</span>
				</div>

				{#if !compact}
					<p class="mt-1 text-[11px] text-muted-foreground leading-snug">
						{theme.description}
					</p>
					<div class="mt-1.5 flex items-center gap-1 text-[9px] font-mono opacity-80">
						<span class="bg-background/80 px-1 py-0.5 border border-border/20">
							{theme.preview.font}
						</span>
						<span class="bg-background/80 px-1 py-0.5 border border-border/20">
							r:{theme.preview.radius}
						</span>
						<span class="bg-background/80 px-1 py-0.5 border border-border/20">
							{theme.preview.shadow}
						</span>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
