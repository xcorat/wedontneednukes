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
			backHref={`/onboarding/pledge?answer=${data.answer}${data.isAnon ? '&anon=1' : ''}`}
			backLabel="← Edit pledge"
			showFundraiser={true}
		/>

		<!-- Main Results Card -->
		<ResultsWidget answer={data.answer} stats={data.stats} />

		<!-- Anonymous Claim Vote Banner -->
		{#if data.isAnon}
			<ClaimVoteBanner answer={data.answer} />
		{/if}

		<!-- Social Share Widget -->
		<div class="mt-6">
			<SocialShareWidget
				text={RESULTS_SHARE_TEXT}
				title="Share these results"
				variant="card"
			/>
		</div>

		<!-- Footnote -->
		<p class="mt-6 text-center text-xs text-muted-foreground font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
