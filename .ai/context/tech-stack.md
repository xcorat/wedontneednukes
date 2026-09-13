# [ESTABLISHED] Tech Stack

Single-source dense reference. For deeper prose, see `docs/research/tech-stack.md` and ADRs in [`decisions.md`](decisions.md).

## Core Versions

| Layer | Tool | Version / Note |
|---|---|---|
| Framework | SvelteKit | 2.70.x (Svelte 3 is in RC) |
| Reactivity | Svelte 5 Runes (`$state`, `$derived`, `$props`, `$effect`, `untrack`) | 5.57.x |
| Runtime / Hosting | Cloudflare Workers (workerd V8) + Static Assets | `@sveltejs/adapter-cloudflare` |
| Database | Cloudflare D1 (SQLite) | via `drizzle-orm/d1` (schema-first) |
| ORM | Drizzle ORM | migrations in `drizzle/` |
| Auth | Better Auth | per-request factory; magic link + OAuth + 2FA plugin |
| UI primitives | shadcn-svelte (Bits UI v1) | **1.6.x** runes-native; uses `{#snippet}` not `<slot />` |
| Styling | Tailwind CSS v4 | CSS theme variables in `src/app.css` |
| Bot protection | Cloudflare Turnstile | tokens single-use, expire in 300s |
| Package manager | **pnpm** | 9.x or 10.x — **never npm / npx / bun** |

## Critical "DO NOT" List

- Do **NOT** use `@sveltejs/adapter-cloudflare-workers` or `adapter-auto`. Use `@sveltejs/adapter-cloudflare`.
- Do **NOT** use `npm create` or `npx sv create`. Always `pnpm dlx sv create`.
- Do **NOT** instantiate Better Auth / Drizzle as a static singleton. They are request-scoped via `platform.env`.
- Do **NOT** remove `pnpm.overrides.kysely` from `package.json` (`"kysely": "0.28.17"`). It is required for Better-Auth + D1 compatibility.

## Key Init Commands

```bash
# Initial project (only used once, in greenfield)
pnpm dlx sv create my-app --template minimal --types ts --add tailwindcss

# Add shadcn-svelte components
pnpm dlx shadcn-svelte@latest init
pnpm dlx shadcn-svelte@latest add button card

# Local dev
pnpm dev                    # vite + sveltekit + platformProxy

# Database
pnpm db:generate            # drizzle-kit generate
pnpm exec wrangler d1 migrations apply wedontneednukes-db --local
pnpm exec wrangler d1 migrations apply wedontneednukes-db --remote
pnpm db:studio              # optional inspection

# Validate
pnpm check                  # svelte-kit sync && svelte-check
pnpm test                   # node test runner on tests/*.test.ts (via tsx)
pnpm build                  # CF SSR + client bundles
```

## Cloudflare Adapter Configuration

`wrangler.jsonc` (preferred over `.toml` for JSON + comments). Configures D1 binding name (`DB`), KV, R2 buckets, custom domains.

`svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: { include: ['/*'], exclude: ['<all>'] },
      platformProxy: {
        configPath: 'wrangler.jsonc',
        environment: undefined,
        experimentalJsonConfig: false,
        persist: false
      }
    })
  }
};
export default config;
```

`platformProxy` emulates CF bindings (`env.DB`, `env.KV`, `env.BUCKET`, secrets) during `vite dev` using Wrangler + Miniflare. No real Cloudflare round-trip required for local development.

## Typings (`src/app.d.ts`)

`App.Platform.env` must declare:

- `DB` (D1 binding)
- `KV` (Workers KV binding) when in use
- `BUCKET` (R2 binding) when in use
- Secrets: `BETTER_AUTH_SECRET`, OAuth client IDs/secrets, TURNSTILE_*, `RESEND_API_KEY` (if used)

## Why pnpm over Bun — Short Version

Full reasoning: ADR-9 in [`decisions.md`](decisions.md). Summary:

- Workers runs on **workerd**, not Bun. Adapter + Miniflare rely on standard Node.js APIs and native bindings.
- `pnpm-lock.yaml` is auto-detected by Cloudflare's build pipeline.
- `pnpm.overrides` cannot be honored by `bun install`.

## Captcha Verification

Server-side: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with the token. In Svelte, reset the widget on form retry — wrap it in a `{#key}` block tied to a state value.
