<script lang="ts">
	import JoinFormWidget from './JoinFormWidget.svelte';

	interface Props {
		answer?: 'no' | 'yes' | string;
		turnstileSiteKey?: string;
		allowInlineJoin?: boolean;
		dismissible?: boolean;
		class?: string;
	}

	let {
		answer = 'no',
		turnstileSiteKey = '',
		allowInlineJoin = true,
		dismissible = false,
		class: className = ''
	}: Props = $props();

	let isExpanded = $state(false);
	let isDismissed = $state(false);
</script>

{#if !isDismissed}
	<div class="mt-6 border-2 border-border bg-secondary/15 p-5 sm:p-6 rounded-theme shadow-theme-sm {className}">
		<div class="flex items-start justify-between gap-3">
			<div class="flex items-start gap-3">
				<span class="text-2xl sm:text-3xl" aria-hidden="true">💡</span>
				<div>
					<h3 class="text-base sm:text-lg font-black text-foreground font-display">
						Save your pledge &amp; claim your vote
					</h3>
					<p class="mt-1 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
						You voted anonymously. Sign in or create an account to secure your pledge permanently, join the community, and participate in next steps.
					</p>
				</div>
			</div>

			{#if dismissible}
				<button
					type="button"
					onclick={() => (isDismissed = true)}
					class="text-muted-foreground hover:text-foreground text-xs font-bold p-1 cursor-pointer"
					aria-label="Dismiss banner"
				>
					✕
				</button>
			{/if}
		</div>

		{#if !isExpanded}
			<div class="mt-4 flex flex-col sm:flex-row items-center gap-3">
				{#if allowInlineJoin}
					<button
						type="button"
						onclick={() => (isExpanded = true)}
						class="w-full sm:w-auto border-2 border-border bg-primary px-4 py-2 text-xs sm:text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
					>
						Claim vote &amp; sign in →
					</button>
				{/if}

				<a
					href="/auth?redirect=/dashboard"
					class="w-full sm:w-auto text-center border-2 border-border bg-surface px-4 py-2 text-xs sm:text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					Go to full sign in page
				</a>
			</div>
		{:else}
			<div class="mt-5 border-t-2 border-border/20 pt-4">
				<div class="flex items-center justify-between mb-3">
					<span class="text-xs font-bold text-foreground font-display uppercase tracking-wider">
						Quick Sign In
					</span>
					<button
						type="button"
						onclick={() => (isExpanded = false)}
						class="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
					>
						− Collapse
					</button>
				</div>
				<JoinFormWidget
					{answer}
					{turnstileSiteKey}
					callbackUrl="/dashboard"
					allowAnonymous={false}
					variant="inline"
				/>
			</div>
		{/if}
	</div>
{/if}
