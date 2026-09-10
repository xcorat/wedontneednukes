<script lang="ts">
	import { goto } from '$app/navigation';

	function handleChoice(answer: 'agree' | 'other') {
		// 'agree' -> agrees with "We don't need nukes" (answer=no to nukes)
		// 'other' -> "We do | Not sure" (answer=yes to nukes / perspective)
		const queryAnswer = answer === 'agree' ? 'no' : 'yes';
		goto(`/campaign/nukes/auth?answer=${queryAnswer}`);
	}
</script>

<svelte:head>
	<title>We don't need Nukes</title>
	<meta
		name="description"
		content="We don't need nukes. One fundamental premise. Share your perspective."
	/>
</svelte:head>

<main class="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#FFFDE7] text-[#212121] select-none font-['Poppins',sans-serif]">
	<!-- Button bar / Navbar: On desktop at top (10%), on mobile at bottom -->
	<header class="order-last sm:order-first flex h-[10%] min-h-[48px] w-full items-center justify-end px-4 sm:px-8 gap-3">
		<a
			href="/fundraiser"
			class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-4 py-2 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
		>
			<span class="text-base">💛</span>
			<span>Fundraiser</span>
		</a>

		<!-- Menubar button (sharp square, empty for now) -->
		<button
			type="button"
			aria-label="Menu"
			class="inline-flex h-10 w-10 items-center justify-center border-2 border-[#212121] bg-white text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
	</header>

	<!-- Headline: We don't need / Nukes (40% height on desktop, top area on mobile) -->
	<section class="order-1 sm:order-2 flex flex-1 sm:flex-none sm:h-[40%] min-h-0 w-full flex-col items-center justify-center px-4 text-center">
		<h1 class="font-extrabold leading-none tracking-tight text-[#212121] flex flex-col items-center justify-center">
			<span class="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
				We don't need
			</span>
			<span class="block text-6xl sm:text-8xl md:text-9xl font-black mt-1 uppercase tracking-wider text-[#212121]">
				Nukes
			</span>
		</h1>
	</section>

	<!-- Why button: takes to a different page (10% height on desktop, anchored above CTAs on mobile) -->
	<section class="order-2 sm:order-3 flex h-[10%] min-h-[44px] w-full items-center justify-center px-4">
		<a
			href="/why"
			class="inline-flex items-center justify-center border-2 border-[#212121] bg-white px-7 py-2 text-base sm:text-lg font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
		>
			Why?
		</a>
	</section>

	<!-- Agree button: Primary red (#E53935) with cream text (#FFFDE7), sharp edges, bottom on mobile (20% on desktop) -->
	<section class="order-3 sm:order-4 flex h-[20%] min-h-[64px] w-full items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2">
		<button
			type="button"
			onclick={() => handleChoice('agree')}
			class="flex h-full max-h-20 w-full max-w-md items-center justify-center border-[3px] border-[#212121] bg-[#E53935] px-6 text-2xl sm:text-3xl font-extrabold tracking-wide text-[#FFFDE7] shadow-[3px_4px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B71C1C] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer"
		>
			Agree
		</button>
	</section>

	<!-- We do | Not sure button: Yellow (#FFD600) with black text (#212121), sharp edges, bottom on mobile (20% on desktop) -->
	<section class="order-4 sm:order-5 flex h-[20%] min-h-[64px] w-full items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2">
		<button
			type="button"
			onclick={() => handleChoice('other')}
			class="flex h-full max-h-20 w-full max-w-md items-center justify-center border-[3px] border-[#212121] bg-[#FFD600] px-6 text-2xl sm:text-3xl font-extrabold tracking-wide text-[#212121] shadow-[3px_4px_0_#C79A00] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_#C79A00] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer"
		>
			We do | Not sure
		</button>
	</section>
</main>
