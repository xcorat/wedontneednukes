<script lang="ts">
	import type { PageData } from './$types.js';
	import { StepHeaderWidget, ResultsWidget, ClaimVoteBanner, SocialShareWidget } from '$lib/components/widgets/index.js';
	import { RESULTS_SHARE_TEXT } from '$lib/constants/social.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Results · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-12 text-foreground font-body">
	<div class="w-full max-w-lg">
		<!-- Navigation bar -->
		<StepHeaderWidget
			backHref={data.answer === 'no' ? `/onboarding/pledge?answer=no${data.isAnon ? '&anon=1' : ''}` : `/onboarding/join?answer=yes`}
			backLabel="← Edit stance"
			showFundraiser={true}
		/>

		<!-- Main Results Card -->
		<ResultsWidget answer={data.answer} stats={data.stats} />

		<!-- Public Results & Votes Feed Link -->
		<div class="mt-4">
			<a
				href="/results"
				class="flex items-center justify-between border-2 border-border bg-primary/10 p-3.5 sm:p-4 rounded-theme shadow-theme-sm transition-all hover:bg-primary/20 hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none group"
			>
				<div class="flex items-center gap-3">
					<span class="text-2xl">📊</span>
					<div>
						<div class="text-sm font-black text-foreground font-display group-hover:text-primary">
							Live Campaign Results
						</div>
						<p class="text-xs text-muted-foreground font-medium">
							Explore live public votes, citizen commitments, and progress metrics.
						</p>
					</div>
				</div>
				<span class="text-xs font-black text-primary font-display shrink-0 ml-2">
					View All →
				</span>
			</a>
		</div>

		<!-- What's Next? Action Hub -->
		<section class="mt-6 border-2 sm:border-[3px] border-border bg-surface p-5 sm:p-6 rounded-theme shadow-theme-md">
			<div class="mb-4">
				<div class="mb-1.5 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
					Next Steps
				</div>
				<h3 class="text-xl sm:text-2xl font-black text-foreground font-display">
					What's Next?
				</h3>
				<p class="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
					Take action, learn about the movement, and discover our coalition partners.
				</p>
			</div>

			<div class="flex flex-col gap-2.5">
				<!-- What is this campaign -> /about -->
				<a
					href="/about"
					class="flex items-center justify-between border-2 border-border bg-background p-3.5 sm:p-4 rounded-theme shadow-theme-sm transition-all hover:translate-y-[-1px] hover:bg-surface active:translate-x-[1px] active:translate-y-[2px] active:shadow-none group"
				>
					<div class="flex items-center gap-3">
						<span class="text-2xl">🕊️</span>
						<div>
							<div class="text-sm font-black text-foreground font-display group-hover:text-primary">
								What is this campaign?
							</div>
							<p class="text-xs text-muted-foreground font-medium">
								Read our mission, core vision, and why we don't need nukes.
							</p>
						</div>
					</div>
					<span class="text-xs font-black text-primary font-display shrink-0 ml-2">
						About →
					</span>
				</a>

				<!-- Other campaigns -> /campaigns -->
				<a
					href="/campaigns"
					class="flex items-center justify-between border-2 border-border bg-background p-3.5 sm:p-4 rounded-theme shadow-theme-sm transition-all hover:translate-y-[-1px] hover:bg-surface active:translate-x-[1px] active:translate-y-[2px] active:shadow-none group"
				>
					<div class="flex items-center gap-3">
						<span class="text-2xl">📢</span>
						<div>
							<div class="text-sm font-black text-foreground font-display group-hover:text-primary">
								Other campaigns
							</div>
							<p class="text-xs text-muted-foreground font-medium">
								Explore partner campaigns, divestment efforts, and youth initiatives.
							</p>
						</div>
					</div>
					<span class="text-xs font-black text-primary font-display shrink-0 ml-2">
						Campaigns →
					</span>
				</a>

				<!-- Other orgs -> /organizations -->
				<a
					href="/organizations"
					class="flex items-center justify-between border-2 border-border bg-background p-3.5 sm:p-4 rounded-theme shadow-theme-sm transition-all hover:translate-y-[-1px] hover:bg-surface active:translate-x-[1px] active:translate-y-[2px] active:shadow-none group"
				>
					<div class="flex items-center gap-3">
						<span class="text-2xl">🌐</span>
						<div>
							<div class="text-sm font-black text-foreground font-display group-hover:text-primary">
								Other orgs
							</div>
							<p class="text-xs text-muted-foreground font-medium">
								Discover international NGOs, coalitions, and peace networks.
							</p>
						</div>
					</div>
					<span class="text-xs font-black text-primary font-display shrink-0 ml-2">
						Organizations →
					</span>
				</a>
			</div>
		</section>

		<!-- Anonymous Claim Vote Banner -->
		{#if data.isAnon}
			<ClaimVoteBanner answer={data.answer} />
		{/if}

		<!-- Share buttons on bottom -->
		<div class="mt-6">
			<SocialShareWidget
				text={RESULTS_SHARE_TEXT}
				title="Share this campaign"
				variant="card"
			>
				<div class="flex items-center justify-between gap-2.5 pt-1">
					<a
						href="/profile"
						class="flex-1 text-center border-2 border-border bg-background py-2.5 px-3 text-xs font-black uppercase text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-display"
					>
						Profile
					</a>
					<a
						href="/wiki"
						class="flex-1 text-center border-2 border-border bg-background py-2.5 px-3 text-xs font-black uppercase text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-display"
					>
						Wiki
					</a>
					<a
						href="/about"
						class="flex-1 text-center border-2 border-border bg-background py-2.5 px-3 text-xs font-black uppercase text-foreground rounded-theme shadow-theme-sm transition-all hover:bg-secondary hover:text-secondary-foreground hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-display"
					>
						About
					</a>
				</div>
			</SocialShareWidget>
		</div>

		<!-- Footnote -->
		<p class="mt-6 text-center text-xs text-muted-foreground font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
