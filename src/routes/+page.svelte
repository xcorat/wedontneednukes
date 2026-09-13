<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import { QuestionHeroWidget, ResultsWidget, ClaimVoteBanner } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>We don't need Nukes</title>
	<meta
		name="description"
		content="We don't need nukes. One fundamental premise. Share your perspective."
	/>
</svelte:head>

{#if data.isReturningAnon && data.stats}
	<!-- Returning Anonymous Voter: show recorded results & claim banner -->
	<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-8 sm:py-12 text-foreground font-body">
		<div class="w-full max-w-lg">
			<!-- Header -->
			<header class="flex h-12 w-full items-center justify-end gap-2.5 mb-6">
				<FundraiserButton variant="icon" />
				<MenuButton />
			</header>

			<!-- Live Community Results with user's stance indicator -->
			<ResultsWidget answer={data.userChoice} stats={data.stats} />

			<!-- Claim Vote Banner -->
			<ClaimVoteBanner
				answer={data.userChoice}
				turnstileSiteKey={data.turnstileSiteKey}
			/>

			<!-- Retake button / secondary action -->
			<div class="mt-4 text-center">
				<a
					href="/pledge"
					class="text-xs font-bold text-muted-foreground hover:text-foreground underline underline-offset-4"
				>
					Update your pledge commitments →
				</a>
			</div>
		</div>
	</main>
{:else}
	<!-- New Visitor: show full-screen iconic onboarding hero -->
	<main class="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-background text-foreground select-none font-body">
		<!-- Button bar / Navbar at top: Fundraiser yellow heart button + Menubar button -->
		<header class="flex h-[8%] min-h-[44px] sm:min-h-[48px] w-full items-center justify-end px-4 sm:px-8 gap-2.5 shrink-0">
			<!-- Fundraiser button: yellow heart button -->
			<FundraiserButton variant="icon" />

			<!-- Menubar button (toggles menu drawer) -->
			<MenuButton />
		</header>

		<!-- Iconic Hero Question Widget -->
		<QuestionHeroWidget model={data.viewModel} />
	</main>
{/if}
