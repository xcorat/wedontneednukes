<script lang="ts">
	import InfoTooltip, { type HelpDisplayMode } from '$lib/components/InfoTooltip.svelte';
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';

	export type CommitmentLevel = 'passive' | 'active' | 'direct';

	interface Props {
		answer: 'no' | 'yes' | string;
		initialLevels?: CommitmentLevel[];
		initialName?: string;
		initialFeedback?: string;
		isAnon?: boolean;
		actionUrl?: string;
		resultsUrl?: string;
		title?: string;
		subtitle?: string;
		stepLabel?: string;
		submitLabel?: string;
		submitLoadingLabel?: string;
		showSkipButton?: boolean;
		showFundraiserCallout?: boolean;
		class?: string;
	}

	let {
		answer,
		initialLevels = ['passive'],
		isAnon = false,
		actionUrl = '',
		resultsUrl,
		title = 'Welcome to the community!',
		subtitle = 'what level of  commitment are you comfortable with?',
		stepLabel = 'Step 2: Level of contribution',
		submitLabel = 'Join and Record Vote',
		submitLoadingLabel = 'Recording vote...',
		showSkipButton = false,
		showFundraiserCallout = false,
		class: className = ''
	}: Props = $props();

	const helpMode: HelpDisplayMode = 'responsive';

	let selectedLevel = $state<CommitmentLevel>(
		untrack(() => (initialLevels.length > 0 ? initialLevels[0] : 'passive'))
	);
	let isSubmitting = $state(false);
	let showInfoModal = $state(false);

	$effect(() => {
		if (initialLevels && initialLevels.length > 0) {
			selectedLevel = initialLevels[0];
		}
	});

	function selectLevel(id: CommitmentLevel) {
		selectedLevel = id;
	}

	const resolvedResultsUrl = $derived(
		resultsUrl ?? `/results?answer=${answer}${isAnon ? '&anon=1' : ''}`
	);

	const pledgeOptions = [
		{
			id: 'passive' as const,
			emoji: '🛡️',
			title: 'Ally',
			tagline: "I won't support expansion of nuclear weapons",
			description:
				'I refuse to endorse, vote for, or finance policies and systems that expand or modernize nuclear arsenals. Stay informed and share updates.',
			badge: 'Baseline · Ally'
		},
		{
			id: 'active' as const,
			emoji: '🗣️',
			title: 'Advocate',
			tagline: 'I will support politically and ideologically',
			description:
				'Active social engagement, voting and political decisions, public discourse, and challenging pro-nuclear narratives.',
			badge: 'Civic · Advocate'
		},
		{
			id: 'direct' as const,
			emoji: '🤝',
			title: 'Contributor',
			tagline: 'I will support with time and resources',
			description:
				'Volunteering time, community organizing, sharing campaign materials, and contributing active resources.',
			badge: 'Action · Contributor'
		}
	];
</script>

<div class="border-2 sm:border-[3px] border-border bg-surface p-5 sm:p-7 rounded-theme shadow-theme-md {className}">
	<!-- Header -->
	<div class="mb-5">
		<div class="mb-2 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
			{stepLabel}
		</div>
		<h2 class="text-2xl sm:text-3xl font-black text-foreground leading-tight font-display">
			{title}
		</h2>
		<p class="mt-1.5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
			{subtitle}
		</p>
	</div>

	<!-- Pledge Form -->
	<form
		method="POST"
		action={actionUrl}
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				isSubmitting = false;
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<!-- Hidden single commitment level field -->
		<input type="hidden" name="commitmentLevels" value={selectedLevel} />

		<!-- 3 Single-select Radio Cards -->
		<div class="space-y-3" role="radiogroup" aria-label="Level of contribution">
			{#each pledgeOptions as opt}
				{@const isSelected = selectedLevel === opt.id}
				<div
					role="radio"
					tabindex="0"
					aria-checked={isSelected}
					onclick={() => selectLevel(opt.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							selectLevel(opt.id);
						}
					}}
					class="w-full text-left border-2 border-border p-3.5 sm:p-4 transition-all cursor-pointer relative rounded-theme select-none focus:outline-none focus:ring-2 focus:ring-primary {isSelected
						? 'bg-background shadow-theme-sm translate-y-[-1px]'
						: 'bg-surface shadow-theme-sm opacity-90 hover:opacity-100 hover:bg-background/50'}"
				>
					<div class="flex items-start gap-3">
						<!-- Single Select Radio Indicator -->
						<div
							class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border transition-colors {isSelected
								? 'bg-primary text-primary-foreground shadow-theme-sm'
								: 'bg-surface'}"
						>
							{#if isSelected}
								<div class="h-2 w-2 rounded-full bg-primary-foreground"></div>
							{/if}
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
							{#if opt.tagline}
								<p class="mt-1 text-xs text-muted-foreground font-medium leading-normal">
									{opt.tagline}
								</p>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Action Buttons: [Join and Record Vote] [?] -->
		<div class="mt-2 flex items-center gap-2.5">
			<!-- Primary Join and Record Vote Button -->
			<button
				type="submit"
				disabled={isSubmitting}
				class="flex flex-1 items-center justify-center gap-2 border-2 border-border bg-primary px-5 py-3 text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				{#if isSubmitting}
					<svg class="h-4 w-4 animate-spin text-primary-foreground" viewBox="0 0 24 24" fill="none">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
					<span>{submitLoadingLabel}</span>
				{:else}
					<span>{submitLabel}</span>
				{/if}
			</button>

			<!-- [?] Info Dialog Trigger Button -->
			<button
				type="button"
				onclick={() => (showInfoModal = true)}
				aria-label="What is this community?"
				class="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-border bg-secondary text-base font-black text-secondary-foreground rounded-theme shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
			>
				?
			</button>

			<!-- Optional Skip to Results Button -->
			{#if showSkipButton}
				<a
					href={resolvedResultsUrl}
					class="flex items-center justify-center gap-2 border-2 border-border bg-secondary px-4 py-3 text-sm font-black text-secondary-foreground rounded-theme shadow-theme-secondary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none text-center cursor-pointer"
				>
					<span>Results →</span>
				</a>
			{/if}
		</div>
	</form>
</div>

<!-- [?] Community Dialog Modal -->
{#if showInfoModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="info-dialog-title"
	>
		<div class="relative w-full max-w-md border-2 sm:border-[3px] border-border bg-surface p-6 rounded-theme shadow-theme-lg">
			<h3 id="info-dialog-title" class="text-xl font-black text-foreground font-display mb-3">
				About Our Community
			</h3>
			<p class="text-sm leading-relaxed text-foreground font-medium mb-6">
				We are creating community with the simple premise: we don't need need nukes, and we dont want a society that has to live under constant threat of anhilation.
			</p>
			<div class="flex items-center justify-end gap-3">
				<button
					type="button"
					onclick={() => (showInfoModal = false)}
					class="border-2 border-border bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
				>
					Close
				</button>
				<a
					href="/about"
					class="border-2 border-border bg-primary px-4 py-2 text-sm font-black text-primary-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
				>
					More...
				</a>
			</div>
		</div>
	</div>
{/if}
