<script lang="ts">
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	const testSuites = [
		{
			title: 'UI Form & Results Experiments',
			path: '/tests/ui-forms',
			badge: 'Active Suite',
			description:
				'Design explorations tackling empty whitespace, heavy shadow stacking, and oversized padding using the Results and Feedback form as benchmark.',
			pages: [
				{
					name: 'UI Forms Index & Fundraiser Button Showcase',
					path: '/tests/ui-forms',
					desc: 'Overview gallery, FundraiserButton variant gallery (icon, cartoon, unicode, pill).'
				},
				{
					name: 'Style 1: Ultra-Compact & Tight',
					path: '/tests/ui-forms/compact',
					desc: '50% less padding, 2px crisp drop shadow, 2-column input grid for Name & Phone, no scroll on mobile.'
				},
				{
					name: 'Style 2: Rounded 2D Cartoon Game',
					path: '/tests/ui-forms/rounded-game',
					desc: 'Design system aesthetic: Fredoka font, rounded-2xl curves, flat vertical 4px drop shadow, pill bars.'
				},
				{
					name: 'Style 3: Clean Flat Minimal',
					path: '/tests/ui-forms/flat-minimal',
					desc: 'Zero heavy block shadows, crisp 1.5px/2px borders, subtle tinting, lightweight look.'
				},
				{
					name: 'Style 4: Unified Single-Card',
					path: '/tests/ui-forms/inline-card',
					desc: 'Single outer card container eliminating nested shadow stacking, integrated header and accordion drawer.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Test Lab Directory · We Don't Need Nukes</title>
</svelte:head>

<main class="min-h-[calc(100dvh-2rem)] bg-background px-4 py-8 text-foreground font-body">
	<div class="mx-auto max-w-3xl">
		<!-- Top Bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back to Home
			</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<FundraiserButton variant="icon" />
				<MenuButton />
			</div>
		</div>

		<!-- Hero Card -->
		<div class="mb-6 border-3 border-border bg-surface p-6 rounded-theme shadow-theme-md">
			<div class="mb-2 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
				Lab &amp; Prototype Directory
			</div>
			<h1 class="text-3xl sm:text-4xl font-black text-foreground font-display">
				Available Test Routes
			</h1>
			<p class="mt-2 text-sm text-muted-foreground leading-relaxed">
				Directory of internal prototype, layout, and component test routes for the We Don't Need Nukes platform.
			</p>
		</div>

		<!-- Global Theme Switcher Panel -->
		<div class="mb-8 border-2 border-border bg-surface p-6 rounded-theme shadow-theme-sm">
			<ThemeSwitcher />
		</div>

		<!-- Test Suites Listing -->
		<div class="space-y-6">
			{#each testSuites as suite}
				<div class="border-2 border-border bg-surface p-6 rounded-theme shadow-theme-sm">
					<div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-3 mb-4">
						<div>
							<span class="inline-block border border-border bg-primary px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-primary-foreground rounded-theme">
								{suite.badge}
							</span>
							<h2 class="mt-1 text-xl font-black text-foreground font-display">{suite.title}</h2>
						</div>

						<a
							href={suite.path}
							class="inline-flex items-center gap-1.5 border-2 border-border bg-secondary px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
						>
							<span>Open Suite</span>
							<span>→</span>
						</a>
					</div>

					<p class="mb-4 text-xs text-muted-foreground leading-relaxed">
						{suite.description}
					</p>

					<!-- Subpages List -->
					<div class="space-y-2.5">
						{#each suite.pages as page}
							<a
								href={page.path}
								class="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-border bg-background/50 p-3 rounded-theme transition-all hover:border-border hover:bg-surface hover:shadow-theme-sm"
							>
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
											{page.name}
										</span>
										<code class="text-[10px] text-muted-foreground font-mono">{page.path}</code>
									</div>
									<p class="mt-0.5 text-xs text-muted-foreground">{page.desc}</p>
								</div>
								<span class="text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform self-end sm:self-center">
									→
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</main>
