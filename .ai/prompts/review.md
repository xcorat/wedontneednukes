# [ESTABLISHED] Code Review Prompt

## Context
You are reviewing code for the WeDoNotNeedNukes project.

## Checkpoints
- **Runes ONLY**: Ensure absolutely no legacy Svelte reactivity (`$:` or `export let`). Only `$state`, `$derived`, `$props`, `$effect`.
- **Snippets**: Verify `{#snippet}` is used over `<slot />`.
- **Server Boundaries**: Verify DB/auth operations exist only in `src/lib/server/`. Client code must not import from here.
- **Thin Routes**: Check that `+page.server.ts` does not contain heavy business logic.
- **Factory Pattern**: Ensure DB/Auth objects are injected per-request, not statically exported singletons.
- **TypeScript**: Check for `any` types. Enforce strict typing.
- **Testing**: Is this change covered by tests?
