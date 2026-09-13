<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import { ResultsWidget } from '$lib/components/widgets/index.js';

	let { data }: { data: PageData } = $props();

	const isAgree = $derived(data.userChoice === 'no');

	const levelLabels: Record<string, { label: string; badge: string; emoji: string }> = {
		passive: { label: 'Passive Ally', badge: 'Default · Baseline', emoji: '🛡️' },
		active: { label: 'Active Advocate', badge: 'Civic Engagement', emoji: '🗣️' },
		direct: { label: 'Direct Contributor', badge: 'Direct Action', emoji: '🤝' }
	};
</script>

<svelte:head>
	<title>Dashboard · We Don't Need Nukes</title>
</svelte:head>

<main class="min-h-[calc(100dvh-2rem)] w-full bg-background px-4 py-6 sm:py-10 text-foreground font-body">
	<div class="mx-auto max-w-2xl space-y-6">
		<!-- Top Bar -->
		<header class="flex items-center justify-between border-b-2 border-border pb-4">
			<div class="flex items-center gap-3">
				{#if data.user.image}
					<img
						src={data.user.image}
						alt={data.user.name}
						class="h-10 w-10 rounded-full border-2 border-border object-cover"
					/>
				{:else}
					<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-secondary font-black text-secondary-foreground font-display">
						{data.user.name?.charAt(0)?.toUpperCase() ?? 'U'}
					</div>
				{/if}
				<div>
					<h1 class="text-lg sm:text-xl font-black text-foreground font-display">
						Welcome, {data.user.name}
					</h1>
					<p class="text-xs text-muted-foreground font-medium">Verified Campaign Member</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<FundraiserButton variant="icon" />
				<MenuButton />
			</div>
		</header>

		<!-- Active Pledge Status Card -->
		<section class="border-2 sm:border-[3px] border-border bg-surface p-6 rounded-theme shadow-theme-md">
			<div class="flex items-start justify-between gap-4">
				<div>
					<div class="mb-2 inline-block border border-border bg-primary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-primary-foreground rounded-theme">
						Your Recorded Stance
					</div>
					<h2 class="text-2xl font-black text-foreground font-display">
						{isAgree ? "Agree — We Don't Need Nukes" : 'We do | Not sure'}
					</h2>
					<p class="mt-1 text-xs sm:text-sm text-muted-foreground">
						{isAgree
							? 'You have taken a public stance opposing the modernization and expansion of nuclear weapons.'
							: 'Your perspective is recorded as part of our transparent community dialogue.'}
					</p>
				</div>

				<a
					href={`/pledge?answer=${data.userChoice}`}
					class="shrink-0 border-2 border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px]"
				>
					Edit pledge
				</a>
			</div>

			<!-- Commitments breakdown -->
			<div class="mt-6 border-t-2 border-border pt-4">
				<h3 class="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 font-display">
					Active Participation Levels
				</h3>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
					{#each data.commitmentLevels as level}
						{@const info = levelLabels[level] ?? { label: level, badge: 'Pledge', emoji: '✨' }}
						<div class="flex items-center gap-2 border-2 border-border bg-background p-2.5 rounded-theme">
							<span class="text-lg">{info.emoji}</span>
							<div>
								<p class="text-xs font-black text-foreground font-display leading-none">{info.label}</p>
								<p class="text-[10px] text-muted-foreground mt-0.5">{info.badge}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Live Community Results -->
		<section>
			<h2 class="text-lg font-black text-foreground mb-3 font-display">Live Community Consensus</h2>
			<ResultsWidget answer={data.userChoice} stats={data.stats} />
		</section>
	</div>
</main>
