<script lang="ts">
	import type { PageData } from './$types.js';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');
</script>

<svelte:head>
	<title>Results · We Don't Need Nukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center bg-background px-4 py-12 text-foreground font-body">
	<div class="w-full max-w-lg">
		<!-- Navigation bar -->
		<div class="mb-6 flex items-center justify-between gap-3">
			<a
				href={`/pledge?answer=${data.answer}${data.isAnon ? '&anon=1' : ''}`}
				class="inline-flex items-center gap-1.5 border-2 border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-foreground rounded-theme shadow-theme-sm font-display transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none"
			>
				← Edit pledge
			</a>

			<div class="flex items-center gap-2 sm:gap-3">
				<FundraiserButton variant="icon" />
				<MenuButton />
			</div>
		</div>

		<!-- Main Results Card -->
		<div class="border-2 sm:border-[3px] border-border bg-surface p-6 sm:p-8 rounded-theme shadow-theme-md">
			<!-- Confirmed vote banner -->
			<div class="mb-5 inline-flex items-center gap-2 border-2 border-border bg-background px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-theme shadow-theme-sm">
				<span>{answeredNo ? '🕊️' : '🤔'}</span>
				<span>
					Your choice: <strong>{answeredNo ? "Agree (We don't need nukes)" : 'We do | Not sure'}</strong>
				</span>
			</div>

			<!-- Results Bars -->
			<div class="space-y-4">
				<!-- Agree Bar -->
				<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
					<div class="mb-2 flex items-center justify-between text-sm font-bold">
						<span class="flex items-center gap-1.5">
							<span>We don't need nukes</span>
							{#if answeredNo}
								<span class="border border-border bg-primary px-1.5 py-0.2 text-[10px] font-black uppercase text-primary-foreground rounded-theme">
									You
								</span>
							{/if}
						</span>
						<span class="text-base font-black text-primary">{data.stats.agreePercentage}%</span>
					</div>

					<!-- Progress Bar Track -->
					<div class="h-4 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme">
						<div
							class="h-full bg-primary transition-all duration-700 rounded-theme"
							style="width: {data.stats.agreePercentage}%"
						></div>
					</div>

					<p class="mt-1.5 text-right text-xs text-muted-foreground font-medium">
						{data.stats.agreeCount.toLocaleString()} votes
					</p>
				</div>

				<!-- Other Bar -->
				<div class="border-2 border-border bg-background p-4 rounded-theme shadow-theme-sm">
					<div class="mb-2 flex items-center justify-between text-sm font-bold">
						<span class="flex items-center gap-1.5">
							<span>We do | Not sure</span>
							{#if !answeredNo}
								<span class="border border-border bg-secondary px-1.5 py-0.2 text-[10px] font-black uppercase text-secondary-foreground rounded-theme">
									You
								</span>
							{/if}
						</span>
						<span class="text-base font-black text-secondary">{data.stats.otherPercentage}%</span>
					</div>

					<!-- Progress Bar Track -->
					<div class="h-4 w-full border-2 border-border bg-surface overflow-hidden p-0.5 rounded-theme">
						<div
							class="h-full bg-secondary transition-all duration-700 rounded-theme"
							style="width: {data.stats.otherPercentage}%"
						></div>
					</div>

					<p class="mt-1.5 text-right text-xs text-muted-foreground font-medium">
						{data.stats.otherCount.toLocaleString()} votes
					</p>
				</div>
			</div>
		</div>

		<!-- Footnote -->
		<p class="mt-6 text-center text-xs text-muted-foreground font-medium">
			Responses are verified and protected against automated manipulation.
		</p>
	</div>
</main>
