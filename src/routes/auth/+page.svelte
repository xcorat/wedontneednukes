<script lang="ts">
	import type { PageData } from './$types.js';
	import { StepHeaderWidget, JoinFormWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Sign In · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-12 text-foreground font-body">
	<div class="w-full max-w-md">
		<!-- Top Bar: Back link & Menu -->
		<StepHeaderWidget backHref="/" answer={null} />

		<!-- Main Auth Form Card -->
		<JoinFormWidget
			answer=""
			callbackUrl={data.redirectUrl}
			allowAnonymous={false}
			turnstileSiteKey={data.turnstileSiteKey}
		/>

		<!-- Privacy note -->
		<p class="mt-6 text-center text-xs leading-relaxed text-muted-foreground font-medium">
			Your login is used <em>only</em> for this campaign. We never share your data or send unsolicited messages.
		</p>
	</div>
</main>
