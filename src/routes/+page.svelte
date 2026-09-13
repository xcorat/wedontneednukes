<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import { QuestionHeroWidget } from '$lib/components/widgets/index.js';
</script>

<svelte:head>
	<title>We don't need Nukes</title>
	<meta
		name="description"
		content="We don't need nukes. One fundamental premise. Share your perspective."
	/>
</svelte:head>

<main class="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-background text-foreground select-none font-body">
	<!-- Button bar / Navbar at top: Fundraiser yellow heart button + Menubar button -->
	<header class="flex h-[8%] min-h-[44px] sm:min-h-[48px] w-full items-center justify-end px-4 sm:px-8 gap-2.5 shrink-0">
		<!-- Fundraiser button: yellow heart button -->
		<FundraiserButton variant="icon" />

		<!-- Menubar button (toggles menu drawer) -->
		<MenuButton />
	</header>

	<!-- Iconic Hero Question Widget -->
	<QuestionHeroWidget />
</main>
