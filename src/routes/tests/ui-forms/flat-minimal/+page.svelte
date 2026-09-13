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
	<title>Style 3: Clean Flat Minimal · UI Forms Test</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-start sm:justify-center px-4 py-6 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-md">
		<!-- Test Controls Bar -->
		<div class="mb-3 flex items-center justify-between gap-2 border border-[#212121]/30 bg-white px-3 py-1.5 text-xs">
			<span class="font-bold text-[#212121]">Test Vote:</span>
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => (answer = 'no')}
					class="border border-[#212121] px-2 py-0.5 text-xs font-bold transition-colors {answeredNo ? 'bg-[#E53935] text-white' : 'bg-white text-[#212121] hover:bg-zinc-100'}"
				>
					Agree (No Nukes)
				</button>
				<button
					type="button"
					onclick={() => (answer = 'yes')}
					class="border border-[#212121] px-2 py-0.5 text-xs font-bold transition-colors {!answeredNo ? 'bg-[#FFD600] text-[#212121]' : 'bg-white text-[#212121] hover:bg-zinc-100'}"
				>
					Other (We do)
				</button>
			</div>
		</div>

		<!-- Nav Bar -->
		<div class="mb-3 flex items-center justify-between gap-2">
			<a
				href="/tests/ui-forms"
				class="inline-flex items-center gap-1 border border-[#212121] bg-white px-3 py-1.5 text-xs font-bold text-[#212121] hover:bg-[#FFFDE7]"
			>
				← All Styles
			</a>

			<div class="flex items-center gap-2">
				<FundraiserButton variant="unicode" class="!shadow-none !border border-[#212121]" />
				<MenuButton class="!shadow-none !border border-[#212121]" />
			</div>
		</div>

		<!-- Flat Minimal Container (Zero offset drop shadow, 2px crisp border) -->
		<div class="border-2 border-[#212121] bg-white p-5">
			<!-- Header Status -->
			<div class="mb-4 flex items-center justify-between border-b border-[#212121]/15 pb-3">
				<div class="flex items-center gap-2">
					<span class="text-lg">{answeredNo ? '🕊️' : '🤔'}</span>
					<div>
						<div class="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Recorded Vote</div>
						<div class="text-sm font-bold text-[#212121]">
							{answeredNo ? "Agree: We don't need nukes" : "We do | Not sure"}
						</div>
					</div>
				</div>
				<span class="rounded bg-[#E53935]/10 px-2 py-0.5 text-[11px] font-bold text-[#E53935]">
					Live
				</span>
			</div>

			<!-- Sleek Results Bars -->
			<div class="space-y-3">
				<!-- Agree -->
				<div class="border border-[#212121]/20 bg-[#FFFDE7]/50 p-3">
					<div class="mb-1.5 flex items-center justify-between text-xs font-bold">
						<span class="flex items-center gap-1.5">
							<span>We don't need nukes</span>
							{#if answeredNo}
								<span class="border border-[#E53935] bg-[#E53935] px-1.5 text-[9px] font-bold text-white">You</span>
							{/if}
						</span>
						<span class="font-extrabold text-[#E53935]">{stats.agreePercentage}%</span>
					</div>
					<div class="h-2 w-full bg-zinc-200 overflow-hidden">
						<div class="h-full bg-[#E53935]" style="width: {stats.agreePercentage}%"></div>
					</div>
					<p class="mt-1 text-right text-[11px] text-[#757575]">
						{stats.agreeCount.toLocaleString()} votes
					</p>
				</div>

				<!-- Other -->
				<div class="border border-[#212121]/20 bg-[#FFFDE7]/50 p-3">
					<div class="mb-1.5 flex items-center justify-between text-xs font-bold">
						<span class="flex items-center gap-1.5">
							<span>We do | Not sure</span>
							{#if !answeredNo}
								<span class="border border-[#C79A00] bg-[#FFD600] px-1.5 text-[9px] font-bold text-[#212121]">You</span>
							{/if}
						</span>
						<span class="font-extrabold text-[#C79A00]">{stats.otherPercentage}%</span>
					</div>
					<div class="h-2 w-full bg-zinc-200 overflow-hidden">
						<div class="h-full bg-[#FFD600]" style="width: {stats.otherPercentage}%"></div>
					</div>
					<p class="mt-1 text-right text-[11px] text-[#757575]">
						{stats.otherCount.toLocaleString()} votes
					</p>
				</div>
			</div>

			<!-- Flat Minimal Feedback Section -->
			<div class="mt-4 border-t border-[#212121]/15 pt-3">
				<h3 class="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#212121]">
					Optional Note
				</h3>

				{#if feedbackSubmitted}
					<div class="border border-[#212121] bg-[#FFFDE7] p-3 text-center">
						<p class="text-xs font-bold text-[#212121]">Thank you for your thoughts!</p>
						<button
							type="button"
							onclick={() => (feedbackSubmitted = false)}
							class="mt-1 text-[11px] text-[#E53935] underline font-bold"
						>
							Edit response
						</button>
					</div>
				{:else}
					<form onsubmit={handleFeedbackSubmit} class="flex flex-col gap-2">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div>
								<label for="f-name" class="mb-0.5 block text-[10px] font-semibold text-[#757575]">
									Display Name
								</label>
								<input
									id="f-name"
									type="text"
									bind:value={feedbackName}
									placeholder="Public name"
									class="w-full border border-[#212121]/40 bg-zinc-50 px-2.5 py-1.5 text-xs text-[#212121] focus:border-[#212121] focus:bg-white focus:outline-none"
								/>
							</div>

							<div>
								<label for="f-phone" class="mb-0.5 block text-[10px] font-semibold text-[#757575]">
									Phone
								</label>
								<input
									id="f-phone"
									type="tel"
									bind:value={feedbackPhone}
									placeholder="Phone number"
									class="w-full border border-[#212121]/40 bg-zinc-50 px-2.5 py-1.5 text-xs text-[#212121] focus:border-[#212121] focus:bg-white focus:outline-none"
								/>
							</div>
						</div>

						<div>
							<label for="f-comment" class="mb-0.5 block text-[10px] font-semibold text-[#757575]">
								Feedback / Perspective
							</label>
							<textarea
								id="f-comment"
								rows="2"
								bind:value={feedbackComment}
								placeholder="Add a few words..."
								class="w-full border border-[#212121]/40 bg-zinc-50 px-2.5 py-1.5 text-xs text-[#212121] focus:border-[#212121] focus:bg-white focus:outline-none resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="self-end border border-[#212121] bg-white px-3 py-1 text-xs font-bold text-[#212121] hover:bg-[#FFFDE7] active:bg-[#FFD600]"
						>
							Submit note
						</button>
					</form>
				{/if}
			</div>

			<!-- Flat CTA Button -->
			<div class="mt-4">
				<a
					href="/form?answer={answer}"
					class="flex w-full items-center justify-center gap-1.5 border-2 border-[#212121] bg-[#E53935] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D32F2F]"
				>
					<span>Continue to Pledge</span>
					<span>→</span>
				</a>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-3 text-center text-[11px] text-[#757575]">
			Zero heavy offset shadows • Clean border contrast
		</p>
	</div>
</main>
