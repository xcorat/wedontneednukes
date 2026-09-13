<script lang="ts">
	import type { PageData } from './$types.js';
	import { StepHeaderWidget, JoinFormWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');
</script>

<svelte:head>
	<title>{answeredNo ? 'Join the pledge' : 'Share your view'} · Step 2</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-12 text-foreground font-body">
	<div class="w-full max-w-md">
		<!-- Navigation Bar -->
		<StepHeaderWidget
			backHref="/onboarding/wedontneednukes"
			answer={data.answer}
		/>

		<!-- Main Join Form Widget -->
		<JoinFormWidget
			answer={data.answer}
			turnstileSiteKey={data.turnstileSiteKey}
			callbackUrl={`/onboarding/pledge?answer=${data.answer}`}
		/>

		<!-- Privacy note -->
		<p class="mt-6 text-center text-xs leading-relaxed text-muted-foreground font-medium">
			Your login is used <em>only</em> for this campaign. We never share your data or send unsolicited messages.
		</p>
	</div>
</main>
