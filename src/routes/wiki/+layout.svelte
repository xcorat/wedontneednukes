<script lang="ts">
	import type { LayoutData } from './$types.js';
	import type { Snippet } from 'svelte';
	import { wikiScope } from '$lib/utils/wiki-scope-action.js';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<!-- Apply the wiki theming scope at <body> so chrome (banner, MenuBar) and content
     all pick up wiki default tokens. Removed automatically when leaving the wiki. -->
<svelte:body use:wikiScope />

{@render children()}
