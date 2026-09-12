<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
</script>

<svelte:head>
	<title>{profile.displayName || profile.name} · Public Profile</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-start bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-2xl">
		<!-- Top Bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Home
			</a>

			<div class="flex items-center gap-2">
				{#if profile.isOwner}
					<a
						href="/settings/profile"
						class="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-black uppercase text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
					>
						<span>⚙️ Edit Profile</span>
					</a>
				{/if}
				<MenuButton />
			</div>
		</div>

		<!-- Owner Banner -->
		{#if profile.isOwner}
			<div class="mb-4 flex items-center justify-between gap-3 border-2 border-border bg-secondary p-3.5 rounded-theme shadow-theme-sm">
				<div class="flex items-center gap-2 text-xs font-bold text-secondary-foreground">
					<span>👁️</span>
					<span>You are viewing your own profile. Only fields marked public are visible to other visitors.</span>
				</div>
				<a
					href="/settings/profile"
					class="shrink-0 border-2 border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground rounded-theme shadow-theme-sm hover:translate-y-[1px]"
				>
					Edit
				</a>
			</div>
		{/if}

		<!-- Profile Card -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
			<!-- Header Profile Info -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b-2 border-border pb-6">
				{#if profile.image}
					<img
						src={profile.image}
						alt={profile.name}
						class="h-20 w-20 rounded-full border-2 border-border object-cover shadow-theme-sm"
					/>
				{:else}
					<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-secondary text-2xl font-black text-secondary-foreground shadow-theme-sm">
						{profile.name ? profile.name[0]?.toUpperCase() : 'U'}
					</div>
				{/if}

				<div class="flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="text-2xl sm:text-3xl font-black text-foreground font-display">
							{profile.displayName || profile.name}
						</h1>
						{#if profile.displayName}
							<span class="inline-flex items-center text-xs font-bold text-muted-foreground bg-border/10 px-2 py-0.5 rounded-theme">
								@{profile.name}
							</span>
						{/if}
					</div>

					<p class="mt-1 text-xs text-muted-foreground">
						Member since {new Date(profile.memberSince).toLocaleDateString()}
					</p>

					{#if profile.location || profile.website}
						<div class="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
							{#if profile.location}
								<span class="inline-flex items-center gap-1 font-bold text-foreground">
									<span>📍</span>
									<span>{profile.location}</span>
								</span>
							{/if}
							{#if profile.website}
								<a
									href={profile.website}
									target="_blank"
									rel="noreferrer"
									class="inline-flex items-center gap-1 font-bold text-primary underline"
								>
									<span>🔗</span>
									<span>{profile.website.replace(/^https?:\/\//, '')}</span>
								</a>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Bio -->
			{#if profile.bio}
				<div class="mt-6">
					<h2 class="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display mb-2">
						About
					</h2>
					<p class="text-sm text-foreground leading-relaxed whitespace-pre-line border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
						{profile.bio}
					</p>
				</div>
			{/if}

			<!-- Public Campaign Pledges -->
			{#if profile.pledges && profile.pledges.length > 0}
				<div class="mt-8 border-t-2 border-border pt-6">
					<h2 class="text-base font-black uppercase tracking-wider text-foreground font-display mb-4">
						Campaign Commitments
					</h2>

					<div class="flex flex-col gap-3">
						{#each profile.pledges as p}
							<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
								<div class="flex items-center justify-between">
									<h3 class="text-sm font-bold text-foreground">{p.campaignTitle}</h3>
									<span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-theme border-2 border-border bg-surface">
										<span>{p.choice === 'no' ? '🕊️ No' : '🤔 Yes'}</span>
									</span>
								</div>

								<div class="mt-2.5 flex flex-wrap gap-1.5">
									{#each p.commitmentLevels as lvl}
										<span class="inline-block border-2 border-border bg-secondary/30 px-2 py-0.5 text-[11px] font-bold uppercase text-foreground rounded-theme">
											{lvl}
										</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>
