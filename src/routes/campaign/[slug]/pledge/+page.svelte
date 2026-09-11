<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();

	const greeting = $derived(
		data.user ? `Welcome, ${data.user.name ?? 'friend'}!` : 'Welcome, friend!'
	);

	const backUrl = $derived(
		`/campaign/${data.slug}/results?answer=${data.answer}`
	);
</script>

<svelte:head>
	<title>Pledge · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-[#FFFDE7] px-4 py-12 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-lg">
		<!-- Top Bar: Back link & Menu -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href={backUrl}
				class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-3.5 py-1.5 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back to results
			</a>

			<MenuButton />
		</div>

		<!-- Main Card Container -->
		<div class="border-2 sm:border-[3px] border-[#212121] bg-white p-6 sm:p-8 shadow-[4px_4px_0_#212121]">
			<h1 class="mb-5 text-2xl sm:text-3xl font-black text-[#212121]">{greeting}</h1>

			<div class="border-2 border-[#212121] bg-[#FFFDE7] p-5 shadow-[2px_2px_0_#212121]">
				<div class="mb-2.5 inline-block border border-[#212121] bg-[#FFD600] px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-[#212121]">
					Coming soon
				</div>
				<h2 class="text-lg font-bold text-[#212121]">The pledge flow</h2>
				<p class="mt-2 text-sm leading-relaxed text-[#757575]">
					The full branching pledge flow is in progress. You'll be able to deepen your commitment,
					share resources, and take action — all in a few steps.
				</p>
			</div>

			<div class="mt-6 flex justify-center">
				<a
					href="/"
					class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-4 py-2 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					← Back to start
				</a>
			</div>
		</div>
	</div>
</main>
