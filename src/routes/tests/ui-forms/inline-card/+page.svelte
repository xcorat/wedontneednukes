<script lang="ts">
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let answer = $state<'no' | 'yes'>('no');
	const answeredNo = $derived(answer === 'no');

	let showFeedbackDrawer = $state(false);
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
	<title>Style 4: Unified Single-Card · UI Forms Test</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-start sm:justify-center px-4 py-6 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-md">
		<!-- Test Controls Bar -->
		<div class="mb-3 flex items-center justify-between gap-2 border border-[#212121]/30 bg-[#FFFDE7] px-3 py-1.5 text-xs">
			<span class="font-bold text-[#E53935]">Test Mode:</span>
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => (answer = 'no')}
					class="border px-2 py-0.5 text-xs font-bold {answeredNo ? 'bg-[#E53935] text-white' : 'bg-white text-[#212121]'}"
				>
					Agree vote
				</button>
				<button
					type="button"
					onclick={() => (answer = 'yes')}
					class="border px-2 py-0.5 text-xs font-bold {!answeredNo ? 'bg-[#FFD600] text-[#212121]' : 'bg-white text-[#212121]'}"
				>
					Other vote
				</button>
			</div>
		</div>

		<!-- Nav Bar -->
		<div class="mb-3 flex items-center justify-between gap-2">
			<a
				href="/tests/ui-forms"
				class="inline-flex items-center gap-1 border-2 border-[#212121] bg-white px-2.5 py-1 text-xs font-bold text-[#212121] shadow-[2px_2px_0_#212121] hover:bg-[#FFFDE7]"
			>
				← All Styles
			</a>

			<div class="flex items-center gap-2">
				<FundraiserButton variant="cartoon" class="!py-1 !text-xs !shadow-[2px_2px_0_#212121]" />
				<MenuButton class="!h-8 !w-8 !shadow-[2px_2px_0_#212121]" />
			</div>
		</div>

		<!-- Single Unified Card (No Nested Shadows) -->
		<div class="border-3 border-[#212121] bg-white shadow-[4px_4px_0_#212121] overflow-hidden">
			<!-- Integrated Header Strip -->
			<div class="flex items-center justify-between border-b-2 border-[#212121] bg-[#FFFDE7] px-4 py-2.5">
				<div class="flex items-center gap-2">
					<span class="text-base">{answeredNo ? '🕊️' : '🤔'}</span>
					<span class="text-xs font-black uppercase tracking-wider text-[#212121]">
						{answeredNo ? "You voted: Agree (No nukes)" : "You voted: We do | Not sure"}
					</span>
				</div>
				<span class="text-[10px] font-extrabold uppercase tracking-wide bg-[#212121] text-white px-2 py-0.5">
					Verified
				</span>
			</div>

			<!-- Results Body -->
			<div class="p-4 sm:p-5 space-y-3">
				<!-- Agree Row -->
				<div>
					<div class="mb-1 flex items-center justify-between text-xs font-bold">
						<span class="flex items-center gap-1.5">
							<span>We don't need nukes</span>
							{#if answeredNo}
								<span class="bg-[#E53935] px-1.5 py-0.2 text-[9px] font-black uppercase text-white">You</span>
							{/if}
						</span>
						<span class="font-black text-[#E53935]">{stats.agreePercentage}% <span class="font-medium text-[11px] text-[#757575]">({stats.agreeCount.toLocaleString()})</span></span>
					</div>
					<div class="h-3 w-full border-2 border-[#212121] bg-[#FFFDE7] p-0.5">
						<div class="h-full bg-[#E53935]" style="width: {stats.agreePercentage}%"></div>
					</div>
				</div>

				<!-- Other Row -->
				<div>
					<div class="mb-1 flex items-center justify-between text-xs font-bold">
						<span class="flex items-center gap-1.5">
							<span>We do | Not sure</span>
							{#if !answeredNo}
								<span class="bg-[#FFD600] px-1.5 py-0.2 text-[9px] font-black uppercase text-[#212121]">You</span>
							{/if}
						</span>
						<span class="font-black text-[#C79A00]">{stats.otherPercentage}% <span class="font-medium text-[11px] text-[#757575]">({stats.otherCount.toLocaleString()})</span></span>
					</div>
					<div class="h-3 w-full border-2 border-[#212121] bg-[#FFFDE7] p-0.5">
						<div class="h-full bg-[#FFD600]" style="width: {stats.otherPercentage}%"></div>
					</div>
				</div>

				<!-- Optional Feedback Accordion/Toggle (Zero empty space unless opened) -->
				<div class="pt-2 border-t border-[#212121]/20">
					{#if !showFeedbackDrawer && !feedbackSubmitted}
						<button
							type="button"
							onclick={() => (showFeedbackDrawer = true)}
							class="flex w-full items-center justify-between border border-[#212121] bg-[#FFFDE7] px-3 py-2 text-xs font-bold text-[#212121] hover:bg-[#FFD600] transition-colors"
						>
							<span>💬 Add a comment or phone callback</span>
							<span class="text-base leading-none">+</span>
						</button>
					{:else if feedbackSubmitted}
						<div class="border border-[#212121] bg-[#FFFDE7] p-3 text-center">
							<p class="text-xs font-bold text-[#212121]">🙌 Response attached to your vote!</p>
							<button
								type="button"
								onclick={() => (feedbackSubmitted = false)}
								class="mt-1 text-[11px] font-bold text-[#E53935] underline"
							>
								Edit note
							</button>
						</div>
					{:else}
						<!-- Open form inside container -->
						<div class="border border-[#212121] bg-[#FFFDE7]/60 p-3">
							<div class="flex items-center justify-between mb-2">
								<span class="text-xs font-bold text-[#212121]">Optional perspective note</span>
								<button
									type="button"
									onclick={() => (showFeedbackDrawer = false)}
									class="text-xs font-bold text-[#757575] hover:text-[#212121]"
								>
									✕ Hide
								</button>
							</div>

							<form onsubmit={handleFeedbackSubmit} class="flex flex-col gap-2">
								<div class="grid grid-cols-2 gap-2">
									<input
										type="text"
										bind:value={feedbackName}
										placeholder="Display Name"
										class="border border-[#212121] bg-white px-2 py-1 text-xs text-[#212121] focus:outline-none"
									/>
									<input
										type="tel"
										bind:value={feedbackPhone}
										placeholder="Phone number"
										class="border border-[#212121] bg-white px-2 py-1 text-xs text-[#212121] focus:outline-none"
									/>
								</div>

								<textarea
									rows="2"
									bind:value={feedbackComment}
									placeholder="Your thoughts..."
									class="w-full border border-[#212121] bg-white px-2 py-1 text-xs text-[#212121] focus:outline-none resize-none"
								></textarea>

								<button
									type="submit"
									class="self-end border border-[#212121] bg-[#FFD600] px-3 py-1 text-xs font-bold text-[#212121] hover:bg-[#FFE082]"
								>
									Save Note
								</button>
							</form>
						</div>
					{/if}
				</div>

				<!-- Next CTA Button integrated at the bottom of the card -->
				<div class="pt-2">
					<a
						href="/form?answer={answer}"
						class="flex w-full items-center justify-center gap-2 border-2 border-[#212121] bg-[#E53935] py-3 text-sm font-black uppercase tracking-wider text-white shadow-[2px_2px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#B71C1C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
					>
						<span>Continue to Pledge</span>
						<span>→</span>
					</a>
				</div>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-3 text-center text-[11px] text-[#757575]">
			Single outer card • No nested shadow stacking • Zero wasted whitespace
		</p>
	</div>
</main>
