<script lang="ts">
	import { page } from '$app/state';
	import FundraiserButton from '$lib/components/FundraiserButton.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';

	let { children } = $props();

	const currentPath = $derived(page.url.pathname);

	const links = [
		{ href: '/tests/ui-forms', label: 'Overview' },
		{ href: '/tests/ui-forms/compact', label: '1. Compact' },
		{ href: '/tests/ui-forms/rounded-game', label: '2. Rounded 2D' },
		{ href: '/tests/ui-forms/flat-minimal', label: '3. Flat Minimal' },
		{ href: '/tests/ui-forms/inline-card', label: '4. Unified Single-Card' }
	];
</script>

<div class="min-h-screen bg-[#FFFDE7] text-[#212121] font-['Poppins',sans-serif]">
	<!-- Top Sticky Bar for Style Switcher -->
	<header class="sticky top-8 z-40 border-b-2 border-[#212121] bg-white px-3 py-2 shadow-[0_2px_0_#212121]">
		<div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
			<!-- Title & Fundraiser Showcase -->
			<div class="flex items-center gap-2">
				<a
					href="/"
					class="border border-[#212121] bg-[#FFFDE7] px-2 py-1 text-xs font-bold hover:bg-[#FFD600]"
				>
					← Home
				</a>
				<span class="text-xs font-black uppercase tracking-wider text-[#E53935]">
					UI Style Lab:
				</span>
				<FundraiserButton variant="icon" class="!h-7 !w-7 !text-xs !shadow-[1px_1px_0_#212121]" />
			</div>

			<!-- Style Switcher Navigation Links -->
			<nav class="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs font-bold">
				{#each links as link}
					{@const isActive = currentPath === link.href || (link.href !== '/tests/ui-forms' && currentPath.startsWith(link.href))}
					<a
						href={link.href}
						class="border-2 border-[#212121] px-2.5 py-1 transition-all {isActive
							? 'bg-[#E53935] text-[#FFFDE7] shadow-[2px_2px_0_#B71C1C]'
							: 'bg-white text-[#212121] shadow-[1.5px_1.5px_0_#212121] hover:bg-[#FFFDE7]'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<!-- Quick Menu Drawer -->
			<div class="hidden sm:flex items-center">
				<MenuButton class="!h-8 !w-8 !shadow-[1.5px_1.5px_0_#212121]" />
			</div>
		</div>
	</header>

	<!-- Page Content -->
	{@render children()}
</div>
