<script lang="ts">
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
</script>

<svelte:head>
	<title>UI Forms Style Test Suite · We Don't Need Nukes</title>
</svelte:head>

<main class="mx-auto max-w-4xl px-4 py-8 font-body">
	<!-- Hero Header -->
	<div class="mb-6 border-3 border-border bg-surface p-6 rounded-theme shadow-theme-md">
		<div class="mb-2 inline-block border border-border bg-secondary px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-secondary-foreground rounded-theme">
			Design Experiments
		</div>
		<h1 class="text-3xl sm:text-4xl font-black text-foreground font-display">
			Results / Form Page UI Styles
		</h1>
		<p class="mt-2 text-sm text-muted-foreground leading-relaxed">
			Addressing design treatments: whitespace density, border radiuses, and shadow styles.
			Test different system themes below to see them live across all application views.
		</p>

		<!-- Quick Directory of Routes -->
		<div class="mt-4 border-t-2 border-border/20 pt-4">
			<div class="mb-2 text-xs font-black uppercase tracking-wider text-foreground font-display">
				Style Benchmark Routes:
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
				<a
					href="/tests/ui-forms/compact"
					class="flex items-center justify-between border-2 border-border bg-background px-3 py-2 font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground"
				>
					<span>1. Compact &amp; Tight</span>
					<code class="text-[10px] text-muted-foreground font-mono">/compact →</code>
				</a>

				<a
					href="/tests/ui-forms/rounded-game"
					class="flex items-center justify-between border-2 border-border bg-background px-3 py-2 font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground"
				>
					<span>2. Rounded 2D Cartoon</span>
					<code class="text-[10px] text-muted-foreground font-mono">/rounded-game →</code>
				</a>

				<a
					href="/tests/ui-forms/flat-minimal"
					class="flex items-center justify-between border-2 border-border bg-background px-3 py-2 font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground"
				>
					<span>3. Clean Flat Minimal</span>
					<code class="text-[10px] text-muted-foreground font-mono">/flat-minimal →</code>
				</a>

				<a
					href="/tests/ui-forms/inline-card"
					class="flex items-center justify-between border-2 border-border bg-background px-3 py-2 font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground"
				>
					<span>4. Unified Single-Card</span>
					<code class="text-[10px] text-muted-foreground font-mono">/inline-card →</code>
				</a>
			</div>
		</div>
	</div>

	<!-- Live Theme Switcher Showcase -->
	<div class="mb-8 border-2 border-border bg-surface p-6 rounded-theme shadow-theme-sm">
		<ThemeSwitcher />
	</div>

	<!-- Fundraiser Button Variations Showcase -->
	<section class="mb-8 border-2 border-[#212121] bg-white p-6 shadow-[3px_3px_0_#212121]">
		<div class="mb-1 flex items-center justify-between">
			<h2 class="text-lg font-black text-[#212121]">1. Fundraiser Button Component Variants</h2>
			<span class="text-xs font-bold text-[#E53935] uppercase tracking-wider">New Component</span>
		</div>
		<p class="mb-4 text-xs text-[#757575]">
			Extracted into <code class="bg-[#FFFDE7] px-1 py-0.5 border border-[#212121]/30 font-mono text-[#212121]">src/lib/components/FundraiserButton.svelte</code> with cartoon font and unicode styling options.
		</p>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			<!-- Icon-only (Yellow heart button, matching MenuButton) -->
			<div class="border border-[#212121] bg-[#FFFDE7] p-3">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-bold text-[#212121]">Just Yellow Heart (Icon)</span>
					<span class="text-[10px] uppercase font-mono text-zinc-500">variant="icon"</span>
				</div>
				<div class="flex items-center gap-2">
					<FundraiserButton variant="icon" />
					<span class="text-xs text-zinc-600">Matches MenuButton 10x10 square</span>
				</div>
			</div>

			<!-- Cartoonish Font (Fredoka) -->
			<div class="border border-[#212121] bg-[#FFFDE7] p-3">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-bold text-[#212121]">Cartoonish Font (Fredoka)</span>
					<span class="text-[10px] uppercase font-mono text-zinc-500">variant="cartoon"</span>
				</div>
				<div class="flex items-center gap-2">
					<FundraiserButton variant="cartoon" />
				</div>
			</div>

			<!-- Unicode Math Sans Bold -->
			<div class="border border-[#212121] bg-[#FFFDE7] p-3">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-bold text-[#212121]">Unicode Bold Sans</span>
					<span class="text-[10px] uppercase font-mono text-zinc-500">variant="unicode"</span>
				</div>
				<div class="flex items-center gap-2">
					<FundraiserButton variant="unicode" />
				</div>
			</div>

			<!-- Playful Rounded Pill -->
			<div class="border border-[#212121] bg-[#FFFDE7] p-3">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-bold text-[#212121]">Playful 2D Pill</span>
					<span class="text-[10px] uppercase font-mono text-zinc-500">variant="pill"</span>
				</div>
				<div class="flex items-center gap-2">
					<FundraiserButton variant="pill" />
				</div>
			</div>

			<!-- Compact Badge -->
			<div class="border border-[#212121] bg-[#FFFDE7] p-3">
				<div class="flex items-center justify-between mb-2">
					<span class="text-xs font-bold text-[#212121]">Compact Badge</span>
					<span class="text-[10px] uppercase font-mono text-zinc-500">variant="compact"</span>
				</div>
				<div class="flex items-center gap-2">
					<FundraiserButton variant="compact" />
				</div>
			</div>
		</div>
	</section>

	<!-- Style Cards Section -->
	<section class="mb-10">
		<h2 class="mb-4 text-xl font-black text-[#212121]">2. Result / Form Page Style Explorations</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Option 1: Compact Neo-Brutalist -->
			<div class="flex flex-col border-2 border-[#212121] bg-white p-5 shadow-[3px_3px_0_#212121]">
				<div class="flex items-center justify-between">
					<span class="border border-[#212121] bg-[#E53935] px-2 py-0.5 text-xs font-black uppercase text-white">
						Style 1
					</span>
					<span class="text-xs font-bold text-[#757575]">Zero Waste</span>
				</div>
				<h3 class="mt-2 text-lg font-black text-[#212121]">Ultra-Compact &amp; Tight</h3>
				<p class="mt-1 text-xs text-[#757575] leading-relaxed">
					Replaces nested p-8 and p-5 padding with snug p-4 padding. Shrinks heavy shadows from 4px/6px down to crisp 2px. Uses a responsive 2-column input grid for Name &amp; Phone. Fits easily in mobile view without scrolling.
				</p>
				<ul class="my-3 space-y-1 text-xs text-[#212121]">
					<li>✓ Padding reduced by ~50%</li>
					<li>✓ Sharp 2px offset drop shadow</li>
					<li>✓ Side-by-side inputs on tablet/desktop</li>
					<li>✓ Compact action button</li>
				</ul>
				<div class="mt-auto pt-3">
					<a
						href="/tests/ui-forms/compact"
						class="flex w-full items-center justify-center gap-2 border-2 border-[#212121] bg-[#FFD600] py-2 text-xs font-black uppercase tracking-wider text-[#212121] shadow-[2px_2px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#212121] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
					>
						<span>Open Style 1 Full Page</span>
						<span>→</span>
					</a>
				</div>
			</div>

			<!-- Option 2: Rounded 2D Cartoon Game -->
			<div class="flex flex-col border-2 border-[#212121] bg-white p-5 shadow-[3px_3px_0_#212121]">
				<div class="flex items-center justify-between">
					<span class="border border-[#212121] bg-[#43A047] px-2 py-0.5 text-xs font-black uppercase text-white">
						Style 2
					</span>
					<span class="text-xs font-bold text-[#757575]">Design Doc Aesthetic</span>
				</div>
				<h3 class="mt-2 text-lg font-black text-[#212121] font-['Fredoka',sans-serif]">Rounded 2D Game</h3>
				<p class="mt-1 text-xs text-[#757575] leading-relaxed">
					Implements the vision from <code class="text-xs">design-system.md</code>: rounded pill borders (<code class="text-[11px]">rounded-2xl</code>), <code class="text-[11px]">Fredoka</code> display font, and 2D platformer-style vertical drop shadows (<code class="text-[11px]">shadow-[0_4px_0_#212121]</code>).
				</p>
				<ul class="my-3 space-y-1 text-xs text-[#212121]">
					<li>✓ Rounded 16px friendly curves</li>
					<li>✓ Fredoka rounded cartoon headers</li>
					<li>✓ Flat bottom drop shadow (0 4px)</li>
					<li>✓ Cheerful game-like button press</li>
				</ul>
				<div class="mt-auto pt-3">
					<a
						href="/tests/ui-forms/rounded-game"
						class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#212121] bg-[#43A047] py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_3px_0_#212121] transition-all hover:translate-y-[1px] hover:shadow-[0_2px_0_#212121] active:translate-y-[2px] active:shadow-none font-['Fredoka',sans-serif]"
					>
						<span>Open Style 2 Full Page</span>
						<span>→</span>
					</a>
				</div>
			</div>

			<!-- Option 3: Clean Flat Minimal -->
			<div class="flex flex-col border-2 border-[#212121] bg-white p-5 shadow-[3px_3px_0_#212121]">
				<div class="flex items-center justify-between">
					<span class="border border-[#212121] bg-[#212121] px-2 py-0.5 text-xs font-black uppercase text-white">
						Style 3
					</span>
					<span class="text-xs font-bold text-[#757575]">No Shadow Inception</span>
				</div>
				<h3 class="mt-2 text-lg font-black text-[#212121]">Clean Flat Minimal</h3>
				<p class="mt-1 text-xs text-[#757575] leading-relaxed">
					Removes the heavy offset drop shadows entirely. Uses sharp 1.5px and 2px borders with crisp line dividers, clean focus states, and warm background tinting without visual heaviness.
				</p>
				<ul class="my-3 space-y-1 text-xs text-[#212121]">
					<li>✓ Zero heavy offset drop shadows</li>
					<li>✓ Crisp, clean 1.5px borders</li>
					<li>✓ Modern flat inputs with clear focus ring</li>
					<li>✓ Clean and fast visual scan</li>
				</ul>
				<div class="mt-auto pt-3">
					<a
						href="/tests/ui-forms/flat-minimal"
						class="flex w-full items-center justify-center gap-2 border-2 border-[#212121] bg-[#FFFDE7] py-2 text-xs font-black uppercase tracking-wider text-[#212121] transition-all hover:bg-[#FFD600] active:translate-y-[1px]"
					>
						<span>Open Style 3 Full Page</span>
						<span>→</span>
					</a>
				</div>
			</div>

			<!-- Option 4: Unified Single-Card -->
			<div class="flex flex-col border-2 border-[#212121] bg-white p-5 shadow-[3px_3px_0_#212121]">
				<div class="flex items-center justify-between">
					<span class="border border-[#212121] bg-[#FFD600] px-2 py-0.5 text-xs font-black uppercase text-[#212121]">
						Style 4
					</span>
					<span class="text-xs font-bold text-[#757575]">Single Container</span>
				</div>
				<h3 class="mt-2 text-lg font-black text-[#212121]">Unified Single-Card</h3>
				<p class="mt-1 text-xs text-[#757575] leading-relaxed">
					Avoids card-inside-card syndrome. The entire result and feedback form live inside a single cohesive card. Results and feedback are separated by clean border dividers instead of nested shadow boxes.
				</p>
				<ul class="my-3 space-y-1 text-xs text-[#212121]">
					<li>✓ One single outer shadow</li>
					<li>✓ Seamless divided sections</li>
					<li>✓ Compact collapsible feedback section</li>
					<li>✓ Maximizes usable space</li>
				</ul>
				<div class="mt-auto pt-3">
					<a
						href="/tests/ui-forms/inline-card"
						class="flex w-full items-center justify-center gap-2 border-2 border-[#212121] bg-[#E53935] py-2 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0_#B71C1C] transition-all hover:translate-y-[1px] hover:shadow-[1px_1px_0_#B71C1C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
					>
						<span>Open Style 4 Full Page</span>
						<span>→</span>
					</a>
				</div>
			</div>
		</div>
	</section>
</main>
