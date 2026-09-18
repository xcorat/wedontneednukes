<script lang="ts">
	import type { PageData } from './$types.js';
	import { StepHeaderWidget, JoinFormWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');
</script>

<svelte:head>
	<title>Record your voice! · Step 3</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-12 text-foreground font-body">
	<div class="w-full max-w-md">
		<!-- Navigation Bar: Back points to Step 2 if agreed, or Step 1 if disagreed -->
		<StepHeaderWidget
			backHref={answeredNo ? '/onboarding/pledge?answer=no' : '/onboarding/wedontneednukes'}
			backLabel={answeredNo ? '← Contribution' : "← We Don't Need Nukes"}
			answer={data.answer}
		/>

		<!-- Main Join Form Widget -->
		<JoinFormWidget
			answer={data.answer}
			turnstileSiteKey={data.turnstileSiteKey}
			callbackUrl={`/onboarding/results?answer=${data.answer}`}
			stepLabel="Step 3 of 4 · Record"
			title="Record your voice!"
			subtitle="Sign in and validate that you are real. You can also continue anonymously."
		/>

		<!-- Privacy note -->
		<p class="mt-6 text-center text-xs leading-relaxed text-muted-foreground font-medium">
			Your login is used <em>only</em> for this campaign. We will never sell your data or send unsolicited messages.
		</p>
	</div>
</main>
