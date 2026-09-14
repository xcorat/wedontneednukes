<script lang="ts">
	import type { PageData } from './$types.js';
	import { goto } from '$app/navigation';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import { QuestionHeroWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();

	function handleChoice(_choiceId: string, choiceValue: string) {
		if (choiceValue === 'agree') {
			goto('/onboarding/pledge?answer=no');
		} else {
			goto('/onboarding/join?answer=yes');
		}
	}
</script>

<svelte:head>
	<title>Step 1 · We Don't Need Nukes</title>
</svelte:head>

<main class="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-background text-foreground select-none font-body">
	<header class="flex h-[8%] min-h-[44px] sm:min-h-[48px] w-full items-center justify-end px-4 sm:px-8 gap-2.5 shrink-0">
		<FundraiserButton variant="icon" />
		<MenuButton />
	</header>

	<QuestionHeroWidget model={data.viewModel} onChoice={handleChoice} />
</main>
