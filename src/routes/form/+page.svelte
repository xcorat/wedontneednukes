<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');

	let name = $state('');
	let feedback = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		if (data.name) name = data.name;
		if (data.feedback) feedback = data.feedback;
	});

	const resultsUrl = $derived(
		`/results?answer=${data.answer}${data.isAnon ? '&anon=1' : ''}`
	);
</script>

<svelte:head>
	<title>Your Feedback · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-[#FFFDE7] px-4 py-12 text-[#212121] font-['Poppins',sans-serif]">
	<div class="w-full max-w-md">
		<!-- Top Bar: Back link, Answer badge & Menu -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href={`/auth?answer=${data.answer}`}
				class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-3.5 py-1.5 text-sm font-bold text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back
			</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<div class="inline-flex items-center gap-1.5 border-2 border-[#212121] bg-white px-3 py-1.5 text-xs font-bold text-[#212121] shadow-[2px_2px_0_#212121]">
					<span>{answeredNo ? '🕊️' : '🤔'}</span>
					<span>{answeredNo ? "No, we don't" : 'Yes, we do'}</span>
				</div>
				<MenuButton />
			</div>
		</div>

		<!-- Form Card Container -->
		<div class="border-2 sm:border-[3px] border-[#212121] bg-white p-6 sm:p-8 shadow-[4px_4px_0_#212121]">
			<h1 class="mb-1.5 text-2xl sm:text-3xl font-black text-[#212121] leading-tight">
				{answeredNo ? 'Your Voice Matters' : 'Share Your Perspective'}
			</h1>
			<p class="mb-6 text-sm text-[#757575] font-medium">
				{answeredNo
					? 'Add your name and any feedback for the campaign.'
					: 'Let us know your thoughts and reasons.'}
			</p>

			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<!-- Name Field -->
				<div>
					<label for="form-name" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#212121]">
						Name
					</label>
					<input
						id="form-name"
						name="name"
						type="text"
						bind:value={name}
						placeholder="Your name"
						disabled={isSubmitting}
						class="w-full border-2 border-[#212121] bg-white px-3.5 py-2.5 text-sm text-[#212121] placeholder-[#9E9E9E]
						       shadow-[2px_2px_0_#212121] transition-colors focus:bg-[#FFFDE7] focus:outline-none disabled:opacity-50"
					/>
				</div>

				<!-- Feedback Field -->
				<div>
					<label for="form-feedback" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#212121]">
						Feedback
					</label>
					<textarea
						id="form-feedback"
						name="feedback"
						rows="4"
						bind:value={feedback}
						placeholder="Share your thoughts, suggestions, or perspective..."
						disabled={isSubmitting}
						class="w-full border-2 border-[#212121] bg-white px-3.5 py-2.5 text-sm text-[#212121] placeholder-[#9E9E9E]
						       shadow-[2px_2px_0_#212121] transition-colors focus:bg-[#FFFDE7] focus:outline-none resize-y disabled:opacity-50"
					></textarea>
				</div>

				<!-- Two Action Buttons: Save & Results (skip) -->
				<div class="mt-2 flex flex-col sm:flex-row gap-3">
					<!-- Save Button -->
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex flex-1 items-center justify-center gap-2 border-2 border-[#212121] bg-[#E53935] px-5 py-3 text-sm font-black text-[#FFFDE7]
						       shadow-[3px_3px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_#B71C1C] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
					>
						{#if isSubmitting}
							<svg class="h-4 w-4 animate-spin text-[#FFFDE7]" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							<span>Saving...</span>
						{:else}
							<span>Save →</span>
						{/if}
					</button>

					<!-- Results Button (Skip) -->
					<a
						href={resultsUrl}
						class="flex flex-1 items-center justify-center gap-2 border-2 border-[#212121] bg-[#FFD600] px-5 py-3 text-sm font-black text-[#212121]
						       shadow-[2px_2px_0_#C79A00] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#C79A00] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none text-center cursor-pointer"
					>
						<span>Results →</span>
					</a>
				</div>
			</form>
		</div>

		<!-- Footnote -->
		<p class="mt-6 text-center text-xs leading-relaxed text-[#757575] font-medium">
			Clicking <strong>Results</strong> skips the form and takes you straight to the community consensus.
		</p>
	</div>
</main>
