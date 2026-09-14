<script lang="ts">
	import type { PageData } from './$types.js';
	import { StepHeaderWidget, PledgeFormWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Step 2 · Welcome to the Community</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-lg">
		<!-- Top Bar: back points to Step 1 -->
		<StepHeaderWidget
			backHref="/onboarding/wedontneednukes"
			backLabel="← We Don't Need Nukes"
			answer={data.answer}
		/>

		<!-- Main Pledge Form Widget -->
		<PledgeFormWidget
			answer={data.answer}
			initialLevels={data.commitmentLevels}
			isAnon={data.isAnon}
			title="Welcome to the community!"
			subtitle="what level of  commitment are you comfortable with?"
			stepLabel="Step 2: Level of contribution"
			submitLabel="Join and Record Vote"
			submitLoadingLabel="Recording vote..."
			showSkipButton={false}
			showFundraiserCallout={false}
		/>

		<!-- Footnote -->
		<p class="mt-5 text-center text-xs leading-relaxed text-muted-foreground font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
