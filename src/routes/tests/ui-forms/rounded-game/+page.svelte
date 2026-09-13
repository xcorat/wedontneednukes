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
	<title>Style 2: Rounded 2D Cartoon · UI Forms Test</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-start sm:justify-center px-4 py-6 text-[#212121] font-['Nunito',sans-serif]">
	<div class="w-full max-w-md">
		<!-- Test Controls Bar -->
		<div class="mb-3 flex items-center justify-between gap-2 rounded-xl border-2 border-[#212121] bg-white px-3 py-1.5 text-xs shadow-[0_2px_0_#212121]">
			<span class="font-extrabold text-[#E53935] font-['Fredoka',sans-serif]">Vote Preview:</span>
			<div class="flex items-center gap-1.5">
				<button
					type="button"
					onclick={() => (answer = 'no')}
					class="rounded-lg border-2 border-[#212121] px-2.5 py-0.5 font-bold font-['Fredoka',sans-serif] {answeredNo ? 'bg-[#E53935] text-white shadow-[0_2px_0_#B71C1C]' : 'bg-zinc-100 text-[#212121]'}"
				>
					Agree
				</button>
				<button
					type="button"
					onclick={() => (answer = 'yes')}
					class="rounded-lg border-2 border-[#212121] px-2.5 py-0.5 font-bold font-['Fredoka',sans-serif] {!answeredNo ? 'bg-[#FFD600] text-[#212121] shadow-[0_2px_0_#C79A00]' : 'bg-zinc-100 text-[#212121]'}"
				>
					Other
				</button>
			</div>
		</div>

		<!-- Nav Bar -->
		<div class="mb-4 flex items-center justify-between gap-2">
			<a
				href="/tests/ui-forms"
				class="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#212121] bg-white px-3 py-1.5 text-xs font-bold text-[#212121] shadow-[0_2px_0_#212121] hover:bg-[#FFFDE7]"
			>
				← All Styles
			</a>

			<div class="flex items-center gap-2">
				<FundraiserButton variant="pill" class="!shadow-[0_2px_0_#212121]" />
				<MenuButton class="!rounded-xl !shadow-[0_2px_0_#212121]" />
			</div>
		</div>

		<!-- Main Card: 2D Cartoon Rounded Container -->
		<div class="rounded-3xl border-3 border-[#212121] bg-white p-5 sm:p-6 shadow-[0_6px_0_#212121]">
			<!-- Header Badge -->
			<div class="mb-4 flex items-center justify-between">
				<div class="inline-flex items-center gap-2 rounded-full border-2 border-[#212121] bg-[#FFFDE7] px-3.5 py-1 text-xs font-black font-['Fredoka',sans-serif] shadow-[0_2px_0_#212121]">
					<span class="text-sm">{answeredNo ? '🕊️' : '🤔'}</span>
					<span>{answeredNo ? "You voted: We don't need nukes" : "You voted: We do | Not sure"}</span>
				</div>
			</div>

			<!-- Cartoon Progress Bars (pill rounded) -->
			<div class="space-y-3">
				<!-- Agree Option -->
				<div class="rounded-2xl border-2 border-[#212121] bg-[#FFFDE7] p-3 shadow-[0_3px_0_#212121]">
					<div class="mb-1.5 flex items-center justify-between font-['Fredoka',sans-serif]">
						<span class="flex items-center gap-1.5 text-sm font-bold">
							<span>We don't need nukes</span>
							{#if answeredNo}
								<span class="rounded-md border border-[#212121] bg-[#E53935] px-1.5 py-0.2 text-[10px] font-bold text-white">
									You
								</span>
							{/if}
						</span>
						<span class="text-base font-black text-[#E53935]">{stats.agreePercentage}%</span>
					</div>
					<div class="h-3.5 w-full rounded-full border-2 border-[#212121] bg-white overflow-hidden p-0.5">
						<div class="h-full rounded-full bg-[#E53935]" style="width: {stats.agreePercentage}%"></div>
					</div>
					<p class="mt-1 text-right text-[11px] font-bold text-[#757575] font-['Fredoka',sans-serif]">
						{stats.agreeCount.toLocaleString()} pledges
					</p>
				</div>

				<!-- Other Option -->
				<div class="rounded-2xl border-2 border-[#212121] bg-[#FFFDE7] p-3 shadow-[0_3px_0_#212121]">
					<div class="mb-1.5 flex items-center justify-between font-['Fredoka',sans-serif]">
						<span class="flex items-center gap-1.5 text-sm font-bold">
							<span>We do | Not sure</span>
							{#if !answeredNo}
								<span class="rounded-md border border-[#212121] bg-[#FFD600] px-1.5 py-0.2 text-[10px] font-bold text-[#212121]">
									You
								</span>
							{/if}
						</span>
						<span class="text-base font-black text-[#C79A00]">{stats.otherPercentage}%</span>
					</div>
					<div class="h-3.5 w-full rounded-full border-2 border-[#212121] bg-white overflow-hidden p-0.5">
						<div class="h-full rounded-full bg-[#FFD600]" style="width: {stats.otherPercentage}%"></div>
					</div>
					<p class="mt-1 text-right text-[11px] font-bold text-[#757575] font-['Fredoka',sans-serif]">
						{stats.otherCount.toLocaleString()} votes
					</p>
				</div>
			</div>

			<!-- Cartoon Feedback Section -->
			<div class="mt-4 rounded-2xl border-2 border-[#212121] bg-white p-3.5 shadow-[0_3px_0_#212121]">
				<h3 class="mb-2 text-xs font-black uppercase tracking-wider text-[#212121] font-['Fredoka',sans-serif]">
					💬 Add Your Voice (Optional)
				</h3>

				{#if feedbackSubmitted}
					<div class="rounded-xl border-2 border-[#212121] bg-[#FFFDE7] p-3 text-center">
						<p class="text-sm font-bold font-['Fredoka',sans-serif] text-[#212121]">🎉 Response recorded!</p>
						<button
							type="button"
							onclick={() => (feedbackSubmitted = false)}
							class="mt-1 text-xs font-bold text-[#E53935] underline"
						>
							Edit response
						</button>
					</div>
				{:else}
					<form onsubmit={handleFeedbackSubmit} class="flex flex-col gap-2">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<div>
								<label for="g-name" class="mb-0.5 block text-[11px] font-bold font-['Fredoka',sans-serif] text-[#757575]">
									Display Name
								</label>
								<input
									id="g-name"
									type="text"
									bind:value={feedbackName}
									placeholder="Friendly name"
									class="w-full rounded-xl border-2 border-[#212121] bg-white px-3 py-1.5 text-xs text-[#212121] focus:bg-[#FFFDE7] focus:outline-none"
								/>
							</div>

							<div>
								<label for="g-phone" class="mb-0.5 block text-[11px] font-bold font-['Fredoka',sans-serif] text-[#757575]">
									Phone
								</label>
								<input
									id="g-phone"
									type="tel"
									bind:value={feedbackPhone}
									placeholder="Optional phone"
									class="w-full rounded-xl border-2 border-[#212121] bg-white px-3 py-1.5 text-xs text-[#212121] focus:bg-[#FFFDE7] focus:outline-none"
								/>
							</div>
						</div>

						<div>
							<label for="g-comment" class="mb-0.5 block text-[11px] font-bold font-['Fredoka',sans-serif] text-[#757575]">
								Thoughts &amp; Perspective
							</label>
							<textarea
								id="g-comment"
								rows="2"
								bind:value={feedbackComment}
								placeholder="What led you to this choice?"
								class="w-full rounded-xl border-2 border-[#212121] bg-white px-3 py-1.5 text-xs text-[#212121] focus:bg-[#FFFDE7] focus:outline-none resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="self-end rounded-xl border-2 border-[#212121] bg-[#FFD600] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#212121] font-['Fredoka',sans-serif] shadow-[0_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[0_1px_0_#212121] active:translate-y-[2px] active:shadow-none"
						>
							Save Note
						</button>
					</form>
				{/if}
			</div>

			<!-- Cartoon Next CTA Button -->
			<div class="mt-4">
				<a
					href="/form?answer={answer}"
					class="flex w-full items-center justify-center gap-2 rounded-2xl border-3 border-[#212121] bg-[#E53935] py-3 text-base font-black uppercase tracking-wider text-white font-['Fredoka',sans-serif] shadow-[0_4px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[0_3px_0_#B71C1C] active:translate-y-[4px] active:shadow-none"
				>
					<span>Continue to Pledge</span>
					<span>→</span>
				</a>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-3 text-center text-xs font-bold text-[#757575] font-['Fredoka',sans-serif]">
			Anti-bot verified • Friendly 2D Cartoon Style
		</p>
	</div>
</main>
