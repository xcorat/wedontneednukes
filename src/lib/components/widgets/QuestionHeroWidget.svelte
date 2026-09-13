<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		variant?: 'hero' | 'card' | 'compact';
		headlineTop?: string;
		headlineAccent?: string;
		whyHref?: string;
		selectedChoice?: 'agree' | 'other' | null;
		onChoice?: (choice: 'agree' | 'other') => void;
		class?: string;
	}

	let {
		variant = 'hero',
		headlineTop = "We don't need",
		headlineAccent = 'Nukes !',
		whyHref = '/why',
		selectedChoice = null,
		onChoice,
		class: className = ''
	}: Props = $props();

	function handleChoiceClick(choice: 'agree' | 'other') {
		if (onChoice) {
			onChoice(choice);
		} else {
			const queryAnswer = choice === 'agree' ? 'no' : 'yes';
			goto(`/auth?answer=${queryAnswer}`);
		}
	}
</script>

{#if variant === 'hero'}
	<div class="flex flex-1 flex-col w-full overflow-hidden select-none {className}">
		<!-- Headline: We don't need / Nukes -->
		<section class="flex flex-1 sm:flex-none sm:h-[32%] min-h-0 w-full flex-col items-center justify-center px-4 text-center">
			<h1 class="font-extrabold leading-none tracking-tight text-foreground flex flex-col items-center justify-center font-display">
				<span class="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
					{headlineTop}
				</span>
				<span class="block text-6xl sm:text-8xl md:text-9xl font-black mt-1 uppercase tracking-wider text-foreground">
					{headlineAccent}
				</span>
			</h1>
		</section>

		<!-- Why button -->
		{#if whyHref}
			<section class="flex h-[8%] min-h-[40px] sm:min-h-[44px] w-full items-center justify-center px-4 mb-1 shrink-0">
				<a
					href={whyHref}
					class="inline-flex items-center justify-center border-2 border-border bg-surface px-7 py-1.5 sm:py-2 text-base sm:text-lg font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					Why?
				</a>
			</section>
		{/if}

		<!-- Agree button: Primary red -->
		<section class="flex h-[24%] sm:h-[24%] w-full items-center justify-center px-4 sm:px-8 py-1.5 shrink-0">
			<button
				type="button"
				onclick={() => handleChoiceClick('agree')}
				class="flex h-full w-full max-w-2xl items-center justify-center border-4 border-border bg-primary px-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer {selectedChoice === 'agree' ? 'ring-4 ring-foreground' : ''}"
			>
				Agree
			</button>
		</section>

		<!-- We do | Not sure button: Secondary yellow -->
		<section class="flex h-[24%] sm:h-[24%] w-full items-center justify-center px-4 sm:px-8 pt-1.5 pb-2 sm:pb-3 shrink-0">
			<button
				type="button"
				onclick={() => handleChoiceClick('other')}
				class="flex h-full w-full max-w-2xl items-center justify-center border-4 border-border bg-secondary px-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-secondary-foreground rounded-theme shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer {selectedChoice === 'other' ? 'ring-4 ring-foreground' : ''}"
			>
				We do | Not sure
			</button>
		</section>
	</div>
{:else}
	<!-- Card / Compact variant (for embedding in onboarding, cards, or test suites) -->
	<div class="border-2 sm:border-3 border-border bg-surface p-5 sm:p-7 rounded-theme shadow-theme-md select-none {className}">
		<div class="text-center mb-4">
			<h2 class="font-extrabold leading-tight tracking-tight text-foreground font-display">
				<span class="block text-2xl sm:text-3xl font-bold">{headlineTop}</span>
				<span class="block text-4xl sm:text-5xl font-black uppercase tracking-wider text-foreground mt-0.5">
					{headlineAccent}
				</span>
			</h2>
			{#if whyHref}
				<div class="mt-3">
					<a
						href={whyHref}
						class="inline-flex items-center justify-center border-2 border-border bg-background px-4 py-1 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px]"
					>
						Why?
					</a>
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-3 mt-5">
			<button
				type="button"
				onclick={() => handleChoiceClick('agree')}
				class="w-full border-2 border-border bg-primary py-3.5 px-4 text-xl sm:text-2xl font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer {selectedChoice === 'agree' ? 'ring-2 ring-foreground' : ''}"
			>
				Agree
			</button>

			<button
				type="button"
				onclick={() => handleChoiceClick('other')}
				class="w-full border-2 border-border bg-secondary py-3.5 px-4 text-xl sm:text-2xl font-black text-secondary-foreground rounded-theme shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer {selectedChoice === 'other' ? 'ring-2 ring-foreground' : ''}"
			>
				We do | Not sure
			</button>
		</div>
	</div>
{/if}
