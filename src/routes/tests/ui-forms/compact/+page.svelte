<script lang="ts">
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let answer = $state<'no' | 'yes'>('no');
	const answeredNo = $derived(answer === 'no');

	let feedbackName = $state('');
	let feedbackPhone = $state('');
	let feedbackComment = $state('');
	let feedbackSubmitted = $state(false);

	const stats = {
		agreeCount: 4128,
		agreePercentage: 86,
		otherCount: 671,
		otherPercentage: 14
	};

	function handleFeedbackSubmit(e: SubmitEvent) {
		e.preventDefault();
		feedbackSubmitted = true;
	}
</script>

<svelte:head>
	<title>Style 1: Ultra-Compact · UI Forms Test</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-start sm:justify-center px-3 py-4 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-md">
		<!-- Test Controls Bar -->
		<div class="mb-3 flex items-center justify-between gap-2 border border-[#212121]/40 bg-[#FFFDE7] px-3 py-1.5 text-xs">
			<span class="font-bold text-[#E53935]">Test Toggle:</span>
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => (answer = 'no')}
					class="border px-2 py-0.5 font-bold {answeredNo ? 'bg-[#E53935] text-white' : 'bg-white text-[#212121]'}"
				>
					Agree vote
				</button>
				<button
					type="button"
					onclick={() => (answer = 'yes')}
					class="border px-2 py-0.5 font-bold {!answeredNo ? 'bg-[#FFD600] text-[#212121]' : 'bg-white text-[#212121]'}"
				>
					Other vote
				</button>
			</div>
		</div>

		<!-- Navigation bar (Compact) -->
		<div class="mb-3 flex items-center justify-between gap-2">
			<a
				href="/tests/ui-forms"
				class="inline-flex items-center gap-1 border-2 border-[#212121] bg-white px-2.5 py-1 text-xs font-bold text-[#212121] shadow-[1.5px_1.5px_0_#212121] hover:bg-[#FFFDE7]"
			>
				← All Styles
			</a>

			<div class="flex items-center gap-2">
				<FundraiserButton variant="icon" class="!h-8 !w-8 !shadow-[1.5px_1.5px_0_#212121]" />
				<MenuButton class="!h-8 !w-8 !shadow-[1.5px_1.5px_0_#212121]" />
			</div>
		</div>

		<!-- Main Results Card (Ultra-Compact: p-4 sm:p-5, 2px shadow) -->
		<div class="border-2 border-[#212121] bg-white p-4 sm:p-5 shadow-[2.5px_2.5px_0_#212121]">
			<!-- Choice Header -->
			<div class="mb-3 flex items-center justify-between border-b-2 border-[#212121]/20 pb-2.5">
				<div class="inline-flex items-center gap-1.5 border border-[#212121] bg-[#FFFDE7] px-2.5 py-1 text-xs font-bold shadow-[1px_1px_0_#212121]">
					<span>{answeredNo ? '🕊️' : '🤔'}</span>
					<span>Your choice: <strong class="text-[#212121]">{answeredNo ? 'Agree' : 'We do | Not sure'}</strong></span>
				</div>
				<span class="text-[11px] font-bold text-[#757575]">Live Results</span>
			</div>

			<!-- Compact Results Bars -->
			<div class="space-y-2">
				<!-- Agree Bar -->
				<div class="border border-[#212121] bg-[#FFFDE7] p-2.5">
					<div class="mb-1 flex items-center justify-between text-xs font-bold">
						<span class="flex items-center gap-1">
							<span>We don't need nukes</span>
							{#if answeredNo}
								<span class="bg-[#E53935] px-1 text-[9px] font-black uppercase text-white">You</span>
							{/if}
						</span>
						<span class="font-black text-[#E53935]">{stats.agreePercentage}% ({stats.agreeCount.toLocaleString()})</span>
					</div>
					<div class="h-2.5 w-full border border-[#212121] bg-white p-0.5">
						<div class="h-full bg-[#E53935]" style="width: {stats.agreePercentage}%"></div>
					</div>
				</div>

				<!-- Other Bar -->
				<div class="border border-[#212121] bg-[#FFFDE7] p-2.5">
					<div class="mb-1 flex items-center justify-between text-xs font-bold">
						<span class="flex items-center gap-1">
							<span>We do | Not sure</span>
							{#if !answeredNo}
								<span class="bg-[#FFD600] px-1 text-[9px] font-black uppercase text-[#212121]">You</span>
							{/if}
						</span>
						<span class="font-black text-[#C79A00]">{stats.otherPercentage}% ({stats.otherCount.toLocaleString()})</span>
					</div>
					<div class="h-2.5 w-full border border-[#212121] bg-white p-0.5">
						<div class="h-full bg-[#FFD600]" style="width: {stats.otherPercentage}%"></div>
					</div>
				</div>
			</div>

			<!-- Feedback Form (Compact 2-col inputs) -->
			<div class="mt-3.5 border-t-2 border-[#212121]/20 pt-3">
				<h3 class="mb-2 text-xs font-black uppercase tracking-wider text-[#212121]">
					Share Perspective (Optional)
				</h3>

				{#if feedbackSubmitted}
					<div class="border border-[#212121] bg-[#FFFDE7] p-3 text-center">
						<p class="text-xs font-bold text-[#212121]">🙌 Thank you for your feedback!</p>
						<button
							type="button"
							onclick={() => (feedbackSubmitted = false)}
							class="mt-1 text-[11px] font-bold text-[#E53935] underline"
						>
							Edit response
						</button>
					</div>
				{:else}
					<form onsubmit={handleFeedbackSubmit} class="flex flex-col gap-2">
						<!-- 2-col on desktop, stacked on mobile -->
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div>
								<label for="c-name" class="mb-0.5 block text-[10px] font-bold uppercase text-[#757575]">
									Display Name
								</label>
								<input
									id="c-name"
									type="text"
									bind:value={feedbackName}
									placeholder="Anonymous"
									class="w-full border border-[#212121] bg-[#FFFDE7]/40 px-2 py-1.5 text-xs text-[#212121] placeholder-[#9E9E9E] focus:bg-white focus:outline-none"
								/>
							</div>

							<div>
								<label for="c-phone" class="mb-0.5 block text-[10px] font-bold uppercase text-[#757575]">
									Phone (for callback)
								</label>
								<input
									id="c-phone"
									type="tel"
									bind:value={feedbackPhone}
									placeholder="+1..."
									class="w-full border border-[#212121] bg-[#FFFDE7]/40 px-2 py-1.5 text-xs text-[#212121] placeholder-[#9E9E9E] focus:bg-white focus:outline-none"
								/>
							</div>
						</div>

						<div>
							<label for="c-comment" class="mb-0.5 block text-[10px] font-bold uppercase text-[#757575]">
								Feedback / Perspective
							</label>
							<textarea
								id="c-comment"
								rows="2"
								bind:value={feedbackComment}
								placeholder="Share your thoughts..."
								class="w-full border border-[#212121] bg-[#FFFDE7]/40 px-2 py-1.5 text-xs text-[#212121] placeholder-[#9E9E9E] focus:bg-white focus:outline-none resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="self-end border border-[#212121] bg-[#FFFDE7] px-3 py-1 text-xs font-bold text-[#212121] shadow-[1px_1px_0_#212121] hover:bg-[#FFD600] active:translate-y-[1px] active:shadow-none"
						>
							Save Note
						</button>
					</form>
				{/if}
			</div>

			<!-- Next CTA Button -->
			<div class="mt-4">
				<a
					href="/form?answer={answer}"
					class="flex w-full items-center justify-center gap-1.5 border-2 border-[#212121] bg-[#E53935] py-2.5 text-sm font-black text-white shadow-[2px_2px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#B71C1C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
				>
					<span>Continue to Pledge</span>
					<span>→</span>
				</a>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-2 text-center text-[11px] text-[#757575]">
			Verified anti-bot votes. Fits completely above the fold.
		</p>
	</div>
</main>
