<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { renderMarkdown } from '$lib/utils/wiki-render.js';
	import {
		type ChatMessage,
		getFriendlyDocumentInfo
	} from '$lib/types/chat.js';
	import type { CitationItem } from '$lib/server/ai/openai.js';

	interface Props {
		compact?: boolean;
		initialPrompt?: string;
		class?: string;
		onClose?: () => void;
		showFullViewLink?: boolean;
	}

	let {
		compact = false,
		initialPrompt = '',
		class: className = '',
		onClose,
		showFullViewLink = false
	}: Props = $props();

	let messages = $state<ChatMessage[]>([]);
	let inputMessage = $state(untrack(() => initialPrompt));
	let isGenerating = $state(false);
	let chatContainer = $state<HTMLDivElement | null>(null);
	let abortController = $state<AbortController | null>(null);
	let activeCitation = $state<CitationItem | null>(null);
	let copiedId = $state<string | null>(null);

	const starterPrompts = [
		'Why is nuclear deterrence a misleading and dangerous narrative?',
		'How can grassroots mass movements and everyday people abolish nuclear weapons?',
		'What does the Treaty on the Prohibition of Nuclear Weapons (TPNW) require?',
		'How do emerging technologies and AI increase nuclear crisis risks?'
	];

	async function scrollToBottom(force = false) {
		await tick();
		if (!chatContainer) return;
		const isNearBottom =
			chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120;
		if (force || isNearBottom) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	function stopGeneration() {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
		isGenerating = false;
	}

	function clearConversation() {
		stopGeneration();
		messages = [];
		activeCitation = null;
	}

	async function copyMessage(msg: ChatMessage) {
		try {
			await navigator.clipboard.writeText(msg.content);
			copiedId = msg.id;
			setTimeout(() => {
				if (copiedId === msg.id) copiedId = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text:', err);
		}
	}

	async function sendPrompt(promptText: string) {
		if (isGenerating || !promptText.trim()) return;

		const userQuery = promptText.trim();
		inputMessage = '';

		const userMessageId = 'u-' + Date.now();
		const assistantMessageId = 'a-' + (Date.now() + 1);

		messages = [
			...messages,
			{
				id: userMessageId,
				role: 'user',
				content: userQuery,
				createdAt: new Date()
			},
			{
				id: assistantMessageId,
				role: 'assistant',
				content: '',
				createdAt: new Date(),
				isStreaming: true,
				citations: []
			}
		];

		isGenerating = true;
		abortController = new AbortController();
		scrollToBottom(true);

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'text/event-stream'
				},
				body: JSON.stringify({
					message: userQuery,
					stream: true
				}),
				signal: abortController.signal
			});

			if (!res.ok) {
				const errData = (await res.json().catch(() => ({ error: `Server error (${res.status})` }))) as {
					error?: string;
				};
				throw new Error(errData?.error || `HTTP ${res.status}`);
			}

			if (!res.body) {
				throw new Error('ReadableStream not supported by browser');
			}

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed || !trimmed.startsWith('data:')) continue;

					const dataStr = trimmed.slice(5).trim();
					if (!dataStr) continue;

					try {
						const parsed = JSON.parse(dataStr);

						if (parsed.delta) {
							messages = messages.map((m) =>
								m.id === assistantMessageId ? { ...m, content: m.content + parsed.delta } : m
							);
							scrollToBottom();
						}

						if (parsed.done) {
							messages = messages.map((m) =>
								m.id === assistantMessageId
									? {
											...m,
											isStreaming: false,
											citations: parsed.citations || []
										}
									: m
							);
						}

						if (parsed.error) {
							messages = messages.map((m) =>
								m.id === assistantMessageId
									? {
											...m,
											isStreaming: false,
											error: parsed.error
										}
									: m
							);
						}
					} catch {
						// Ignored for non-JSON lines
					}
				}
			}
		} catch (err: any) {
			if (err.name === 'AbortError') {
				messages = messages.map((m) =>
					m.id === assistantMessageId ? { ...m, isStreaming: false } : m
				);
			} else {
				console.error('Chat error:', err);
				messages = messages.map((m) =>
					m.id === assistantMessageId
						? {
								...m,
								isStreaming: false,
								error: err?.message || 'Failed to retrieve response from research library.'
							}
						: m
				);
			}
		} finally {
			isGenerating = false;
			abortController = null;
			scrollToBottom(true);
		}
	}

	function handleSubmit() {
		sendPrompt(inputMessage);
	}
</script>

<div
	class="flex flex-col border-2 border-border bg-surface text-foreground rounded-theme shadow-theme-md overflow-hidden font-body {className}"
	style="height: {compact ? '560px' : '680px'}; max-height: 85vh;"
>
	<!-- Chat Header -->
	<header
		class="flex shrink-0 items-center justify-between border-b-2 border-border bg-background px-4 py-3 select-none"
	>
		<div class="flex items-center gap-2">
			<span class="text-base sm:text-lg">🤖</span>
			<h3 class="font-display font-black text-sm sm:text-base uppercase tracking-wider text-foreground">
				AI Assistant
			</h3>
		</div>

		<div class="flex items-center gap-2">
			{#if showFullViewLink}
				<a
					href="/assistant"
					onclick={() => onClose?.()}
					title="Open full page assistant"
					class="border-2 border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground hover:bg-secondary hover:text-secondary-foreground rounded-theme shadow-theme-sm transition-all"
				>
					Full View ↗
				</a>
			{/if}

			{#if messages.length > 0}
				<button
					type="button"
					onclick={clearConversation}
					title="Clear conversation"
					class="inline-flex h-8 items-center gap-1 border-2 border-border bg-surface px-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-background rounded-theme shadow-theme-sm transition-all active:translate-y-[1px] cursor-pointer"
				>
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					<span class="hidden sm:inline">Reset</span>
				</button>
			{/if}

			{#if onClose}
				<button
					type="button"
					onclick={onClose}
					aria-label="Close assistant"
					class="inline-flex h-8 w-8 items-center justify-center border-2 border-border bg-surface text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</header>

	<!-- Message Feed Area -->
	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-background/50"
		role="log"
		aria-live="polite"
	>
		{#if messages.length === 0}
			<!-- Empty State / Starter Suggestions -->
			<div class="flex flex-col items-center justify-center py-6 text-center space-y-4">
				<div
					class="flex h-12 w-12 items-center justify-center border-2 border-border bg-primary/20 text-2xl rounded-theme shadow-theme-sm"
				>
					🕊️
				</div>
				<div class="max-w-md space-y-1 px-4">
					<h4 class="font-display font-black text-lg text-foreground">
						Nuclear Disarmament &amp; Peace Strategy
					</h4>
					<p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						Ask questions about nuclear weapons, deterrence myths, disarmament treaties, and pathways for grassroots movements to build a nuclear-free future.
					</p>
				</div>

				<div class="w-full max-w-lg pt-2 space-y-2 text-left">
					<p class="text-xs font-black uppercase tracking-wider text-muted-foreground font-display px-1">
						Suggested Inquiries:
					</p>
					<div class="grid grid-cols-1 gap-2">
						{#each starterPrompts as prompt}
							<button
								type="button"
								onclick={() => sendPrompt(prompt)}
								class="w-full text-left border-2 border-border bg-surface hover:bg-secondary hover:text-secondary-foreground p-2.5 text-xs sm:text-sm font-bold text-foreground rounded-theme shadow-theme-sm transition-all hover:translate-y-[1px] cursor-pointer"
							>
								💡 {prompt}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			{#each messages as msg (msg.id)}
				{#if msg.role === 'user'}
					<!-- User Message -->
					<div class="flex justify-end">
						<div
							class="max-w-[88%] sm:max-w-[78%] border-2 border-border bg-primary text-primary-foreground p-3.5 rounded-theme shadow-theme-primary"
						>
							<p class="text-xs sm:text-sm font-bold whitespace-pre-wrap leading-relaxed">
								{msg.content}
							</p>
							<span class="block text-[10px] text-primary-foreground/75 text-right mt-1 font-mono">
								{msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>
					</div>
				{:else}
					<!-- Assistant Message -->
					<div class="flex flex-col gap-2 max-w-[95%] sm:max-w-[88%]">
						<div
							class="border-2 border-border bg-surface p-4 sm:p-5 rounded-theme shadow-theme-sm space-y-3"
						>
							<!-- Header of message -->
							<div class="flex items-center justify-between border-b border-border/20 pb-2">
								<div class="flex items-center gap-1.5">
									<span class="text-xs">🤖</span>
									<span class="text-xs font-black uppercase tracking-wider font-display text-foreground">
										AI Assistant
									</span>
									{#if msg.isStreaming}
										<span class="flex h-2 w-2 relative">
											<span
												class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
											></span>
											<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
										</span>
									{/if}
								</div>

								{#if msg.content}
									<button
										type="button"
										onclick={() => copyMessage(msg)}
										title="Copy response"
										class="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
									>
										{#if copiedId === msg.id}
											<span class="text-success font-black">✓ Copied</span>
										{:else}
											<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
												/>
											</svg>
											<span>Copy</span>
										{/if}
									</button>
								{/if}
							</div>

							<!-- Body -->
							{#if msg.content}
								<div class="wiki-prose text-xs sm:text-sm">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html renderMarkdown(msg.content)}
								</div>
							{:else if msg.isStreaming}
								<div class="flex items-center gap-2 py-2 text-xs font-bold text-muted-foreground">
									<span class="animate-pulse">Searching research library &amp; generating grounded analysis...</span>
								</div>
							{/if}

							<!-- Error banner -->
							{#if msg.error}
								<div
									class="border-2 border-red-600 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-bold text-red-700 dark:text-red-300 rounded-theme"
								>
									⚠️ {msg.error}
								</div>
							{/if}

							<!-- Citations Section -->
							{#if msg.citations && msg.citations.length > 0}
								<div class="border-t border-border/20 pt-3 mt-3">
									<p class="text-[11px] font-black uppercase tracking-wider text-muted-foreground font-display mb-1.5">
										Grounding Sources ({msg.citations.length}):
									</p>
									<div class="flex flex-wrap gap-1.5">
										{#each msg.citations as cit}
											{@const info = getFriendlyDocumentInfo(cit.filename)}
											<button
												type="button"
												onclick={() => (activeCitation = activeCitation?.filename === cit.filename ? null : cit)}
												class="inline-flex items-center gap-1 border border-border bg-background px-2 py-1 text-[11px] font-bold text-foreground rounded-theme shadow-theme-sm hover:bg-secondary hover:text-secondary-foreground transition-all cursor-pointer"
											>
												<span class="text-primary font-black">📄</span>
												<span class="truncate max-w-[200px]">{info.title}</span>
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- Active Citation Details Modal / Drawer -->
	{#if activeCitation}
		{@const doc = getFriendlyDocumentInfo(activeCitation.filename)}
		<div
			class="border-t-2 border-border bg-surface p-3 sm:p-4 text-foreground text-xs font-body transition-all"
		>
			<div class="flex items-start justify-between gap-2 mb-1.5">
				<div>
					<div class="flex items-center gap-2">
						<span
							class="border border-border bg-secondary px-1.5 py-0.5 text-[9px] font-black uppercase text-secondary-foreground"
						>
							{doc.organization} · {doc.year}
						</span>
						<span class="text-[10px] font-mono text-muted-foreground">{activeCitation.filename}</span>
					</div>
					<h5 class="font-display font-extrabold text-sm text-foreground mt-1">
						{doc.title}
					</h5>
				</div>
				<button
					type="button"
					onclick={() => (activeCitation = null)}
					class="text-muted-foreground hover:text-foreground font-black text-sm p-1 cursor-pointer"
					aria-label="Close citation details"
				>
					✕
				</button>
			</div>

			<p class="text-xs text-muted-foreground leading-relaxed mt-1">
				{doc.description}
			</p>

			{#if activeCitation.snippet}
				<div class="mt-2 p-2 border border-border bg-background font-mono text-[10px] text-foreground/90 max-h-24 overflow-y-auto">
					"{activeCitation.snippet}..."
				</div>
			{/if}
		</div>
	{/if}

	<!-- Chat Input Bar -->
	<footer class="shrink-0 border-t-2 border-border bg-background p-3">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
			class="flex items-center gap-2"
		>
			<textarea
				bind:value={inputMessage}
				onkeydown={handleKeydown}
				rows="1"
				placeholder="Ask any question regarding nuclear weapons, treaties, or forces..."
				disabled={isGenerating}
				class="flex-1 resize-none border-2 border-border bg-surface px-3 py-2 text-xs sm:text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary rounded-theme disabled:opacity-60"
			></textarea>

			{#if isGenerating}
				<button
					type="button"
					onclick={stopGeneration}
					class="inline-flex h-9 sm:h-10 items-center justify-center border-2 border-border bg-red-600 text-white px-3 text-xs font-black uppercase tracking-wider rounded-theme shadow-theme-sm hover:translate-y-[1px] active:translate-y-[1px] cursor-pointer"
				>
					Stop
				</button>
			{:else}
				<button
					type="submit"
					disabled={!inputMessage.trim()}
					class="inline-flex h-9 sm:h-10 items-center justify-center border-2 border-border bg-primary px-3 sm:px-4 text-xs sm:text-sm font-black uppercase tracking-wider text-primary-foreground rounded-theme shadow-theme-primary hover:translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					<span>Send</span>
					<span class="ml-1">↵</span>
				</button>
			{/if}
		</form>
	</footer>
</div>
