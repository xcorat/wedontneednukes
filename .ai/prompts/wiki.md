# [DRAFT] Wiki / FAQ Feature Plan

Audience: a coding agent picking this up later, or a human reviewer deciding scope.
Status: **proposed** — nothing has been implemented yet.

## Goal

Replace the static `/why` landing with a public, read-only wiki/FAQ knowledge base for the campaign:

- `/wiki` — index listing every FAQ article, grouped by topic.
- `/wiki/faq/<slug>` — a single article answering one "why"-style question.
- The existing `/why` page is **deleted**; its content moves into `/wiki/faq/why` as markdown.
- The wiki has its **own default theme** (same CSS variable names, different defaults) so the knowledge-base feel can differ from the high-conversion main site without doubling the variable schema.
- No backward-compatibility shims, no redirects, no `/why` route left behind.

## URL Structure

| Path | Purpose | Status |
|---|---|---|
| `/wiki` | Wiki index — featured + grouped list of articles | **new** |
| `/wiki/faq/<slug>` | Single FAQ article | **new** (`[slug]` dynamic segment) |
| `/why` | Short landing page | **deleted** |

`<slug>` follows the existing campaign convention (`kebab-case`, ASCII): examples `why`, `why-pledge`, `why-now`, `passive-meaning`, `privacy`, etc.

## Content Location & Format

All article bodies live in the `static/` folder as plain Markdown — no fixtures, no TS rebuilds to ship a copy edit.

```
static/
└── wiki/
    ├── manifest.json                              # article index: slug → metadata
    └── faq/
        ├── why.md                                 # migrated content from old /why
        ├── why-pledge.md
        ├── why-now.md
        ├── passive-meaning.md
        ├── privacy.md
        └── change-pledge.md
```

`static/` is the right home because it's the only directory in this codebase without a TS compilation step — files there render naturally as Markdown in any editor, diff cleanly, and feel like content rather than code.

### Frontmatter format

Each `.md` file uses a tiny frontmatter block. **Simple `key: value` syntax** — no `js-yaml` dependency:

```md
title: Why pledge against nuclear weapons?
category: Premise
order: 2
summary: A short summary shown on the /wiki index page.
related:
  - why-now
  - privacy
---

Body text starts here. Multiple paragraphs, ## headings, lists, **bold**, [links](/wiki/faq/why-pledge).
```

Supported fields (kept minimal):

| Field | Purpose |
|---|---|
| `title` | The "why…" question shown on the page. |
| `category` | Grouping label on `/wiki` (e.g. `Premise`, `Action`, `Privacy`, `Pledge`). |
| `order` | Numeric sort key inside a category on `/wiki`. |
| `summary` | 1–2 sentence blurb for the index card. |
| `related` | Optional list of slugs rendered as "Related" links at article bottom. |

Parser is a ~20-line function — `tests/wiki-frontmatter.test.ts` covers the cases.

## Theming Architecture

The wiki shares the project's `:root`-defined CSS variables (`--background`, `--primary`, `--radius`, `--shadow-*`, etc.), but ships its own **default token values** scoped to the wiki routes. Same variable names everywhere — zero duplicated markup, just two tiers of CSS custom-property values:

1. **Main defaults** — `:root { --background: …; --primary: …; }` (existing, untouched).
2. **Wiki defaults** — `.wiki-scope { --background: …; --primary: …; }` (new).

### How scoping works

A new `src/routes/wiki/+layout.svelte` runs for every route under `/wiki/...` (index + `/faq/[slug]`) and applies the scope at the **document level** so the wiki feel cascades through the whole wiki page — body background, cards, borders, prose, MenuBar drawer:

```svelte
<!-- src/routes/wiki/+layout.svelte -->
<svelte:body data-scope="wiki" />

{@render children()}
```

That tag attaches `data-scope="wiki"` to the `<body>` element so the included chrome (sticky banner, MenuBar drawer) and the article content all pick up the wiki variables. When the user navigates back to a non-wiki route, the `<svelte:body>` directive removes the attribute and main defaults apply. No JS, no layout switch, no client-side flicker.

### CSS structure

In `src/app.css`, *after* the existing `:root` and `[data-theme="…"]` blocks, add:

```css
/* Wiki scope — own defaults, same variable names.
   Selector specificity is on par with :root[data-theme="…"], so a user-chosen
   non-classic theme still wins for the wiki page (intentional). */
.wiki-scope {
  --background: #fafaf5;             /* calmer paper-cream for long reads */
  --surface:    #ffffff;
  --foreground: #1a1a1a;
  --primary:    #2563eb;             /* knowledge-base blue instead of red */
  --primary-foreground: #ffffff;
  --primary-shadow: #1e40af;
  --secondary:  #f59e0b;
  --secondary-foreground: #1a1a1a;
  --secondary-shadow: #b45309;
  --muted:      #6b7280;
  --muted-foreground: #4b5563;
  --border:     #1a1a1a;
  --success:    #15803d;
  --success-foreground: #ffffff;

  --radius:     4px;                 /* slight curves, less aggressive */
  --shadow-sm:  0 2px 0 var(--border);
  --shadow-md:  0 4px 0 var(--border);
  --shadow-lg:  0 6px 0 var(--border);
  --shadow-primary:    0 4px 0 var(--primary-shadow);
  --shadow-secondary:  0 4px 0 var(--secondary-shadow);

  --font-display: "Source Serif Pro", Georgia, serif;
  --font-body:    "Inter", system-ui, sans-serif;
}
```

Notes:

- Same variable names → no Tailwind class changes anywhere. All `bg-primary`, `text-foreground`, `shadow-theme-md` etc. already work; the wiki just resolves them differently.
- Wiki pages still respect the user's theme choice (`dark`/`game`/`compact`/`minimal`) *only* when the user is NOT on "classic". When the user is on classic, the wiki gets its own distinct look. This is the user's stated goal: "different *defaults* for wiki vs main."
- Per-theme wiki variants (e.g. a wiki-dark that looks different from main-dark) are out of scope for v1 — see "Future extensions" below. Initial implementation respects the global user theme when the user picks one; it does not invent a separate parallel theme system on day one.

### Interaction with `ThemeManager`

`ThemeManager` (in `src/lib/theme.svelte.ts`) currently sets `data-theme` on `document.documentElement`. Wiki routing doesn't need to change that. The cascade order works out:

- On classic (no `data-theme`): `.wiki-scope` (specificity 0,1,0) wins over `:root` (0,0,1). Wiki defaults applied.
- After picking a non-classic theme: `:root[data-theme="X"]` (0,1,1) wins over `.wiki-scope` (0,1,0). User-chosen theme applied globally, including the wiki.

So the wiki gets its own look on default; the user's theme choice is still respected when they make one.

If a future phase wants wiki-specific theme variants, the path is: add another rule pair — `.wiki-scope[data-theme="dark"] { … }` — and have `ThemeManager` mirror the attribute onto `<body>` (the `data-scope` host). That change is small and additive.

## Rendering Approach

### Library: `marked`

`mdsvex` was considered and rejected — it compiles `.svx` to Svelte components at build time via a Vite plugin and is consumed via `import … from './foo.svx'`. It cannot naturally discover content dropped into `static/` (which is not part of Vite's module graph), so wiring it up here would mean either symlinking `static/…` into `src/` or running a sync script. That's not simpler.

`marked` is the right tool: server-side `fetch → parse → render → @html`.

### Configure `marked` with safe defaults

```ts
// src/lib/utils/wiki-render.ts
import { Marked } from 'marked';

const marked = new Marked({
  gfm: true,
  breaks: false,
  pedantic: false
});

// Disable raw HTML: drop the rendered output for any html token — editors
// write Markdown only, no <script>/<iframe>/inline-styled tags.
marked.use({
  renderer: {
    html() {
      return '';
    }
  }
});
```

### Style the rendered Markdown

Hand-roll styling under a `.wiki-prose` wrapper so the wiki matches the site's neo-brutalist theme (no `@tailwindcss/typography` dependency). Note: these rules use the same theme variables, so they automatically pick up the wiki-scope overrides:

```css
/* in app.css, alongside .wiki-scope */
.wiki-prose { @apply space-y-4 leading-relaxed text-foreground font-body; }
.wiki-prose h2 { @apply text-2xl font-extrabold tracking-tight mt-8 mb-2 font-display text-foreground; }
.wiki-prose p { @apply text-base sm:text-lg; }
.wiki-prose ul { @apply list-disc pl-6 space-y-1; }
.wiki-prose ol { @apply list-decimal pl-6 space-y-1; }
.wiki-prose a { @apply underline underline-offset-4 font-bold hover:text-primary; }
.wiki-prose strong { @apply font-extrabold; }
.wiki-prose code { @apply bg-surface border border-border px-1.5 py-0.5 rounded text-sm font-mono; }
.wiki-prose blockquote { @apply border-l-4 border-primary pl-4 italic text-muted-foreground; }
```

Because `.wiki-scope` redefines `--primary`, `--surface`, etc., `.wiki-prose` looks distinctly "wiki" without any extra class names — the same `text-foreground` / `bg-surface` utilities pick up the scoped values automatically.

## File Structure

New files:

```
static/
└── wiki/
    ├── manifest.json
    └── faq/
        ├── why.md                                 # migrated from old /why
        ├── why-pledge.md
        ├── why-now.md
        ├── passive-meaning.md
        ├── privacy.md
        └── change-pledge.md

src/
├── lib/
│   ├── types/
│   │   └── wiki.ts                                # WikiManifest types
│   ├── utils/
│   │   ├── wiki-frontmatter.ts                    # parse `key: value` frontmatter
│   │   └── wiki-render.ts                         # marked wrapper, raw HTML stripped
│   ├── components/
│   │   └── widgets/
│   │       ├── WikiIndexWidget.svelte             # groups articles by category
│   │       ├── WikiArticleWidget.svelte           # article title + body + related
│   │       └── index.ts                             # barrel: export the new widgets
│   └── server/
│       └── wiki/
│           ├── manifest.ts                        # fetch /wiki/manifest.json
│           └── loader.ts                          # fetch + parse one article
└── routes/
    ├── wiki/
    │   ├── +layout.svelte                          # applies <svelte:body data-scope="wiki">
    │   ├── +page.svelte                            # composes WikiIndexWidget
    │   ├── +page.server.ts                         # load grouped manifest
    │   └── +page.ts                                # prerender = true
    └── wiki/
        └── faq/
            └── [slug]/
                ├── +page.svelte                    # composes WikiArticleWidget
                ├── +page.server.ts                 # article or 404
                └── +page.ts                        # prerender = true + entries()
```

Deleted files (entire directory):

```
src/routes/why/
└── +page.svelte
```

Edited files:

```
src/lib/components/MenuBar.svelte                  # replace /why link with /wiki
src/lib/components/widgets/QuestionHeroWidget.svelte # whyHref default → /wiki/faq/why
src/lib/fixtures/{heroQuestion,civicActionQuestion,commitmentQuestion}.ts  # link: /wiki/faq/why
src/lib/types/qa.ts                                # update comment
src/app.css                                        # add .wiki-scope + .wiki-prose blocks
package.json                                       # add `marked` dep + `manifest` script
```

## Migrating `/why` to `/wiki/faq/why`

The three sections of the current `src/routes/why/+page.svelte`:

1. **12,000+ Warheads**
2. **Consensus Before Politics**
3. **Your Voice Shapes The Movement**

Become the body of `static/wiki/faq/why.md`, each as an `## h2` heading with a paragraph below. Frontmatter `title: "Why \"We Don't Need Nukes\"?"`, `category: Premise`, `order: 1`. The "Make Your Choice" CTA at the bottom of the old page is **dropped** — visitors on the wiki are reading, not deciding; they re-enter the pledge flow via the home page (`/`).

If we want a CTA later it can be a small footer button on `WikiArticleWidget` powered by a `cta: { label, href }` frontmatter field. Out of scope for v1.

## Server Logic

`src/lib/server/wiki/manifest.ts`:

```ts
export const loadWikiManifest = async (fetch: typeof globalThis.fetch) => {
  const res = await fetch('/wiki/manifest.json');
  if (!res.ok) throw error(500, 'Wiki manifest missing');
  return (await res.json()) satisfies WikiManifest;
};
```

`src/lib/server/wiki/loader.ts`:

```ts
export const loadWikiArticle = async (
  slug: string,
  fetch: typeof globalThis.fetch,
  manifest: WikiManifest
) => {
  if (!manifest.entries.some((e) => e.slug === slug)) {
    throw error(404, 'Article not found');
  }
  const res = await fetch(`/wiki/faq/${slug}.md`);
  if (!res.ok) throw error(500, 'Failed to load article');
  const text = await res.text();
  const { frontmatter, body } = parseFrontmatter(text);
  const html = renderMarkdown(body);
  return { slug, frontmatter, html, related: frontmatter.related ?? [] };
};
```

## Prerendering (yes)

`src/routes/wiki/+page.ts` → `export const prerender = true;`.

`src/routes/wiki/faq/[slug]/+page.ts`:

```ts
export const prerender = true;

export const entries = async () => {
  const manifest = await loadWikiManifest(fetch);
  return manifest.entries.map((e) => ({ slug: e.slug }));
};
```

Benefits:

- Every artifact ships as static HTML — instant edge delivery, zero cold-start cost.
- `pnpm build` fails if a manifest slug has no `.md` file (or vice versa) — free correctness check.
- Prerendered wiki HTML still has `<body data-scope="wiki">` baked in — the wiki look is on by default before any JS runs. Users who never interact with the theme switcher see the wiki look. Users who do interact fall through to the global theme.

## MenuBar Update

Remove the existing "Why We Don't Need Nukes" link (going to `/why`). Add a single "📖 Wiki" entry pointing to `/wiki` — the new home for the migrated content plus all other FAQ articles.

## Phase-by-Phase Implementation

### Phase 1 — Dependencies, types, renderers

1. `pnpm add marked` → add `marked` to `dependencies`.
2. `src/lib/types/wiki.ts` — define `WikiManifestEntry` + `WikiManifest`.
3. `src/lib/utils/wiki-frontmatter.ts` — parse the simple `key: value`/list frontmatter format.
4. `src/lib/utils/wiki-render.ts` — wrapped `Marked` instance, raw HTML stripped.
5. `tests/wiki-frontmatter.test.ts` and `tests/wiki-render.test.ts` — minimal unit coverage.

### Phase 2 — App-wide style hookup (theming)

6. Add `.wiki-scope { … }` block to `src/app.css` defining the wiki default variable values (see "Theming Architecture" above).
7. Add `.wiki-prose { … }` rules to `src/app.css` for the rendered Markdown styling.

### Phase 3 — Manifest script + dummy content

8. `scripts/generate-wiki-manifest.ts` — walks `static/wiki/faq/*.md`, parses each frontmatter, writes `static/wiki/manifest.json`. Add a "fail if .md missing for any manifest slug, or vice versa" assertion. Wire as `pnpm manifest`. Hook into `prebuild`.
9. Create `static/wiki/faq/why.md` from the migrated content (3 sections, no CTA).
10. Create 5 placeholder articles matching the campaign slug table:

    | slug | category | order | title |
    |---|---|---|---|
    | `why` | Premise | 1 | Why "We Don't Need Nukes"? |
    | `why-pledge` | Premise | 2 | Why pledge against nuclear weapons? |
    | `why-now` | Premise | 3 | Why now? What makes today different from the past? |
    | `passive-meaning` | Action | 1 | What does "not supporting expansion" mean practically? |
    | `privacy` | Privacy | 1 | How is my data used? |
    | `change-pledge` | Pledge | 1 | Can I change my pledge? |

11. Run `pnpm manifest` → produces `static/wiki/manifest.json`. Commit it.

### Phase 4 — Server loaders

12. `src/lib/server/wiki/manifest.ts` and `src/lib/server/wiki/loader.ts` per the snippets above.
13. `src/routes/wiki/+page.server.ts` — `load` → load manifest, group by `category`, sort by `order`.
14. `src/routes/wiki/faq/[slug]/+page.server.ts` — `load({ params })` → call `loadWikiArticle`.

### Phase 5 — Components + route shells

15. `src/lib/components/widgets/WikiIndexWidget.svelte` — receives grouped entries, renders cards.
16. `src/lib/components/widgets/WikiArticleWidget.svelte` — receives the loaded article, renders `.wiki-prose` body + related list + "← Back to Wiki".
17. `src/lib/components/widgets/index.ts` — barrel export.
18. `src/routes/wiki/+layout.svelte` — `<svelte:body data-scope="wiki" />` + pass `children` through.
19. `src/routes/wiki/+page.svelte` — composes `WikiIndexWidget`, sets `<svelte:head><title>Wiki · We Don't Need Nukes</title></svelte:head>`.
20. `src/routes/wiki/faq/[slug]/+page.svelte` — composes `WikiArticleWidget`, sets per-article `<svelte:head>` from frontmatter title.

### Phase 6 — Prerender entries

21. `src/routes/wiki/+page.ts` — `export const prerender = true;`.
22. `src/routes/wiki/faq/[slug]/+page.ts` — `export const prerender = true;` + `entries()` returning `{ slug }` per manifest item.

### Phase 7 — Delete `/why` and update callers

23. Delete `src/routes/why/+page.svelte` (and the empty `src/routes/why/` directory).
24. Update every `/why` reference in the codebase (verified via `grep -rn "/why" src/`):
    - `src/lib/fixtures/heroQuestion.ts` → `link: '/wiki/faq/why'`.
    - `src/lib/fixtures/civicActionQuestion.ts` → `link: '/wiki/faq/why'` (the `text: 'Action Areas'` description no longer matches the migrated content; for now, also point at `/wiki/faq/why` since the wiki index covers all action topics).
    - `src/lib/fixtures/commitmentQuestion.ts` → `link: '/wiki/faq/why'`.
    - `src/lib/components/widgets/QuestionHeroWidget.svelte` → `whyHref = model?.question.faq?.[0]?.link ?? '/wiki/faq/why'`.
    - `src/lib/types/qa.ts` line 15 comment → `// Target URL (e.g., "/wiki/faq/why")`.
25. `src/lib/components/MenuBar.svelte` — replace `/why` link with `/wiki` "Wiki & FAQ" entry.

### Phase 8 — Validation

26. `pnpm check` → no type errors.
27. `pnpm test` → renderer + frontmatter tests pass.
28. `pnpm build` → SvelteKit succeeds, prerendered HTML appears under `.svelte-kit/output/prerendered/pages/wiki/...` for every manifest slug.
29. `pnpm dev` smoke (documented in PR):
    - `/wiki` shows grouped cards (Premise, Action, Privacy, Pledge) with all 6 articles.
    - Each card links to `/wiki/faq/<slug>` and renders its Markdown in the wiki-prose style.
    - `/wiki/faq/why` shows the migrated content (3 sections).
    - `/wiki/faq/does-not-exist` returns 404.
    - The "Why?" button on the home hero links to `/wiki/faq/why`.
    - On wiki routes, body has `data-scope="wiki"`. On non-wiki routes, body has no scope attr.
    - On `/wiki` with default theme (no user theme change), page renders in the calm knowledge-base palette (blue accent, paper-cream bg, Rounded 2D-ish radius) instead of the main red/cream look.
    - On `/wiki` after picking "Dark" via the theme switcher, page renders in the global dark palette.
    - `MenuBar` → "Wiki & FAQ" opens `/wiki`. No references to `/why` remain (`grep -rn "/why" src/ static/` returns only the updated `qa.ts` comment).

## Out of Scope

- Authoring UI / CMS — content stays in `static/wiki/`, edited via PR.
- Search, tags beyond `category`, table-of-contents.
- i18n / translations.
- Persisting articles to D1.
- Inline Svelte components in articles (would require migrating to mdsvex — opt in later if needed).
- Wiki-specific themed variants (e.g. a `wiki-dark` that differs from `main-dark`). The CSS structure above leaves room: just add `.wiki-scope[data-theme="dark"] { … }` rules + extend `ThemeManager` to mirror `data-theme` to `<body>` when on the wiki scope. Deferred until we see how the wiki looks in dark mode.

## Decisions Confirmed

- **Markdown library**: `marked` ✅
- **Frontmatter style**: simple `key: value` (no `js-yaml`) ✅
- **Raw HTML in content**: disabled (Markdown only) ✅
- **Prerendering**: enabled ✅
- **Migration of `/why`**: into `/wiki/faq/why` as Markdown body, route deleted, all callers updated ✅
- **Wiki theming**: same CSS variable names, different defaults under `.wiki-scope`, applied via `<svelte:body data-scope="wiki">` in `src/routes/wiki/+layout.svelte` ✅
- **Manifest maintenance**: regenerated by `pnpm manifest` script + `prebuild` hook ✅

## Future extensions

- Wiki-specific dark variant → add `.wiki-scope[data-theme="dark"]` block + mirror `data-theme` to body in `ThemeManager`. Small change, additive.
- Per-article CTAs → add `cta: { label, href }` frontmatter + render in `WikiArticleWidget` footer.
- Authoring-tool integration → `static/wiki/faq/<slug>.md` already diffs cleanly; a small CLI for "create new article" is one script away.
