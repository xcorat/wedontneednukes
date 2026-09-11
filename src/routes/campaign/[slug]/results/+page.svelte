<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');

	const nextUrl = $derived(
		`/campaign/${data.slug}/pledge?answer=${data.answer}${data.isAnon ? '&anon=1' : ''}`
	);

	let feedbackName = $state('');
	let feedbackPhone = $state('');
	let feedbackComment = $state('');
	let feedbackSubmitted = $state(false);

	function handleFeedbackSubmit(e: SubmitEvent) {
		e.preventDefault();
		feedbackSubmitted = true;
	}
</script>

<svelte:head>
	<title>Results · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-[#FFFDE7] px-4 py-12 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-lg">
		<!-- Navigation bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-3.5 py-1.5 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Change choice
			</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<a
					href="/fundraiser"
					class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-3.5 py-1.5 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					<span>💛</span>
					<span>Fundraiser</span>
				</a>
				<MenuButton />
			</div>
		</div>

		<!-- Main Results Card -->
		<div class="border-2 sm:border-[3px] border-[#212121] bg-white p-6 sm:p-8 shadow-[4px_4px_0_#212121]">
			<!-- Confirmed vote banner -->
			<div class="mb-5 inline-flex items-center gap-2 border-2 border-[#212121] bg-[#FFFDE7] px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-[2px_2px_0_#212121]">
				<span>{answeredNo ? '🕊️' : '🤔'}</span>
				<span>
					Your choice: <strong>{answeredNo ? "Agree (We don't need nukes)" : 'We do | Not sure'}</strong>
				</span>
			</div>

			<!-- Results Bars -->
			<div class="space-y-4">
				<!-- Agree Bar -->
				<div class="border-2 border-[#212121] bg-[#FFFDE7] p-4 shadow-[2px_2px_0_#212121]">
					<div class="mb-2 flex items-center justify-between text-sm font-bold">
						<span class="flex items-center gap-1.5">
							<span>We don't need nukes</span>
							{#if answeredNo}
								<span class="border border-[#212121] bg-[#E53935] px-1.5 py-0.2 text-[10px] font-black uppercase text-[#FFFDE7]">
									You
								</span>
							{/if}
						</span>
						<span class="text-base font-black text-[#E53935]">{data.stats.agreePercentage}%</span>
					</div>

					<!-- Progress Bar Track -->
					<div class="h-4 w-full border-2 border-[#212121] bg-white overflow-hidden p-0.5">
						<div
							class="h-full bg-[#E53935] transition-all duration-700"
							style="width: {data.stats.agreePercentage}%"
						></div>
					</div>

					<p class="mt-1.5 text-right text-xs text-[#757575] font-medium">
						{data.stats.agreeCount.toLocaleString()} votes
					</p>
				</div>

				<!-- Other Bar -->
				<div class="border-2 border-[#212121] bg-[#FFFDE7] p-4 shadow-[2px_2px_0_#212121]">
					<div class="mb-2 flex items-center justify-between text-sm font-bold">
						<span class="flex items-center gap-1.5">
							<span>We do | Not sure</span>
							{#if !answeredNo}
								<span class="border border-[#212121] bg-[#FFD600] px-1.5 py-0.2 text-[10px] font-black uppercase text-[#212121]">
									You
								</span>
							{/if}
						</span>
						<span class="text-base font-black text-[#C79A00]">{data.stats.otherPercentage}%</span>
					</div>

					<!-- Progress Bar Track -->
					<div class="h-4 w-full border-2 border-[#212121] bg-white overflow-hidden p-0.5">
						<div
							class="h-full bg-[#FFD600] transition-all duration-700"
							style="width: {data.stats.otherPercentage}%"
						></div>
					</div>

					<p class="mt-1.5 text-right text-xs text-[#757575] font-medium">
						{data.stats.otherCount.toLocaleString()} votes
					</p>
				</div>
			</div>

			<!-- Feedback Form Section -->
			<div class="mt-6 border-2 border-[#212121] bg-[#FFFDE7] p-5 shadow-[2px_2px_0_#212121]">
				{#if feedbackSubmitted}
					<div class="border-2 border-[#212121] bg-white p-4 text-center shadow-[2px_2px_0_#212121]">
						<span class="text-2xl">🙌</span>
						<p class="mt-1 font-bold text-sm text-[#212121]">Thank you for your feedback!</p>
						<p class="text-xs text-[#757575] mt-1">Your perspective helps shape the conversation.</p>
						<button
							type="button"
							onclick={() => (feedbackSubmitted = false)}
							class="mt-3 text-xs font-bold text-[#212121] underline hover:text-[#E53935] cursor-pointer"
						>
							Edit response
						</button>
					</div>
				{:else}
					<form onsubmit={handleFeedbackSubmit} class="flex flex-col gap-3">
						<div>
							<label for="feedback-name" class="mb-1 block text-xs font-bold text-[#212121]">
								Display Name (email will be hidden)
							</label>
							<input
								id="feedback-name"
								type="text"
								bind:value={feedbackName}
								placeholder="Your display name"
								class="w-full border-2 border-[#212121] bg-white px-3 py-2 text-sm text-[#212121] placeholder-[#9E9E9E] shadow-[2px_2px_0_#212121] transition-colors focus:bg-white focus:outline-none"
							/>
						</div>

						<div>
							<label for="feedback-phone" class="mb-1 block text-xs font-bold text-[#212121]">
								Phone number - We will get in touch personally
							</label>
							<input
								id="feedback-phone"
								type="tel"
								bind:value={feedbackPhone}
								placeholder="Phone number"
								class="w-full border-2 border-[#212121] bg-white px-3 py-2 text-sm text-[#212121] placeholder-[#9E9E9E] shadow-[2px_2px_0_#212121] transition-colors focus:bg-white focus:outline-none"
							/>
						</div>

						<div>
							<label for="feedback-comment" class="mb-1 block text-xs font-bold text-[#212121]">
								Comment / Feedback
							</label>
							<textarea
								id="feedback-comment"
								rows="3"
								bind:value={feedbackComment}
								placeholder="Share your thoughts or perspective..."
								class="w-full border-2 border-[#212121] bg-white px-3 py-2 text-sm text-[#212121] placeholder-[#9E9E9E] shadow-[2px_2px_0_#212121] transition-colors focus:bg-white focus:outline-none resize-y"
							></textarea>
						</div>

						<button
							type="submit"
							class="mt-1 inline-flex items-center justify-center border-2 border-[#212121] bg-[#E53935] px-4 py-2.5 text-sm font-bold text-[#FFFDE7] shadow-[2px_2px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#B71C1C] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
						>
							Submit
						</button>
					</form>
				{/if}
			</div>

			<!-- Next Button CTA -->
			<div class="mt-6">
				<a
					href={nextUrl}
					class="flex w-full items-center justify-center gap-2 border-2 sm:border-[3px] border-[#212121] bg-[#E53935] px-6 py-3.5 text-base sm:text-lg font-black text-[#FFFDE7] shadow-[3px_3px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B71C1C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
				>
					<span>Next</span>
					<span class="text-xl">→</span>
				</a>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-6 text-center text-xs text-[#757575] font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
