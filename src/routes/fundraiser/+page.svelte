<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
</script>

<svelte:head>
	<title>Fundraiser · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-6 py-12 text-foreground font-body">
	<div class="w-full max-w-lg">
		<div class="mb-8 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-2 border-2 border-border bg-surface px-4 py-2 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Back
			</a>
			<MenuButton />
		</div>

		<div class="mb-4 inline-block border-2 border-border bg-secondary px-4 py-1 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme shadow-theme-sm font-display">
			Community Funded
		</div>

		<h1 class="mb-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-display">
			Campaign Fundraiser
		</h1>

		<!-- Community Growth & Campaign Participation Callout -->
		<div class="mb-6 border-3 border-border bg-surface p-5 rounded-theme shadow-theme-md">
			<div class="flex items-center gap-2 mb-2">
				<span class="text-xl">📣</span>
				<h2 class="text-lg font-black text-foreground font-display">Grow the Community</h2>
			</div>
			<p class="text-sm font-medium text-foreground leading-relaxed">
				Follow us, and share to grow the community. Watch out for specific campaigns as we grow to participate (e.g. political candidate asks).
			</p>
			<div class="mt-4 pt-3 border-t-2 border-border/20">
				<p class="text-xs font-black uppercase tracking-wider text-muted-foreground font-display mb-2">
					Official Channels
				</p>
				<SocialLinks variant="pill" />
			</div>
		</div>

		<div class="space-y-4 text-base leading-relaxed text-foreground">
			<div class="border-2 border-border bg-surface p-5 rounded-theme shadow-theme-sm">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-lg font-bold text-foreground font-display">Platform Milestone 1: MVP & Verification</h2>
					<span class="border border-border bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground rounded-theme">Active</span>
				</div>
				<p class="text-sm text-muted-foreground">Funding infrastructure for anonymous & authenticated pledges, anti-bot verification, and real-time counter metrics.</p>
			</div>

			<div class="border-2 border-border bg-surface p-5 rounded-theme shadow-theme-sm">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-lg font-bold text-foreground font-display">Platform Milestone 2: Viral Campaigns & Media</h2>
					<span class="border border-border bg-muted/30 px-2.5 py-0.5 text-xs font-bold text-muted-foreground rounded-theme">Upcoming</span>
				</div>
				<p class="text-sm text-muted-foreground">Creator grants, video memes, community gallery upvoting, and internationalization.</p>
			</div>
		</div>

		<div class="mt-8 flex justify-center">
			<a
				href="/"
				class="inline-flex border-[3px] border-border bg-primary px-8 py-3 text-xl font-bold text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[3px] active:shadow-none"
			>
				Back to Pledge
			</a>
		</div>
	</div>
</main>
