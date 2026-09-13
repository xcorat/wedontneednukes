<script lang="ts">
	import { goto } from '$app/navigation';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';

	function handleChoice(answer: 'agree' | 'other') {
		// 'agree' -> agrees with "We don't need nukes" (answer=no to nukes)
		// 'other' -> "We do | Not sure" (answer=yes to nukes / perspective)
		const queryAnswer = answer === 'agree' ? 'no' : 'yes';
		goto(`/auth?answer=${queryAnswer}`);
	}
</script>

<svelte:head>
	<title>We don't need Nukes</title>
	<meta
		name="description"
		content="We don't need nukes. One fundamental premise. Share your perspective."
	/>
</svelte:head>

<main class="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-background text-foreground select-none font-body">
	<!-- Button bar / Navbar at top: Fundraiser yellow heart button + Menubar button -->
	<header class="flex h-[8%] min-h-[44px] sm:min-h-[48px] w-full items-center justify-end px-4 sm:px-8 gap-2.5 shrink-0">
		<!-- Fundraiser button: yellow heart button -->
		<FundraiserButton variant="icon" />

		<!-- Menubar button (toggles menu drawer) -->
		<MenuButton />
	</header>

	<!-- Headline: We don't need / Nukes (compact upper area) -->
	<section class="flex flex-1 sm:flex-none sm:h-[32%] min-h-0 w-full flex-col items-center justify-center px-4 text-center">
		<h1 class="font-extrabold leading-none tracking-tight text-foreground flex flex-col items-center justify-center font-display">
			<span class="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
				We don't need
			</span>
			<span class="block text-6xl sm:text-8xl md:text-9xl font-black mt-1 uppercase tracking-wider text-foreground">
				Nukes !
			</span>
		</h1>
	</section>

	<!-- Why button: pushed higher, close under the headline -->
	<section class="flex h-[8%] min-h-[40px] sm:min-h-[44px] w-full items-center justify-center px-4 mb-1 shrink-0">
		<a
			href="/why"
			class="inline-flex items-center justify-center border-2 border-border bg-surface px-7 py-1.5 sm:py-2 text-base sm:text-lg font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
		>
			Why?
		</a>
	</section>

	<!-- Agree button: Primary red -->
	<section class="flex h-[24%] sm:h-[24%] w-full items-center justify-center px-4 sm:px-8 py-1.5 shrink-0">
		<button
			type="button"
			onclick={() => handleChoice('agree')}
			class="flex h-full w-full max-w-2xl items-center justify-center border-4 border-border bg-primary px-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer"
		>
			Agree
		</button>
	</section>

	<!-- We do | Not sure button: Secondary yellow with little padding on the bottom -->
	<section class="flex h-[24%] sm:h-[24%] w-full items-center justify-center px-4 sm:px-8 pt-1.5 pb-2 sm:pb-3 shrink-0">
		<button
			type="button"
			onclick={() => handleChoice('other')}
			class="flex h-full w-full max-w-2xl items-center justify-center border-4 border-border bg-secondary px-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-secondary-foreground rounded-theme shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer"
		>
			We do | Not sure
		</button>
	</section>
</main>
