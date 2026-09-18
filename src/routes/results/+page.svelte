<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import BotButton from '$lib/components/BotButton.svelte';
	import { ResultsWidget, LatestVotesWidget, SocialShareWidget } from '$lib/components/widgets/index.js';
	import { RESULTS_SHARE_TEXT } from '$lib/constants/social.js';

	let { data }: { data: PageData } = $props();

	const widgetStats = $derived({
		totalVotes: data.summary.totalVotes,
		agreeCount: data.summary.agreeCount,
		agreePercentage: data.summary.agreePercentage,
		otherCount: data.summary.otherCount,
		otherPercentage: data.summary.otherPercentage,
		validated: data.summary.validated
	});
</script>

<svelte:head>
	<title>Campaign Results &amp; Public Pledges · We Don't Need Nukes</title>
	<meta
		name="description"
		content="Live public voting results and citizen commitments for the We Don't Need Nukes campaign."
	/>
</svelte:head>

<div class="min-h-screen bg-background text-foreground font-body">
	<!-- Navigation Bar -->
	<header class="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-2 border-border bg-background/95 px-4 sm:px-8 backdrop-blur-xs">
		<a
			href="/"
			class="flex items-center gap-2 text-sm sm:text-base font-black uppercase tracking-wider text-foreground font-display transition-colors hover:text-primary"
		>
			<span>🕊️</span>
			<span>We Don't Need Nukes</span>
		</a>

		<div class="flex items-center gap-2 sm:gap-2.5">
			<FundraiserButton variant="icon" />
			<ShareButton />
			<BotButton />
			<MenuButton />
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
		<!-- Page Header -->
		<section class="space-y-2 text-center sm:text-left">
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground font-display tracking-tight">
				Campaign Results &amp; Pledges
			</h1>
		</section>

		<!-- Participant Status Banner -->
		{#if data.userChoice}
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-border bg-surface p-4 rounded-theme shadow-theme-sm">
				<div class="flex items-center gap-2.5">
					<span class="text-xl">
						{data.userChoice === 'no' ? '🕊️' : '🤔'}
					</span>
					<div>
						<p class="text-xs font-black uppercase tracking-wider text-muted-foreground font-display">
							Your Recorded Stance
						</p>
						<p class="text-sm font-bold text-foreground">
							{data.userChoice === 'no' ? "You agreed: We don't need nukes" : "You chose: Other / Needs discussion"}
						</p>
					</div>
				</div>

				<a
					href={`/onboarding/pledge?answer=${data.userChoice}`}
					class="self-start sm:self-auto border-2 border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-xs hover:bg-secondary transition-all"
				>
					Update Commitments →
				</a>
			</div>
		{:else}
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 sm:border-[3px] border-border bg-primary/10 p-4 sm:p-5 rounded-theme shadow-theme-sm">
				<div>
					<h3 class="text-base font-black text-foreground font-display">
						Haven't added your voice yet?
					</h3>
					<p class="text-xs text-muted-foreground font-medium mt-0.5">
						Join thousands of citizens making their commitment to peace visible.
					</p>
				</div>

				<a
					href="/onboarding/pledge?answer=no"
					class="self-start sm:self-auto border-2 border-border bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground rounded-theme shadow-theme-primary transition-all hover:translate-y-[1px] active:translate-y-[2px] font-display shrink-0"
				>
					Take the Pledge →
				</a>
			</div>
		{/if}

		<!-- Key Aggregate Cards -->
		<section class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
			<div class="border-2 border-border bg-surface p-3.5 sm:p-4 rounded-theme shadow-theme-sm">
				<div class="text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
					Total Votes
				</div>
				<div class="mt-1 text-2xl sm:text-3xl font-black text-foreground font-mono">
					{data.summary.totalVotes}
				</div>
				<div class="text-[11px] text-muted-foreground font-medium mt-0.5">
					all participants
				</div>
			</div>

			<div class="border-2 border-border bg-surface p-3.5 sm:p-4 rounded-theme shadow-theme-sm">
				<div class="text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
					Agreement Rate
				</div>
				<div class="mt-1 text-2xl sm:text-3xl font-black text-primary font-mono">
					{data.summary.agreePercentage}%
				</div>
				<div class="text-[11px] text-muted-foreground font-medium mt-0.5">
					{data.summary.agreeCount} agree
				</div>
			</div>

			<div class="border-2 border-border bg-surface p-3.5 sm:p-4 rounded-theme shadow-theme-sm">
				<div class="text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
					Verified Citizens
				</div>
				<div class="mt-1 text-2xl sm:text-3xl font-black text-foreground font-mono">
					{data.summary.validated.totalVotes}
				</div>
				<div class="text-[11px] text-muted-foreground font-medium mt-0.5">
					authenticated signers
				</div>
			</div>

			<div class="border-2 border-border bg-surface p-3.5 sm:p-4 rounded-theme shadow-theme-sm">
				<div class="text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display">
					Pledge Tiers
				</div>
				<div class="mt-1 text-2xl sm:text-3xl font-black text-foreground font-mono">
					{data.summary.commitments.totalPledges}
				</div>
				<div class="text-[11px] text-muted-foreground font-medium mt-0.5">
					active commitments
				</div>
			</div>
		</section>

		<!-- Progress Bar & Consensus Widget -->
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-xl sm:text-2xl font-black text-foreground font-display">
					Community Consensus Progress
				</h2>
			</div>

			<ResultsWidget
				answer={data.userChoice}
				stats={widgetStats}
				goal={100}
				variant="card"
			/>
		</section>

		<!-- Commitment Tiers Breakdown -->
		{#if data.summary.commitments.totalPledges > 0}
			<section class="border-2 sm:border-[3px] border-border bg-surface p-5 sm:p-6 rounded-theme shadow-theme-md">
				<div class="mb-4">
					<div class="mb-1 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
						Action Breakdown
					</div>
					<h3 class="text-xl sm:text-2xl font-black text-foreground font-display">
						Citizen Commitment Tiers
					</h3>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
					<!-- Ally -->
					<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between">
								<span class="text-base font-black text-foreground font-display">🛡️ Ally</span>
								<span class="text-xs font-mono font-bold text-muted-foreground">
									{data.summary.commitments.tiers.passive.count} ({data.summary.commitments.tiers.passive.percentage}%)
								</span>
							</div>
							<p class="text-xs text-muted-foreground mt-1 font-medium">
								Opposes nuclear expansion and speaks up against proliferation.
							</p>
						</div>
						<div class="mt-3 h-2 w-full border border-border bg-surface overflow-hidden rounded-theme">
							<div
								class="h-full bg-primary transition-all duration-500 rounded-theme"
								style="width: {data.summary.commitments.tiers.passive.percentage}%"
							></div>
						</div>
					</div>

					<!-- Advocate -->
					<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between">
								<span class="text-base font-black text-foreground font-display">📣 Advocate</span>
								<span class="text-xs font-mono font-bold text-muted-foreground">
									{data.summary.commitments.tiers.active.count} ({data.summary.commitments.tiers.active.percentage}%)
								</span>
							</div>
							<p class="text-xs text-muted-foreground mt-1 font-medium">
								Votes for disarmament candidates and divests from weapon contractors.
							</p>
						</div>
						<div class="mt-3 h-2 w-full border border-border bg-surface overflow-hidden rounded-theme">
							<div
								class="h-full bg-primary transition-all duration-500 rounded-theme"
								style="width: {data.summary.commitments.tiers.active.percentage}%"
							></div>
						</div>
					</div>

					<!-- Contributor -->
					<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm flex flex-col justify-between">
						<div>
							<div class="flex items-center justify-between">
								<span class="text-base font-black text-foreground font-display">🕊️ Contributor</span>
								<span class="text-xs font-mono font-bold text-muted-foreground">
									{data.summary.commitments.tiers.direct.count} ({data.summary.commitments.tiers.direct.percentage}%)
								</span>
							</div>
							<p class="text-xs text-muted-foreground mt-1 font-medium">
								Actively organizes peace initiatives, events, and community education.
							</p>
						</div>
						<div class="mt-3 h-2 w-full border border-border bg-surface overflow-hidden rounded-theme">
							<div
								class="h-full bg-primary transition-all duration-500 rounded-theme"
								style="width: {data.summary.commitments.tiers.direct.percentage}%"
							></div>
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- Latest Public Votes & Commitments Widget -->
		<section>
			<LatestVotesWidget
				votes={data.latestVotes}
				totalCount={data.totalVotesCount}
				showMoreButton={true}
				moreHref="/results/votes"
			/>
		</section>

		<!-- Social Share Widget -->
		<section class="mt-8">
			<SocialShareWidget
				text={RESULTS_SHARE_TEXT}
				title="Share Campaign Results"
				variant="card"
			>
				<div class="flex flex-wrap items-center justify-between gap-2.5 pt-1">
					<a
						href="/about"
						class="flex-1 text-center border-2 border-border bg-background py-2.5 px-3 text-xs font-black uppercase text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[-1px] font-display"
					>
						About the Campaign
					</a>
					<a
						href="/campaigns"
						class="flex-1 text-center border-2 border-border bg-background py-2.5 px-3 text-xs font-black uppercase text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[-1px] font-display"
					>
						Other Campaigns
					</a>
					<a
						href="/wiki"
						class="flex-1 text-center border-2 border-border bg-background py-2.5 px-3 text-xs font-black uppercase text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[-1px] font-display"
					>
						Wiki &amp; FAQ
					</a>
				</div>
			</SocialShareWidget>
		</section>

		<!-- Footnote -->
		<p class="text-center text-xs text-muted-foreground font-medium pb-8">
			All counts are anti-bot protected with Cloudflare Turnstile and cryptographic content verification.
		</p>
	</main>
</div>
