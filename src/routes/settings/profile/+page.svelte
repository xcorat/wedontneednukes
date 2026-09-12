<script lang="ts">
	import type { ActionData, PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form field reactive states
	let name = $state('');
	let displayName = $state('');
	let isDisplayNamePublic = $state(false);
	let bio = $state('');
	let isBioPublic = $state(false);
	let location = $state('');
	let isLocationPublic = $state(false);
	let website = $state('');
	let isWebsitePublic = $state(false);
	let isPledgePublic = $state(false);

	$effect(() => {
		name = data.user.name ?? '';
		displayName = form?.profile?.displayName ?? data.profile?.displayName ?? '';
		isDisplayNamePublic = form?.profile?.isDisplayNamePublic ?? data.profile?.isDisplayNamePublic ?? false;
		bio = form?.profile?.bio ?? data.profile?.bio ?? '';
		isBioPublic = form?.profile?.isBioPublic ?? data.profile?.isBioPublic ?? false;
		location = form?.profile?.location ?? data.profile?.location ?? '';
		isLocationPublic = form?.profile?.isLocationPublic ?? data.profile?.isLocationPublic ?? false;
		website = form?.profile?.website ?? data.profile?.website ?? '';
		isWebsitePublic = form?.profile?.isWebsitePublic ?? data.profile?.isWebsitePublic ?? false;
		isPledgePublic = form?.profile?.isPledgePublic ?? data.profile?.isPledgePublic ?? false;
	});

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Profile Settings · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-start bg-background px-4 py-8 sm:py-12 text-foreground font-body">
	<div class="w-full max-w-2xl">
		<!-- Navigation header -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href="/profile"
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← My Profile
			</a>

			<div class="flex items-center gap-2">
				<a
					href={`/profile/${data.user.id}`}
					target="_blank"
					class="inline-flex items-center gap-1 border-2 border-border bg-secondary px-3 py-1.5 text-xs font-black uppercase text-secondary-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
				>
					<span>👁️ Public View</span>
					<span class="text-[10px]">↗</span>
				</a>
				<MenuButton />
			</div>
		</div>

		<!-- Settings Navigation Tabs -->
		<div class="mb-6 flex gap-2 border-b-2 border-border pb-2">
			<a
				href="/settings/profile"
				class="border-2 border-border bg-primary px-4 py-2 text-xs sm:text-sm font-black text-primary-foreground rounded-theme shadow-theme-primary font-display"
			>
				👤 Profile &amp; Privacy
			</a>
			<a
				href="/settings/account"
				class="border-2 border-border bg-surface px-4 py-2 text-xs sm:text-sm font-bold text-muted-foreground rounded-theme shadow-theme-sm transition-all hover:text-foreground font-display"
			>
				🔗 Connected Accounts
			</a>
		</div>

		<!-- Main Card -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
			<header class="mb-6 border-b-2 border-border pb-4">
				<h1 class="text-2xl sm:text-3xl font-black text-foreground leading-tight font-display">
					Profile &amp; Privacy Settings
				</h1>
				<p class="mt-1 text-sm text-muted-foreground font-medium">
					Control your personal information and choose what details are visible to other members.
				</p>
			</header>

			{#if form?.success}
				<div class="mb-6 flex items-center gap-2.5 border-2 border-success bg-success/15 px-4 py-3 text-sm font-bold text-success rounded-theme">
					<span class="text-lg">✓</span>
					<span>{form.message}</span>
				</div>
			{:else if form?.message}
				<div class="mb-6 flex items-center gap-2.5 border-2 border-primary bg-primary/15 px-4 py-3 text-sm font-bold text-primary rounded-theme">
					<span class="text-lg">⚠</span>
					<span>{form.message}</span>
				</div>
			{/if}

			<form
				method="POST"
				onsubmit={() => (isSubmitting = true)}
				class="flex flex-col gap-6"
			>
				<!-- Account Overview Strip -->
				<div class="flex items-center gap-3.5 border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
					{#if data.user.image}
						<img
							src={data.user.image}
							alt={data.user.name}
							class="h-12 w-12 rounded-full border-2 border-border object-cover"
						/>
					{:else}
						<div class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-primary/20 text-lg font-black text-foreground">
							{data.user.name ? data.user.name[0]?.toUpperCase() : 'U'}
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<p class="text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">
							Connected Account
						</p>
						<p class="text-sm font-bold text-foreground truncate">{data.user.email}</p>
					</div>
				</div>

				<!-- Section: Profile Info -->
				<div class="flex flex-col gap-5">
					<h2 class="text-base font-black uppercase tracking-wider text-foreground font-display">
						Personal Information
					</h2>

					<!-- Username (Always Public) -->
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between">
							<label for="name-input" class="text-xs font-bold uppercase tracking-wider text-foreground font-display">
								Username / Handle
							</label>
							<span class="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-border/10 px-2 py-0.5 rounded-theme">
								🌐 Always Public
							</span>
						</div>
						<input
							id="name-input"
							name="name"
							type="text"
							required
							maxlength="50"
							bind:value={name}
							placeholder="Your username"
							class="w-full border-2 border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm transition-colors focus:bg-background focus:outline-none"
						/>
						<p class="text-[11px] text-muted-foreground">This is your unique public identifier across the platform.</p>
					</div>

					<!-- Display Name & Toggle -->
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between">
							<label for="displayname-input" class="text-xs font-bold uppercase tracking-wider text-foreground font-display">
								Display Name
							</label>
							<label class="flex items-center gap-2 cursor-pointer select-none">
								<input
									type="checkbox"
									name="isDisplayNamePublic"
									bind:checked={isDisplayNamePublic}
									class="sr-only"
								/>
								<div
									class="flex items-center gap-1 border-2 border-border px-2.5 py-0.5 text-xs font-bold rounded-theme shadow-theme-sm transition-all"
									class:bg-success={isDisplayNamePublic}
									class:text-success-foreground={isDisplayNamePublic}
									class:bg-background={!isDisplayNamePublic}
									class:text-foreground={!isDisplayNamePublic}
								>
									<span>{isDisplayNamePublic ? '🌐 Public' : '🔒 Private'}</span>
								</div>
							</label>
						</div>
						<input
							id="displayname-input"
							name="displayName"
							type="text"
							maxlength="50"
							bind:value={displayName}
							placeholder="e.g. Jane Doe"
							class="w-full border-2 border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm transition-colors focus:bg-background focus:outline-none"
						/>
						<p class="text-[11px] text-muted-foreground">When public, this is displayed as your primary name.</p>
					</div>

					<!-- Bio & Toggle -->
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between">
							<label for="bio-input" class="text-xs font-bold uppercase tracking-wider text-foreground font-display">
								Bio
							</label>
							<label class="flex items-center gap-2 cursor-pointer select-none">
								<input
									type="checkbox"
									name="isBioPublic"
									bind:checked={isBioPublic}
									class="sr-only"
								/>
								<div
									class="flex items-center gap-1 border-2 border-border px-2.5 py-0.5 text-xs font-bold rounded-theme shadow-theme-sm transition-all"
									class:bg-success={isBioPublic}
									class:text-success-foreground={isBioPublic}
									class:bg-background={!isBioPublic}
									class:text-foreground={!isBioPublic}
								>
									<span>{isBioPublic ? '🌐 Public' : '🔒 Private'}</span>
								</div>
							</label>
						</div>
						<textarea
							id="bio-input"
							name="bio"
							rows="3"
							maxlength="500"
							bind:value={bio}
							placeholder="Tell others why nuclear disarmament matters to you..."
							class="w-full border-2 border-border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm transition-colors focus:bg-background focus:outline-none resize-none"
						></textarea>
						<div class="flex justify-end">
							<span class="text-[10px] font-mono text-muted-foreground">{bio.length}/500</span>
						</div>
					</div>

					<!-- Location & Toggle -->
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between">
							<label for="location-input" class="text-xs font-bold uppercase tracking-wider text-foreground font-display">
								Location
							</label>
							<label class="flex items-center gap-2 cursor-pointer select-none">
								<input
									type="checkbox"
									name="isLocationPublic"
									bind:checked={isLocationPublic}
									class="sr-only"
								/>
								<div
									class="flex items-center gap-1 border-2 border-border px-2.5 py-0.5 text-xs font-bold rounded-theme shadow-theme-sm transition-all"
									class:bg-success={isLocationPublic}
									class:text-success-foreground={isLocationPublic}
									class:bg-background={!isLocationPublic}
									class:text-foreground={!isLocationPublic}
								>
									<span>{isLocationPublic ? '🌐 Public' : '🔒 Private'}</span>
								</div>
							</label>
						</div>
						<input
							id="location-input"
							name="location"
							type="text"
							maxlength="100"
							bind:value={location}
							placeholder="e.g. Berlin, Germany"
							class="w-full border-2 border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm transition-colors focus:bg-background focus:outline-none"
						/>
					</div>

					<!-- Website & Toggle -->
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between">
							<label for="website-input" class="text-xs font-bold uppercase tracking-wider text-foreground font-display">
								Website / Link
							</label>
							<label class="flex items-center gap-2 cursor-pointer select-none">
								<input
									type="checkbox"
									name="isWebsitePublic"
									bind:checked={isWebsitePublic}
									class="sr-only"
								/>
								<div
									class="flex items-center gap-1 border-2 border-border px-2.5 py-0.5 text-xs font-bold rounded-theme shadow-theme-sm transition-all"
									class:bg-success={isWebsitePublic}
									class:text-success-foreground={isWebsitePublic}
									class:bg-background={!isWebsitePublic}
									class:text-foreground={!isWebsitePublic}
								>
									<span>{isWebsitePublic ? '🌐 Public' : '🔒 Private'}</span>
								</div>
							</label>
						</div>
						<input
							id="website-input"
							name="website"
							type="text"
							maxlength="200"
							bind:value={website}
							placeholder="https://yourwebsite.org"
							class="w-full border-2 border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground rounded-theme shadow-theme-sm transition-colors focus:bg-background focus:outline-none"
						/>
					</div>
				</div>

				<!-- Section: Campaign & Pledge Privacy -->
				<div class="mt-2 border-t-2 border-border pt-5">
					<h2 class="mb-3 text-base font-black uppercase tracking-wider text-foreground font-display">
						Campaign Activity &amp; Pledges
					</h2>

					<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
						<label class="flex items-start justify-between gap-4 cursor-pointer">
							<div class="space-y-1">
								<span class="text-sm font-bold text-foreground">
									Display pledges on public profile
								</span>
								<p class="text-xs text-muted-foreground leading-relaxed">
									When enabled, your campaign choices (e.g. Nuclear Disarmament) and commitment levels will be visible to others visiting your profile.
								</p>
							</div>

							<div class="pt-0.5">
								<input
									type="checkbox"
									name="isPledgePublic"
									bind:checked={isPledgePublic}
									class="sr-only"
								/>
								<div
									class="flex items-center gap-1 border-2 border-border px-3 py-1 text-xs font-bold rounded-theme shadow-theme-sm transition-all"
									class:bg-success={isPledgePublic}
									class:text-success-foreground={isPledgePublic}
									class:bg-surface={!isPledgePublic}
									class:text-foreground={!isPledgePublic}
								>
									<span>{isPledgePublic ? '🌐 Public' : '🔒 Private'}</span>
								</div>
							</div>
						</label>
					</div>
				</div>

				<!-- Save Button -->
				<button
					type="submit"
					disabled={isSubmitting}
					class="mt-2 flex w-full items-center justify-center gap-2 border-2 border-border bg-primary px-6 py-3.5 text-base font-black text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 cursor-pointer"
				>
					{#if isSubmitting}
						<svg class="h-5 w-5 animate-spin text-primary-foreground" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
						</svg>
						<span>Saving Changes...</span>
					{:else}
						<span>Save Profile &amp; Privacy Settings →</span>
					{/if}
				</button>
			</form>
		</div>
	</div>
</main>
