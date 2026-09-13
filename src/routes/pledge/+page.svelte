<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import InfoTooltip, { type HelpDisplayMode } from '$lib/components/InfoTooltip.svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	/**
	 * Help text presentation mode:
	 * - 'responsive': (i) tooltip on mobile, visible inline text on desktop
	 * - 'inline': visible inline text on all screens
	 * - 'tooltip': (i) hover/tap tooltip on all screens
	 */
	const helpMode: HelpDisplayMode = 'responsive';

	const answeredNo = $derived(data.answer === 'no');

	// Multi-select state: pre-select 'passive' by default
	type CommitmentLevel = 'passive' | 'active' | 'direct';
	let selectedLevels = $state<CommitmentLevel[]>(['passive']);

	let name = $state('');
	let feedback = $state('');
	let isSubmitting = $state(false);
	let showDetails = $state(false);

	$effect(() => {
		if (data.commitmentLevels && data.commitmentLevels.length > 0) {
			selectedLevels = data.commitmentLevels;
		}
		if (data.name) name = data.name;
		if (data.feedback) feedback = data.feedback;
	});

	function toggleLevel(id: CommitmentLevel) {
		if (selectedLevels.includes(id)) {
			selectedLevels = selectedLevels.filter((lvl) => lvl !== id);
		} else {
			selectedLevels = [...selectedLevels, id];
		}
	}

	const resultsUrl = $derived(
		`/results?answer=${data.answer}${data.isAnon ? '&anon=1' : ''}`
	);

	const pledgeOptions = [
		{
			id: 'passive' as const,
			emoji: '🛡️',
			title: "I won't support expansion of nuclear weapons",
			description:
				'I refuse to endorse, vote for, or finance policies and systems that expand or modernize nuclear arsenals.',
			badge: 'Default · Baseline'
		},
		{
			id: 'active' as const,
			emoji: '🗣️',
			title: 'I will support politically and ideologically',
			description:
				'Active social engagement, voting and political decisions, public discourse, and challenging pro-nuclear narratives.',
			badge: 'Civic Engagement'
		},
		{
			id: 'direct' as const,
			emoji: '🤝',
			title: 'I will support with time and resources',
			description:
				'Volunteering time, community organizing, sharing campaign materials, and providing active resources.',
			badge: 'Direct Action'
		}
	];
</script>

<svelte:head>
	<title>Pledge Level · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-lg">
		<!-- Top Bar: Back link, Answer badge & Menu -->
		<div class="mb-4 sm:mb-6 flex items-center justify-between gap-3">
			<a
				href={`/auth?answer=${data.answer}`}
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back
			</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<div class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm font-display">
					<span>{answeredNo ? '🕊️' : '🤔'}</span>
					<span>{answeredNo ? "No, we don't" : 'Yes, we do'}</span>
				</div>
				<MenuButton />
			</div>
		</div>

		<!-- Main Card Container -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-5 sm:p-7 rounded-theme shadow-theme-md">
			<!-- Header -->
			<div class="mb-5">
				<div class="mb-2 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
					Step 2 of 2 · Multiselect
				</div>
				<h1 class="text-2xl sm:text-3xl font-black text-foreground leading-tight font-display">
					Choose Your Pledge Level
				</h1>
				<p class="mt-1.5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
					Select all commitments that apply to you. You can select multiple levels of support.
				</p>
			</div>

			<!-- Pledge Form -->
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
				<!-- Hidden commitment levels fields (one per selected item) -->
				{#each selectedLevels as level}
					<input type="hidden" name="commitmentLevels" value={level} />
				{/each}

				<!-- 3 Multiselect Checkbox Cards -->
				<div class="space-y-3" role="group" aria-label="Commitment Levels">
					{#each pledgeOptions as opt}
						{@const isSelected = selectedLevels.includes(opt.id)}
						<div
							role="checkbox"
							tabindex="0"
							aria-checked={isSelected}
							onclick={() => toggleLevel(opt.id)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									toggleLevel(opt.id);
								}
							}}
							class="w-full text-left border-2 border-border p-3.5 sm:p-4 transition-all cursor-pointer relative rounded-theme select-none focus:outline-none focus:ring-2 focus:ring-primary {isSelected
								? 'bg-background shadow-theme-sm translate-y-[-1px]'
								: 'bg-surface shadow-theme-sm opacity-90 hover:opacity-100 hover:bg-background/50'}"
						>
							<div class="flex items-start gap-3">
								<!-- Multiselect Checkbox Indicator -->
								<div
									class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 border-border transition-colors rounded-theme {isSelected
										? 'bg-primary text-primary-foreground shadow-theme-sm'
										: 'bg-surface text-transparent'}"
								>
									<svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
										<path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
									</svg>
								</div>

								<!-- Content -->
								<div class="flex-1 min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<span class="text-sm font-black text-foreground leading-snug font-display">
											{opt.title}
										</span>
										{#if opt.badge}
											<span
												class="inline-block border border-border px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider rounded-theme {isSelected
													? 'bg-secondary text-secondary-foreground'
													: 'bg-muted/30 text-muted-foreground'}"
											>
												{opt.badge}
											</span>
										{/if}
										<InfoTooltip
											text={opt.description}
											title={opt.title}
											mode={helpMode}
											ariaLabel={`Learn more about ${opt.title}`}
										/>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>


				<!-- Selected Count Helper -->
				<div class="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
					<span>
						<strong>{selectedLevels.length}</strong> {selectedLevels.length === 1 ? 'level' : 'levels'} selected
					</span>
					{#if selectedLevels.length === 0}
						<span class="text-primary font-bold">Please select at least one level to pledge</span>
					{/if}
				</div>

				<!-- Optional Name & Feedback Toggle -->
				<div class="border-t-2 border-border/20 pt-3">
					<button
						type="button"
						onclick={() => (showDetails = !showDetails)}
						class="flex w-full items-center justify-between text-xs font-bold text-foreground hover:text-primary cursor-pointer py-1"
					>
						<span>{showDetails ? '− Hide' : '+ Add'} optional name &amp; comment</span>
						<span class="text-xs">{showDetails ? '▲' : '▼'}</span>
					</button>

					{#if showDetails}
						<div class="mt-3 space-y-3 border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm">
							<div>
								<label for="pledge-name" class="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground font-display">
									Your Name / Handle (optional)
								</label>
								<input
									id="pledge-name"
									name="name"
									type="text"
									bind:value={name}
									placeholder="e.g. Alex"
									disabled={isSubmitting}
									class="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm focus:outline-none"
								/>
							</div>

							<div>
								<label for="pledge-feedback" class="mb-1 block text-xs font-bold uppercase tracking-wider text-foreground font-display">
									Thoughts / Feedback (optional)
								</label>
								<textarea
									id="pledge-feedback"
									name="feedback"
									rows="2"
									bind:value={feedback}
									placeholder="Any message or perspective you'd like to share..."
									disabled={isSubmitting}
									class="w-full border-2 border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm focus:outline-none resize-y"
								></textarea>
							</div>
						</div>
					{/if}
				</div>

				<!-- Action Buttons: Confirm Pledge & Skip to Results -->
				<div class="mt-1 flex flex-col sm:flex-row gap-3">
					<!-- Primary Confirm Button -->
					<button
						type="submit"
						disabled={isSubmitting || selectedLevels.length === 0}
						class="flex flex-1 items-center justify-center gap-2 border-2 border-border bg-primary px-5 py-3 text-sm font-black text-primary-foreground rounded-theme
						       shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
					>
						{#if isSubmitting}
							<svg class="h-4 w-4 animate-spin text-primary-foreground" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
							</svg>
							<span>Saving pledge...</span>
						{:else}
							<span>Confirm Pledge →</span>
						{/if}
					</button>

					<!-- Skip to Results Button -->
					<a
						href={resultsUrl}
						class="flex items-center justify-center gap-2 border-2 border-border bg-secondary px-5 py-3 text-sm font-black text-secondary-foreground rounded-theme
						       shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none text-center cursor-pointer"
					>
						<span>Results →</span>
					</a>
				</div>
			</form>

			<!-- Bottom Fundraiser Section -->
			<div class="mt-6 border-2 border-border bg-background p-4 text-center rounded-theme shadow-theme-sm">
				<p class="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider font-display">
					Grassroots movement · 100% community funded
				</p>
				<FundraiserButton
					variant="cartoon"
					text="Support this page"
					class="w-full justify-center py-2.5 text-sm sm:text-base font-black"
				/>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-5 text-center text-xs leading-relaxed text-muted-foreground font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
