# [ESTABLISHED] Folder Structure

Reference tree of the running project. Full prose and rationale in `docs/research/folder-structure.md`.

## Top-Level Layout

```
wedontneednukes/
├── .ai/                              # Agent context (this directory)
├── docs/                             # Human & AI documentation
├── src/                              # Application code
├── drizzle/                          # D1 SQL migration files (drizzle-kit output)
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
│
├── lib/
│   ├── theme.svelte.ts               # Runes-based reactive theme store
│   ├── menu.svelte.ts                # Drawer navigation menu state
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
│   │       └── index.ts              # Barrel export
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
│       └── email.ts                  # Magic link delivery
│
└── routes/                           # Thin composition layer
    ├── +layout.svelte
    ├── +layout.server.ts
    ├── +page.svelte                  # Root hero question
    ├── auth/
    │   ├── +page.svelte              # Join / magic link / social
    │   ├── +page.server.ts
    │   └── two-factor/               # TOTP verification
    ├── pledge/
    │   ├── +page.svelte              # Commitment tiers selection
    │   └── +page.server.ts
    ├── results/
    │   ├── +page.svelte              # Consensus statistics & claim banner
    │   └── +page.server.ts
    ├── profile/
    ├── settings/
    │   ├── account/
    │   ├── profile/
    │   └── security/
    ├── fundraiser/
    ├── tests/
    │   └── ui-forms/                 # Style benchmarks & theme test suite
    └── api/
        └── auth/[...betterauth]/+server.ts
```

## Rules Reinforced Across This Tree

- **`src/lib/server/*` is server-only.** SvelteKit blocks client imports.
- **`src/lib/components/widgets/*` are composable page sections**, not primitives. Each widget has its own TypeScript prop contract and is exported via `widgets/index.ts`.
- **Top-level `src/routes/*` are lean shells** that arrange widgets + run `+page.server.ts` loaders/actions.
- **`.ai/` and `docs/`** are documentation only — never imported by application code.

## Adding New Code — Decision Tree

1. **Domain server logic** (DB ops, auth, secrets, business rules) → `src/lib/server/<domain>/`.
2. **Reusable UI primitive** (low-level controls) → `src/lib/components/<Name>.svelte`.
3. **Self-contained page-section widget** (forms, banners, results) → `src/lib/components/widgets/<Name>Widget.svelte`; export via `widgets/index.ts`.
4. **Page-level composition** → `src/routes/...`; keep thin, delegate to widgets and `+page.server.ts`.
5. **Stateful runes store** → `src/lib/<name>.svelte.ts` (e.g. `theme.svelte.ts`).
