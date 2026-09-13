# [ESTABLISHED] Folder Structure

This document outlines the implemented directory structure for the WeDoNotNeedNukes project.

## Directory Tree

```
wedontneednukes/
├── .ai/                          # AI-first development context
│   ├── AGENTS.md                 # Master agent guide
│   ├── context/                  # Shared context for coding agents
│   │   ├── architecture.md       # Subsystem designs & layers
│   │   ├── conventions.md        # Coding & testing standards
│   │   ├── glossary.md           # Domain terminology
│   │   └── decisions.md          # Architectural Decision Records (ADRs)
│   └── prompts/                  # Reusable prompt templates
│       ├── feature.md
│       ├── bugfix.md
│       └── review.md
│
├── docs/                         # Human & AI documentation
│   ├── README.md
│   ├── CONTRIBUTING.md
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── pledge-engine.md
│   │   └── community-media.md
│   ├── campaigns/nukes/
│   │   ├── strategy.md
│   │   ├── goals-and-financials.md
│   │   ├── pledge-flow.md
│   │   ├── faq-content.md
│   │   └── copy.md
│   ├── design/
│   │   ├── design-system.md
│   │   ├── user-flows.md
│   │   └── user-flows-and-data-architecture.md
│   ├── guides/
│   │   ├── local-dev.md
│   │   └── deployment.md
│   ├── research/
│   │   ├── tech-stack.md
│   │   ├── data-model.md
│   │   ├── folder-structure.md
│   │   └── auth-options.md
│   └── roadmap/
│       ├── phases.md
│       └── milestones.md
│
├── src/
│   ├── app.html
│   ├── app.css                   # Tailwind v4 theme variables & presets
│   ├── app.d.ts                  # App.Platform (D1, KV, R2), App.Locals
│   ├── hooks.server.ts           # Auth session population, request lifecycle
│   │
│   ├── lib/
│   │   ├── theme.svelte.ts       # Runes-based reactive theme store
│   │   ├── menu.svelte.ts        # Drawer navigation menu state
│   │   │
│   │   ├── components/
│   │   │   ├── FundraiserButton.svelte
│   │   │   ├── InfoTooltip.svelte
│   │   │   ├── MenuBar.svelte
│   │   │   ├── MenuButton.svelte
│   │   │   ├── ThemeSwitcher.svelte
│   │   │   ├── Turnstile.svelte
│   │   │   │
│   │   │   └── widgets/          # Independent, composable form/page widgets
│   │   │       ├── StepHeaderWidget.svelte
│   │   │       ├── QuestionHeroWidget.svelte
│   │   │       ├── JoinFormWidget.svelte
│   │   │       ├── PledgeFormWidget.svelte
│   │   │       ├── ResultsWidget.svelte
│   │   │       ├── ClaimVoteBanner.svelte
│   │   │       └── index.ts
│   │   │
│   │   └── server/               # Server-only boundary (SvelteKit enforced)
│   │       ├── db/
│   │       │   ├── client.ts     # D1 / SQLite client factory
│   │       │   └── schema.ts     # Drizzle ORM schema definitions
│   │       ├── auth/
│   │       │   └── index.ts      # Better Auth per-request factory & plugins
│   │       ├── profile/
│   │       │   └── index.ts      # Profile filtering & privacy controls
│   │       ├── account/
│   │       │   └── index.ts      # Account linking & unlink safety
│   │       ├── security/
│   │       │   ├── sessions.ts   # Device parser & active session tracking
│   │       │   └── turnstile.ts  # Cloudflare Turnstile token validation
│   │       └── email.ts          # Magic link delivery
│   │
│   └── routes/                   # Thin composition layer
│       ├── +layout.svelte
│       ├── +layout.server.ts
│       ├── +page.svelte          # Root hero question
│       ├── auth/
│       │   ├── +page.svelte      # Join / magic link / social
│       │   ├── +page.server.ts
│       │   └── two-factor/       # TOTP verification
│       ├── pledge/
│       │   ├── +page.svelte      # Commitment tiers selection
│       │   └── +page.server.ts
│       ├── results/
│       │   ├── +page.svelte      # Consensus statistics & claim banner
│       │   └── +page.server.ts
│       ├── profile/
│       ├── settings/
│       │   ├── account/
│       │   ├── profile/
│       │   └── security/
│       ├── fundraiser/
│       ├── tests/
│       │   └── ui-forms/         # Style benchmarks & theme test suite
│       └── api/
│           └── auth/[...betterauth]/+server.ts
│
├── drizzle/                      # D1 SQL migration files
├── tests/                        # Automated unit tests (*.test.ts)
├── wrangler.jsonc                # Cloudflare Workers configuration
├── package.json
└── tsconfig.json
```

## Structural Decisions & Rationale

- **Modular Independent Widgets (`src/lib/components/widgets/`)**: Decomposing core page sections into self-contained widgets enables rapid re-use across full onboarding paths, compact cards, test benchmarks, and future modal embeds.
- **Server Boundary (`src/lib/server/`)**: SvelteKit strictly prevents importing this directory into client bundles, guaranteeing that DB queries, secret keys, and auth logic never leak.
- **Thin Composition Routes (`src/routes/`)**: SvelteKit routes simply orchestrate loaders, form actions, and widget layouts without bloated presentation markup.
- **Per-Request Bindings**: Concurrency-safe factory pattern ensures Cloudflare bindings (`platform.env.DB`, secrets) are cleanly scoped to the active request.
- **AI-First Context (`.ai/`)**: Provides comprehensive guidelines, coding standards, and architectural memory directly to coding agents.
