<script lang="ts">
	import ResearchChatWidget from '$lib/components/widgets/ResearchChatWidget.svelte';
	import { DOCUMENT_METADATA_MAP } from '$lib/types/chat.js';

	let activeFilter = $state<string>('All');
	let chatWidget = $state<ResearchChatWidget | null>(null);

	const categories = ['All', 'Arsenals', 'Treaty', 'Emerging Tech', 'Strategy', 'Public Opinion'];

	const documentList = Object.entries(DOCUMENT_METADATA_MAP).map(([filename, info]) => ({
		filename,
		...info
	}));

	const filteredDocs = $derived(
		activeFilter === 'All'
			? documentList
			: documentList.filter((d) => d.category === activeFilter)
	);
</script>

<svelte:head>
	<title>AI Assistant | WeDon't Need Nukes</title>
	<meta
		name="description"
		content="Ask questions about nuclear disarmament, deterrence myths, treaties, and grassroots peace movement strategies."
	/>
</svelte:head>

<div class="min-h-screen bg-background text-foreground font-body py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto space-y-8">
		<!-- Page Header -->
		<header class="border-b-4 border-border pb-6 space-y-3">
			<div class="flex items-center gap-2">
				<a
					href="/"
					class="border-2 border-border bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all rounded-theme shadow-theme-sm"
				>
					← Home
				</a>
			</div>

			<h1 class="text-3xl sm:text-5xl font-black tracking-tight text-foreground font-display">
				AI Assistant
			</h1>
			<p class="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
				Explore questions about nuclear weapons, deterrence myths, international treaties, and how everyday people and grassroots movements can drive institutional change toward a nuclear-free world.
			</p>
		</header>

		<!-- Main 2-Column Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
			<!-- Left Column: Knowledge Base Browser & Filter (5 cols) -->
			<div class="lg:col-span-5 space-y-6">
				<!-- Knowledge Base Overview Card -->
				<div class="border-2 border-border bg-surface p-5 sm:p-6 rounded-theme shadow-theme-md space-y-4">
					<div class="flex items-center justify-between border-b-2 border-border/20 pb-3">
						<h2 class="font-display font-black text-lg uppercase tracking-wider text-foreground">
							Reference Documents
						</h2>
						<span class="border border-border bg-secondary px-2 py-0.5 text-xs font-black text-secondary-foreground font-mono">
							12 Documents
						</span>
					</div>

					<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						The assistant references authoritative treaties, arsenal reports, and peace research documents to provide grounded, factual answers.
					</p>

					<!-- Category Filter Chips -->
					<div class="flex flex-wrap gap-1.5 pt-1">
						{#each categories as cat}
							<button
								type="button"
								onclick={() => (activeFilter = cat)}
								class="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-theme border-2 border-border transition-all cursor-pointer {activeFilter === cat
									? 'bg-primary text-primary-foreground shadow-theme-primary'
									: 'bg-background text-foreground hover:bg-secondary hover:text-secondary-foreground'}"
							>
								{cat}
							</button>
						{/each}
					</div>

					<!-- Document Cards List -->
					<div class="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
						{#each filteredDocs as doc}
							<div
								class="border-2 border-border bg-background p-3 rounded-theme shadow-theme-sm space-y-1 hover:border-primary transition-colors"
							>
								<div class="flex items-center justify-between gap-2">
									<span class="inline-block border border-border bg-secondary px-1.5 py-0.2 text-[9px] font-black uppercase text-secondary-foreground">
										{doc.organization} · {doc.year}
									</span>
									<span class="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
										{doc.category}
									</span>
								</div>
								<h3 class="font-display font-extrabold text-xs sm:text-sm text-foreground">
									{doc.title}
								</h3>
								<p class="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
									{doc.description}
								</p>
							</div>
						{/each}
					</div>
				</div>

				<!-- Verification & Grounding Note -->
				<div
					class="border-2 border-border bg-secondary/20 p-4 rounded-theme shadow-theme-sm space-y-1.5"
				>
					<h4 class="font-display font-black text-xs uppercase tracking-wider text-foreground">
						🕊️ Movement Perspective &amp; Grounding
					</h4>
					<p class="text-xs text-muted-foreground leading-relaxed">
						The AI Assistant helps navigate the arguments against nuclear deterrence, explores community mobilization strategies, and provides evidence-backed answers from the disarmament research library.
					</p>
				</div>
			</div>

			<!-- Right Column: Interactive Research Chat Widget (7 cols) -->
			<div class="lg:col-span-7">
				<ResearchChatWidget compact={false} class="w-full" />
			</div>
		</div>
	</div>
</div>
