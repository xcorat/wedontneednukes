<script lang="ts">
	import type { PageData } from './$types.js';
	import { StepHeaderWidget, PledgeFormWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Step 3 · Choose Your Pledge Level</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-lg">
		<!-- Top Bar -->
		<StepHeaderWidget
			backHref={`/onboarding/join?answer=${data.answer}`}
			answer={data.answer}
		/>

		<!-- Main Pledge Form Widget -->
		<PledgeFormWidget
			answer={data.answer}
			initialLevels={data.commitmentLevels}
			initialName={data.name}
			initialFeedback={data.feedback}
			isAnon={data.isAnon}
		/>

		<!-- Footnote -->
		<p class="mt-5 text-center text-xs leading-relaxed text-muted-foreground font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
