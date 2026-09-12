<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		siteKey?: string;
		theme?: 'auto' | 'light' | 'dark';
		onSuccess?: (token: string) => void;
		onError?: (error: string) => void;
		onExpire?: () => void;
	}

	let {
		siteKey = '1x0000000000000000000000000000000AA',
		theme = 'auto',
		onSuccess,
		onError,
		onExpire
	}: Props = $props();

	let container = $state<HTMLDivElement | null>(null);
	let widgetId = $state<string | null>(null);

	const isDummy = $derived(!siteKey || siteKey === '1x0000000000000000000000000000000AA');

	function loadTurnstileScript(): Promise<void> {
		if (typeof window === 'undefined') return Promise.resolve();
		if ((window as any).turnstile) return Promise.resolve();

		return new Promise((resolve, reject) => {
			const existingScript = document.getElementById('cf-turnstile-script');
			if (existingScript) {
				existingScript.addEventListener('load', () => resolve());
				existingScript.addEventListener('error', (e) => reject(e));
				return;
			}

			const script = document.createElement('script');
			script.id = 'cf-turnstile-script';
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = (e) => reject(e);
			document.head.appendChild(script);
		});
	}

	onMount(async () => {
		if (isDummy) {
			// Auto-resolve dummy token in test/dev mode
			onSuccess?.('XXXX.DUMMY.TOKEN.XXXX');
			return;
		}

		try {
			await loadTurnstileScript();
			if (!container || !(window as any).turnstile) return;

			widgetId = (window as any).turnstile.render(container, {
				sitekey: siteKey,
				theme,
				callback: (token: string) => {
					onSuccess?.(token);
				},
				'error-callback': (code: string) => {
					onError?.(`Turnstile challenge failed (${code}).`);
				},
				'expired-callback': () => {
					onExpire?.();
				}
			});
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load Cloudflare Turnstile.';
			onError?.(message);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined' && widgetId && (window as any).turnstile) {
			try {
				(window as any).turnstile.remove(widgetId);
			} catch {
				// Ignore teardown errors
			}
		}
	});

	export function reset() {
		if (typeof window !== 'undefined' && widgetId && (window as any).turnstile) {
			(window as any).turnstile.reset(widgetId);
		}
	}
</script>

<div class="turnstile-container my-2 flex justify-center">
	{#if isDummy}
		<div class="flex items-center gap-2 rounded-theme border-2 border-border bg-background px-3 py-1.5 text-xs font-mono text-muted-foreground">
			<span>🛡️</span>
			<span>Turnstile: Test Mode Active</span>
		</div>
	{:else}
		<div bind:this={container}></div>
	{/if}
</div>
