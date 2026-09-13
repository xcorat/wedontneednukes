<script lang="ts">
	import type { PageData } from './$types.js';
	import { goto } from '$app/navigation';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import BotButton from '$lib/components/BotButton.svelte';
	import { QuestionHeroWidget, ResultsWidget, ClaimVoteBanner, SocialShareWidget } from '$lib/components/widgets/index.js';
	import { RESULTS_SHARE_TEXT } from '$lib/constants/social.js';

	let { data }: { data: PageData } = $props();

	function handleChoice(_choiceId: string, choiceValue: string) {
		const queryAnswer = choiceValue === 'agree' ? 'no' : 'yes';
		goto(`/onboarding/join?answer=${queryAnswer}`);
	}
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
				<ShareButton />
				<BotButton />
				<MenuButton />
			</header>

			<!-- Live Community Results with user's stance indicator -->
			<ResultsWidget answer={data.userChoice} stats={data.stats} />

			<!-- Claim Vote Banner -->
			<ClaimVoteBanner
				answer={data.userChoice}
				turnstileSiteKey={data.turnstileSiteKey}
			/>

			<!-- Social Share Widget -->
			<div class="mt-4">
				<SocialShareWidget
					text={RESULTS_SHARE_TEXT}
					title="Share these results"
					variant="card"
				/>
			</div>

			<!-- Retake button / secondary action -->
			<div class="mt-4 text-center">
				<a
					href={`/onboarding/pledge?answer=${data.userChoice}&anon=1`}
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
		<!-- Button bar / Navbar at top: Fundraiser yellow heart button + Share + Bot + Menubar button -->
		<header class="flex h-[8%] min-h-[44px] sm:min-h-[48px] w-full items-center justify-end px-4 sm:px-8 gap-2.5 shrink-0">
			<!-- Fundraiser button: yellow heart button -->
			<FundraiserButton variant="icon" />
			<ShareButton />
			<BotButton />

			<!-- Menubar button (toggles menu drawer) -->
			<MenuButton />
		</header>

		<!-- Iconic Hero Question Widget -->
		<QuestionHeroWidget model={data.viewModel} onChoice={handleChoice} />
	</main>
{/if}
