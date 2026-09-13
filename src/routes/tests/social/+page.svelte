<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import BotButton from '$lib/components/BotButton.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { SocialShareWidget } from '$lib/components/widgets/index.js';
	import { RESULTS_SHARE_TEXT, DEFAULT_SHARE_TEXT } from '$lib/constants/social.js';
</script>

<svelte:head>
	<title>Social Sharing Lab · We Don't Need Nukes</title>
</svelte:head>

<main class="min-h-[calc(100dvh-2rem)] bg-background px-4 py-8 text-foreground font-body">
	<div class="mx-auto max-w-3xl space-y-8">
		<!-- Top Bar -->
		<div class="flex items-center justify-between gap-3">
			<a
				href="/tests"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back to Tests
			</a>
			<div class="flex items-center gap-2">
				<FundraiserButton variant="icon" />
				<ShareButton />
				<BotButton />
				<MenuButton />
			</div>
		</div>

		<!-- Header -->
		<div>
			<span class="inline-block px-2 py-0.5 text-xs font-black uppercase tracking-wider border border-border bg-secondary text-secondary-foreground">
				Component Showcase
			</span>
			<h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground font-display mt-2">
				Social Sharing &amp; Profiles
			</h1>
			<p class="text-sm sm:text-base text-muted-foreground mt-1">
				Previewing embeddable sharing widgets (card, row, compact variants), clipboard direct-link copying, and official channel links.
			</p>
		</div>

		<!-- Theme switcher preview bar -->
		<div class="border-2 border-border bg-surface p-4 rounded-theme shadow-theme-sm">
			<h2 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
				Test with Theme:
			</h2>
			<ThemeSwitcher />
		</div>

		<!-- Top Header Action Bar Preview -->
		<section class="border-2 border-border bg-surface p-6 rounded-theme shadow-theme-md space-y-4">
			<div>
				<h2 class="text-lg font-black uppercase tracking-wide text-foreground font-display">
					Top Header Action Bar
				</h2>
				<p class="text-xs text-muted-foreground mt-1">
					Displays Fundraiser (💛), Share (opens share dialog), Bot (opens tooltip "Helper chat bot coming soon."), and Menu button.
				</p>
			</div>

			<div class="flex items-center justify-end gap-2.5 border-2 border-dashed border-border/40 p-4 bg-background rounded-theme">
				<FundraiserButton variant="icon" />
				<ShareButton />
				<BotButton />
				<MenuButton />
			</div>
		</section>

		<!-- Section 1: Official Channels -->
		<section class="border-2 border-border bg-surface p-6 rounded-theme shadow-theme-md space-y-6">
			<div>
				<h2 class="text-lg font-black uppercase tracking-wide text-foreground font-display">
					Official Campaign Channels (SocialLinks)
				</h2>
				<p class="text-xs text-muted-foreground mt-1">
					X, Bluesky, Facebook, and TikTok follow badges.
				</p>
			</div>

			<div class="space-y-4">
				<div>
					<p class="text-xs font-bold text-muted-foreground mb-2">Variant: icons (Default)</p>
					<SocialLinks variant="icons" />
				</div>
				<div>
					<p class="text-xs font-bold text-muted-foreground mb-2">Variant: pill</p>
					<SocialLinks variant="pill" />
				</div>
				<div class="max-w-md">
					<p class="text-xs font-bold text-muted-foreground mb-2">Variant: list</p>
					<SocialLinks variant="list" />
				</div>
			</div>
		</section>

		<!-- Section 2: Social Share Widget - Card Variant -->
		<section class="space-y-3">
			<div>
				<h2 class="text-lg font-black uppercase tracking-wide text-foreground font-display">
					1. Card Variant (Default for Results &amp; About)
				</h2>
				<p class="text-xs text-muted-foreground">
					Full-featured card containing headline, subtext, platform share buttons, and copy-link button.
				</p>
			</div>
			<SocialShareWidget
				title="Share these results"
				text={RESULTS_SHARE_TEXT}
				variant="card"
			/>
		</section>

		<!-- Section 3: Social Share Widget - Compact Variant -->
		<section class="space-y-3">
			<div>
				<h2 class="text-lg font-black uppercase tracking-wide text-foreground font-display">
					2. Compact Variant (Optimized for Wiki/Articles &amp; Footers)
				</h2>
				<p class="text-xs text-muted-foreground">
					Minimal icon-only row for inline contextual sharing on knowledge base answers.
				</p>
			</div>
			<div class="border-2 border-border bg-surface p-4 rounded-theme shadow-theme-sm">
				<SocialShareWidget
					title="Nuclear Ban FAQ"
					text="Why do we need a nuclear ban? Read the facts:"
					variant="compact"
				/>
			</div>
		</section>

		<!-- Section 4: Social Share Widget - Row Variant -->
		<section class="space-y-3">
			<div>
				<h2 class="text-lg font-black uppercase tracking-wide text-foreground font-display">
					3. Row Variant (Pill Buttons)
				</h2>
				<p class="text-xs text-muted-foreground">
					Horizontal layout with platform labels and Copy Link button.
				</p>
			</div>
			<div class="border-2 border-border bg-surface p-4 rounded-theme shadow-theme-sm">
				<SocialShareWidget
					title="General Share"
					text={DEFAULT_SHARE_TEXT}
					variant="row"
				/>
			</div>
		</section>
	</div>
</main>
