<script lang="ts">
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const answeredNo = $derived(data.answer === 'no');
	const greeting = $derived(
		data.user ? `Welcome, ${data.user.name ?? 'friend'}!` : 'Welcome, anonymous friend!'
	);
</script>

<svelte:head>
	<title>Pledge · WeDoNotNeedNukes</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center px-6 py-16 text-center">
	<span class="mb-6 text-5xl">{answeredNo ? '🕊️' : '🤔'}</span>

	<h1 class="mb-3 text-3xl font-black text-white sm:text-4xl">{greeting}</h1>

	<p class="mb-2 text-base text-zinc-400">
		You said: <strong class="text-white">{answeredNo ? 'No, we don\'t need nukes' : 'Yes, we need nukes'}</strong>
	</p>

	<div class="mt-10 max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left">
		<p class="text-xs font-semibold tracking-widest text-zinc-500 uppercase">Coming soon</p>
		<h2 class="mt-2 text-lg font-bold text-white">The pledge flow</h2>
		<p class="mt-2 text-sm leading-relaxed text-zinc-400">
			The full branching pledge flow is in progress. You'll be able to deepen your commitment,
			share resources, and take action — all in a few steps.
		</p>
	</div>

	<a
		href="/"
		class="mt-8 text-sm text-zinc-600 transition-colors hover:text-zinc-400"
	>
		← Back to start
	</a>
</main>
