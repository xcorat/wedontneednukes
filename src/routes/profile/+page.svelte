<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data }: { data: PageData } = $props();

	let copied = $state(false);

	function copyPublicUrl() {
		if (typeof window === 'undefined') return;
		const url = `${window.location.origin}/profile/${data.user.id}`;
		navigator.clipboard.writeText(url).then(() => {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
</script>

<svelte:head>
	<title>My Profile · We Don't Need Nukes</title>
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
				<a
					href="/settings/profile"
					class="inline-flex items-center gap-1.5 border-2 border-border bg-primary px-3.5 py-1.5 text-xs font-black uppercase text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					<span>⚙️ Edit Profile</span>
				</a>
				<MenuButton />
			</div>
		</div>

		<!-- Profile Card -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
			<!-- Header Profile Info -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b-2 border-border pb-6">
				{#if data.profile?.image}
					<img
						src={data.profile.image}
						alt={data.profile.name}
						class="h-20 w-20 rounded-full border-2 border-border object-cover shadow-theme-sm"
					/>
				{:else}
					<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-secondary text-2xl font-black text-secondary-foreground shadow-theme-sm">
						{data.profile?.name ? data.profile.name[0]?.toUpperCase() : 'U'}
					</div>
				{/if}

				<div class="flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="text-2xl sm:text-3xl font-black text-foreground font-display">
							{data.profile?.displayName || data.profile?.name}
						</h1>
						{#if data.profile?.displayName}
							<span class="inline-flex items-center text-xs font-bold text-muted-foreground bg-border/10 px-2 py-0.5 rounded-theme">
								@{data.profile.name}
							</span>
						{/if}
					</div>

					<p class="mt-1 text-xs text-muted-foreground">
						Member since {data.profile?.memberSince ? new Date(data.profile.memberSince).toLocaleDateString() : 'recently'}
					</p>

					<!-- Share Public Link button -->
					<div class="mt-3 flex items-center gap-2">
						<button
							type="button"
							onclick={copyPublicUrl}
							class="inline-flex items-center gap-1.5 border-2 border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
						>
							<span>{copied ? '✓ Link Copied!' : '🔗 Copy Public Profile Link'}</span>
						</button>
						<a
							href={`/profile/${data.user.id}`}
							class="inline-flex items-center gap-1 text-xs font-bold text-foreground underline hover:text-primary"
						>
							<span>Preview Public View →</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Personal Info details with privacy tags -->
			<div class="mt-6 flex flex-col gap-4">
				<h2 class="text-sm font-black uppercase tracking-wider text-muted-foreground font-display">
					Personal Information &amp; Visibility
				</h2>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<!-- Display Name visibility -->
					<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm">
						<div class="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground font-display">
							<span>Display Name</span>
							<span class={data.profile?.privacyToggles?.isDisplayNamePublic ? 'text-success' : 'text-muted-foreground'}>
								{data.profile?.privacyToggles?.isDisplayNamePublic ? '🌐 Public' : '🔒 Private'}
							</span>
						</div>
						<p class="mt-1 text-sm font-bold text-foreground">
							{data.profile?.displayName || '—'}
						</p>
					</div>

					<!-- Location visibility -->
					<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm">
						<div class="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground font-display">
							<span>Location</span>
							<span class={data.profile?.privacyToggles?.isLocationPublic ? 'text-success' : 'text-muted-foreground'}>
								{data.profile?.privacyToggles?.isLocationPublic ? '🌐 Public' : '🔒 Private'}
							</span>
						</div>
						<p class="mt-1 text-sm font-bold text-foreground">
							{data.profile?.location || '—'}
						</p>
					</div>

					<!-- Website visibility -->
					<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm sm:col-span-2">
						<div class="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground font-display">
							<span>Website</span>
							<span class={data.profile?.privacyToggles?.isWebsitePublic ? 'text-success' : 'text-muted-foreground'}>
								{data.profile?.privacyToggles?.isWebsitePublic ? '🌐 Public' : '🔒 Private'}
							</span>
						</div>
						{#if data.profile?.website}
							<a
								href={data.profile.website}
								target="_blank"
								rel="noreferrer"
								class="mt-1 inline-block text-sm font-bold text-primary underline truncate max-w-full"
							>
								{data.profile.website} ↗
							</a>
						{:else}
							<p class="mt-1 text-sm font-bold text-foreground">—</p>
						{/if}
					</div>

					<!-- Bio visibility -->
					<div class="border-2 border-border bg-background p-3.5 rounded-theme shadow-theme-sm sm:col-span-2">
						<div class="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground font-display">
							<span>Bio</span>
							<span class={data.profile?.privacyToggles?.isBioPublic ? 'text-success' : 'text-muted-foreground'}>
								{data.profile?.privacyToggles?.isBioPublic ? '🌐 Public' : '🔒 Private'}
							</span>
						</div>
						<p class="mt-1 text-sm text-foreground leading-relaxed whitespace-pre-line">
							{data.profile?.bio || 'No bio added yet.'}
						</p>
					</div>
				</div>
			</div>

			<!-- Campaign Choices & Pledges -->
			<div class="mt-8 border-t-2 border-border pt-6">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-base font-black uppercase tracking-wider text-foreground font-display">
						Campaign Commitments
					</h2>
					<div class="inline-flex items-center gap-1 border-2 border-border px-2.5 py-0.5 text-xs font-bold rounded-theme shadow-theme-sm"
						class:bg-success={data.profile?.privacyToggles?.isPledgePublic}
						class:text-success-foreground={data.profile?.privacyToggles?.isPledgePublic}
						class:bg-background={!data.profile?.privacyToggles?.isPledgePublic}
						class:text-foreground={!data.profile?.privacyToggles?.isPledgePublic}
					>
						<span>{data.profile?.privacyToggles?.isPledgePublic ? '🌐 Public on profile' : '🔒 Private on profile'}</span>
					</div>
				</div>

				{#if data.profile?.pledges && data.profile.pledges.length > 0}
					<div class="flex flex-col gap-3">
						{#each data.profile.pledges as p}
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
				{:else}
					<div class="border-2 border-dashed border-border p-6 text-center rounded-theme">
						<p class="text-sm font-bold text-foreground">You haven't recorded a campaign pledge yet.</p>
						<a
							href="/#vote"
							class="mt-2 inline-block text-xs font-bold text-primary underline"
						>
							Take the pledge now →
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</main>
