<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
</script>

<svelte:head>
	<title>Fundraiser · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-[#FFFDE7] px-6 py-12 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-lg">
		<div class="mb-8 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 border-2 border-[#212121] bg-white px-4 py-2 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back
			</a>
			<MenuButton />
		</div>

		<div class="mb-4 inline-block border-2 border-[#212121] bg-[#FFD600] px-4 py-1 text-xs font-black uppercase tracking-wider text-[#212121]">
			Community Funded
		</div>

		<h1 class="mb-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#212121]">
			Campaign Fundraiser
		</h1>

		<div class="space-y-4 text-base leading-relaxed text-[#212121]">
			<div class="border-2 border-[#212121] bg-white p-5 shadow-[3px_3px_0_#212121]">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-lg font-bold text-[#212121]">Platform Milestone 1: MVP & Verification</h2>
					<span class="border border-[#212121] bg-[#E53935] px-2.5 py-0.5 text-xs font-bold text-white">Active</span>
				</div>
				<p class="text-sm text-[#757575]">Funding infrastructure for anonymous & authenticated pledges, anti-bot verification, and real-time counter metrics.</p>
			</div>

			<div class="border-2 border-[#212121] bg-white p-5 shadow-[3px_3px_0_#212121]">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-lg font-bold text-[#212121]">Platform Milestone 2: Viral Campaigns & Media</h2>
					<span class="border border-[#212121] bg-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-700">Upcoming</span>
				</div>
				<p class="text-sm text-[#757575]">Creator grants, video memes, community gallery upvoting, and internationalization.</p>
			</div>
		</div>

		<div class="mt-8 flex justify-center">
			<a
				href="/"
				class="inline-flex border-[3px] border-[#212121] bg-[#E53935] px-8 py-3 text-xl font-bold text-[#FFFDE7] shadow-[3px_3px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B71C1C] active:translate-x-[2px] active:translate-y-[3px] active:shadow-none"
			>
				Back to Pledge
			</a>
		</div>
	</div>
</main>
