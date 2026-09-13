# [ESTABLISHED] Folder Structure

Reference tree of the running project. Full prose and rationale in `docs/research/folder-structure.md`.

## Top-Level Layout

```
wedontneednukes/
├── .ai/                              # Agent context (this directory)
├── docs/                             # Human & AI documentation
├── src/                              # Application code
├── drizzle/                          # D1 SQL migration files (drizzle-kit output)
├── static/                           # Served as-is at site root (favicon, wiki/*.md, etc.)
├── tests/                            # Automated unit tests (*.test.ts)
├── wrangler.jsonc                    # Cloudflare Workers configuration
├── package.json                      # pnpm + overrides (kysely)
└── tsconfig.json
```

## `src/` Tree

```
src/
├── app.html
├── app.css                           # Tailwind v4 theme variables & presets
├── app.d.ts                          # App.Platform (D1, KV, R2), App.Locals
├── hooks.server.ts                   # Auth session population, request lifecycle
├── lib/
│   ├── theme.svelte.ts               # Runes-based reactive theme store
│   ├── menu.svelte.ts                # Drawer navigation menu state
│   │
│   ├── types/
│   │   ├── qa.ts                     # Domain types for questions/answers
│   │   └── wiki.ts                   # WikiManifest / WikiArticle types
│   │
│   ├── utils/
│   │   ├── qa-hash.ts                # Content-addressed IDs for questions
│   │   ├── wiki-frontmatter.ts       # Simple `key: value` frontmatter parser
│   │   ├── wiki-render.ts            # Wrapper around `marked` (raw HTML stripped)
│   │   └── wiki-scope-action.ts      # Sets `data-scope="wiki"` on <body>
│   │
│   ├── components/                   # Shared UI primitives
│   │   ├── FundraiserButton.svelte
│   │   ├── InfoTooltip.svelte
│   │   ├── MenuBar.svelte
│   │   ├── MenuButton.svelte
│   │   ├── ThemeSwitcher.svelte
│   │   ├── Turnstile.svelte
│   │   │
│   │   └── widgets/                  # Independent page-section widgets
│   │       ├── StepHeaderWidget.svelte
│   │       ├── QuestionHeroWidget.svelte
│   │       ├── JoinFormWidget.svelte
│   │       ├── PledgeFormWidget.svelte
│   │       ├── ResultsWidget.svelte
│   │       ├── ClaimVoteBanner.svelte
│   │       ├── WikiIndexWidget.svelte      # /wiki index cards (grouped)
│   │       ├── WikiArticleWidget.svelte    # Single article body + related
│   │       └── index.ts                    # Barrel export
│   │
│   ├── fixtures/
│   │   ├── heroQuestion.ts           # Hard-coded top-of-page question
│   │   ├── civicActionQuestion.ts
│   │   └── commitmentQuestion.ts
│   │
│   ├── wiki/                         # Wiki browser-safe utilities (NOT server/)
│   │   └── manifest.ts               # Reads /wiki/manifest.json via fetch
│   │
│   └── server/                       # Server-only code (SvelteKit enforced)
│       ├── db/
│       │   ├── client.ts             # D1 / SQLite client factory
│       │   └── schema.ts             # Drizzle ORM schema definitions
│       ├── auth/
│       │   └── index.ts              # Better Auth per-request factory & plugins
│       ├── profile/
│       │   └── index.ts              # Profile filtering & privacy controls
│       ├── account/
│       │   └── index.ts              # Account linking & unlink safety
│       ├── security/
│       │   ├── sessions.ts           # Device parser & active session tracking
│       │   └── turnstile.ts          # Cloudflare Turnstile token validation
│       ├── email.ts                  # Magic link delivery
│       ├── content/
│       │   └── loader.ts             # Precompiled in-memory Markdown snippet loader (Option C)
│       ├── legal/
│       │   └── loader.ts             # Legal documents helper (delegates to content/loader)
│       └── wiki/
│           └── loader.ts             # Single-article fetcher (server-only)
│
├── routes/                           # Thin composition layer
│   ├── +layout.svelte
│   ├── +layout.server.ts
│   ├── +page.svelte                  # Root hero question
│   ├── about/                        # About page (SSR from static/about.md)
│   │   ├── +page.svelte
│   │   └── +page.server.ts
│   ├── auth/
│   │   ├── +page.svelte              # Join / magic link / social
│   │   ├── +page.server.ts
│   │   └── two-factor/               # TOTP verification
│   ├── legal/                        # Legal & compliance directory
│   │   ├── +page.svelte              # Legal index
│   │   └── [slug]/                   # Dynamic legal document reader
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   ├── terms/+server.ts              # Redirect -> /legal/terms (OAuth standard)
│   ├── privacy/+server.ts            # Redirect -> /legal/privacy (OAuth standard)
│   ├── pledge/
│   │   ├── +page.svelte              # Commitment tiers selection
│   │   └── +page.server.ts
│   ├── results/
│   │   ├── +page.svelte              # Consensus statistics & claim banner
│   │   └── +page.server.ts
│   ├── profile/
│   ├── settings/
│   │   ├── account/
│   │   ├── profile/
│   │   └── security/
│   ├── fundraiser/
│   ├── tests/
│   │   └── ui-forms/                 # Style benchmarks & theme test suite
│   ├── wiki/                         # Public knowledge base (SSR)
│   │   ├── +layout.svelte            # applies <svelte:body use:wikiScope>
│   │   ├── +layout.server.ts         # groups manifest entries by category
│   │   ├── +page.svelte
│   │   ├── +page.server.ts
│   │   └── faq/
│   │       └── [slug]/
│   │           ├── +page.svelte
│   │           └── +page.server.ts
│   └── api/
│       └── auth/[...betterauth]/+server.ts
│
└── scripts/                          # Build-time utilities (Node-only)
    └── generate-wiki-manifest.ts     # Walks static/wiki/faq → manifest.json
```

## `static/` Tree

Wiki articles, About, and Legal policy bodies live here as plain Markdown:

```
static/
├── favicon.png
├── icon.png
├── robots.txt
├── about.md                          # Clear, no-fluff project overview
├── legal/
│   ├── terms.md                      # Terms of Service for OAuth and platform use
│   └── privacy.md                    # Privacy Policy detailing minimal data & OAuth scopes
└── wiki/
    ├── manifest.json                 # Generated by `pnpm manifest`
    └── faq/
        ├── why.md                    # Migrated from old /why page
        ├── why-pledge.md
        ├── why-now.md
        ├── passive-meaning.md
        ├── privacy.md
        └── change-pledge.md
```

## Rules Reinforced Across This Tree

- **`src/lib/server/*` is server-only.** SvelteKit blocks client imports.
- **`src/lib/wiki/*` is browser-safe** but lives outside `server/` because it needs to be reachable from universal `+page.ts` modules. The wiki manifest reader keeps no secrets and no Node imports.
- **`src/lib/components/widgets/*` are composable page sections**, not primitives. Each widget has its own TypeScript prop contract and is exported via `widgets/index.ts`.
- **Top-level `src/routes/*` are lean shells** that arrange widgets + run `+page.server.ts` loaders/actions.
- **`static/wiki/faq/*.md` is content, not code.** Authors edit freely; `pnpm manifest` keeps the index in sync.
- **`.ai/`, `docs/`, and `static/wiki/`** are not part of the TypeScript compilation graph — only public assets and documentation.
