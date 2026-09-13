<script lang="ts">
	import MenuButton from '$lib/components/MenuButton.svelte';
</script>

<svelte:head>
	<title>Why? · We Don't Need Nukes</title>
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

		<h1 class="mb-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-display">
			Why "We Don't Need Nukes"?
		</h1>

		<div class="space-y-4 text-base sm:text-lg leading-relaxed text-foreground">
			<div class="border-2 border-border bg-surface p-5 rounded-theme shadow-theme-sm">
				<h2 class="text-xl font-bold text-primary mb-2 font-display">12,000+ Warheads</h2>
				<p>9 nations possess over 12,000 nuclear weapons. An accidental launch, miscalculation, or escalation risks human civilization.</p>
			</div>

			<div class="border-2 border-border bg-surface p-5 rounded-theme shadow-theme-sm">
				<h2 class="text-xl font-bold text-secondary mb-2 font-display">Consensus Before Politics</h2>
				<p>Complex treaties and negotiations stall. But agreeing on the fundamental truth that humanity does not need tools of total mutual destruction is where real change starts.</p>
			</div>

			<div class="border-2 border-border bg-surface p-5 rounded-theme shadow-theme-sm">
				<h2 class="text-xl font-bold text-success mb-2 font-display">Your Voice Shapes The Movement</h2>
				<p>Whether you fully agree or have reservations, every voice helps measure global consensus and guide grassroots action.</p>
			</div>
		</div>

		<div class="mt-8 flex justify-center">
			<a
				href="/"
				class="inline-flex border-[3px] border-border bg-primary px-8 py-3 text-xl font-bold text-primary-foreground rounded-theme shadow-theme-primary font-display transition-all hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[3px] active:shadow-none"
			>
				Make Your Choice
			</a>
		</div>
	</div>
</main>
