# [RESEARCH / EXPLORATION] Folder Structure

This document outlines the proposed directory structure for the WeDoNotNeedNukes project.

## Directory Tree

```
wedontneednukes/
├── .ai/                          # AI-first development context
│   ├── AGENTS.md                 # Master agent instructions
│   ├── context/                  # Shared context for all agents
│   │   ├── architecture.md
│   │   ├── conventions.md
│   │   ├── glossary.md
│   │   └── decisions.md
│   ├── prompts/                  # Reusable prompt templates
│   │   ├── feature.md
│   │   ├── bugfix.md
│   │   └── review.md
│   └── tools/
│       └── mcp.json
│
├── docs/                         # Human & AI documentation
│   ├── README.md
│   ├── CONTRIBUTING.md
│   ├── architecture/
│   │   ├── overview.md
│   │   └── pledge-engine.md
│   ├── campaigns/nukes/
│   │   ├── pledge-flow.md
│   │   ├── faq-content.md
│   │   └── copy.md
│   ├── design/
│   │   ├── design-system.md
│   │   └── user-flows.md
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
│   ├── app.css
│   ├── app.d.ts                  # App.Platform (D1, KV, R2), App.Locals
│   ├── hooks.server.ts           # Auth session, request lifecycle
│   │
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn-svelte primitives
│   │   │   ├── layout/           # Shell, nav, footer
│   │   │   └── common/           # Counter, ProgressBar, ShareButton
│   │   │
│   │   ├── features/             # Domain feature modules
│   │   │   ├── pledge/
│   │   │   │   ├── components/
│   │   │   │   ├── engine/       # State machine + flow definitions
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── engine.ts
│   │   │   │   │   ├── loader.ts
│   │   │   │   │   └── flows/
│   │   │   │   │       └── nukes.json
│   │   │   │   ├── stores.ts
│   │   │   │   └── index.ts
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── stores.ts
│   │   │   │   └── index.ts
│   │   │   ├── content/
│   │   │   │   ├── components/
│   │   │   │   ├── stores.ts
│   │   │   │   └── index.ts
│   │   │   ├── faq/
│   │   │   │   ├── components/
│   │   │   │   └── index.ts
│   │   │   └── campaign/
│   │   │       ├── stores.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── server/               # Server-only (SvelteKit enforced)
│   │   │   ├── db/
│   │   │   │   ├── index.ts      # DB factory
│   │   │   │   ├── types.ts      # Repository interfaces
│   │   │   │   ├── schema.ts     # Drizzle schema
│   │   │   │   ├── client.ts     # Drizzle D1 client factory
│   │   │   │   ├── adapters/     # d1.ts, turso.ts, memory.ts
│   │   │   │   └── repositories/ # pledge.ts, user.ts, campaign.ts, content.ts, faq.ts
│   │   │   ├── auth/
│   │   │   │   ├── index.ts      # betterAuth factory
│   │   │   │   └── providers.ts
│   │   │   ├── turnstile.ts
│   │   │   └── services/         # pledge.ts, campaign.ts, content.ts, analytics.ts
│   │   │
│   │   ├── config/               # campaigns.ts, theme.ts, constants.ts
│   │   └── utils/                # cn.ts, share.ts, format.ts, validation.ts
│   │
│   └── routes/                   # Thin composition layer
│       ├── +layout.svelte
│       ├── +layout.server.ts
│       ├── +page.svelte
│       ├── +error.svelte
│       ├── campaign/[slug]/
│       │   ├── +page.svelte
│       │   ├── +page.server.ts
│       │   ├── auth/+page.svelte
│       │   ├── pledge/+page.svelte
│       │   ├── actions/+page.svelte
│       │   ├── faq/+page.svelte
│       │   ├── faq/[topic]/+page.svelte
│       │   └── stats/+page.svelte
│       ├── about/
│       │   ├── +page.svelte
│       │   ├── mission/+page.svelte
│       │   ├── privacy/+page.svelte
│       │   └── support/+page.svelte
│       └── api/
│           ├── auth/[...betterauth]/+server.ts
│           ├── pledge/+server.ts
│           ├── pledge/stats/+server.ts
│           ├── content/+server.ts
│           ├── campaign/+server.ts
│           └── captcha/+server.ts
│
├── static/                       # favicon.svg, og-image.png, fonts/
├── tests/                        # unit/, integration/, e2e/
├── drizzle/                      # migrations/
├── .github/
│   ├── ISSUE_TEMPLATE/           # feature.md, bug.md, content.md
│   └── workflows/                # ci.yml, deploy.yml
│
├── svelte.config.js
├── tailwind.config.js
├── drizzle.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── wrangler.jsonc
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.cjs
├── LICENSE
└── README.md
```

## Structural Decisions & Rationale

- **Feature-Driven Architecture (`src/lib/features/`)**: Organizing by domain (pledge, auth, content, faq) rather than by type (components, stores) makes it easier to reason about self-contained modules.
- **Server Boundary (`src/lib/server/`)**: SvelteKit strictly enforces that this directory cannot be imported into client-side code, preventing accidental leaks of secrets, database credentials, or server-only dependencies.
- **Thin Routes (`src/routes/`)**: SvelteKit routes simply compose the logic provided by `src/lib`. Controllers, data access, and core logic live in `lib/features` or `lib/server`, making testing easier and reducing duplication.
- **AI-First Context (`.ai/`)**: Crucial for AI agent workflows, providing centralized memory and instructions without polluting standard documentation.
