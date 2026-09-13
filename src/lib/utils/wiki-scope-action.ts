// Svelte action that sets `data-scope="wiki"` on <body> while active,
// and removes it on teardown. Applied via:
//   <svelte:body use:wikiScope />
// in src/routes/wiki/+layout.svelte.
//
// Svelte 5's <svelte:body> only accepts event listeners (and the `use:`
// directive), not arbitrary attributes — so this is the right hook.

export function wikiScope(node: HTMLElement) {
	// Defensive: only act on body.
	if (node !== document.body) {
		console.warn('[wikiScope] expected document.body, got', node);
	}
	document.body.dataset.scope = 'wiki';
	return {
		destroy() {
			if (document.body.dataset.scope === 'wiki') {
				delete document.body.dataset.scope;
			}
		}
	};
}
