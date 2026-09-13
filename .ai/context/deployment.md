# [ESTABLISHED] Deployment & Runtime Configuration

Distilled from `docs/guides/deployment.md` and `docs/guides/local-dev.md`. Use this when wiring auth, env, or D1 migrations.

## Production Topology

- **Platform**: Cloudflare Workers + Static Assets via `@sveltejs/adapter-cloudflare`.
- **Configs**: `wrangler.jsonc` (preferred over `.toml`).
- **Production domain**: `https://wedontneednukes.org`.
- **Worker fallback**: `https://wedontneednukes.xcorat.workers.dev`.
- **D1 binding**: name `DB`, database ID `wedontneednukes-db`.

## Environment Variables & Secrets

| Variable | Type | Required | Notes |
|---|---|---|---|
| `BETTER_AUTH_URL` | Variable | Yes | `https://wedontneednukes.org` |
| `BETTER_AUTH_SECRET` | Secret (encrypted) | Yes | 32+ chars; signs session cookies |
| `GOOGLE_CLIENT_ID` | Variable / Secret | for Google | Google Cloud Console OAuth client |
| `GOOGLE_CLIENT_SECRET` | Secret (encrypted) | for Google | Google Cloud Console OAuth client |
| `FACEBOOK_APP_ID` | Variable / Secret | for Facebook | Meta developer app |
| `FACEBOOK_APP_SECRET` | Secret (encrypted) | for Facebook | Meta developer app |
| `FACEBOOK_BUSINESS_CONFIG_ID` | Variable | optional | Meta Business Login config |
| `GITHUB_CLIENT_ID` | Variable / Secret | for GitHub | GitHub OAuth app |
| `GITHUB_CLIENT_SECRET` | Secret (encrypted) | for GitHub | GitHub OAuth app |
| `TURNSTILE_SITE_KEY` | Variable | for Turnstile | public site key |
| `TURNSTILE_SECRET_KEY` | Secret (encrypted) | for Turnstile | server verification key |
| `RESEND_API_KEY` | Secret (encrypted) | optional | if email delivery is external |
| `EMAIL_FROM` | Variable | optional | e.g. `We Don't Need Nukes <noreply@wedontneednukes.org>` |

> **Important:** Adding/changing a Secret in the Cloudflare Dashboard does **not** update running Worker instances. Trigger a manual **Redeploy** (Deployments tab) or push a new build for changes to take effect.

## OAuth Callback URLs

Set in the OAuth provider's dashboard; format: `{base}/api/auth/callback/{provider}`.

| Provider | Production callback | Local callback |
|---|---|---|
| Google | `https://wedontneednukes.org/api/auth/callback/google` | `http://localhost:5173/api/auth/callback/google` |
| Facebook | `https://wedontneednukes.org/api/auth/callback/facebook` | `http://localhost:5173/api/auth/callback/facebook` |
| GitHub | `https://wedontneednukes.org/api/auth/callback/github` | (provider has single callback URL; use prod) |

Google additionally requires Authorized JavaScript origins: `https://wedontneednukes.org`, `http://localhost:5173`.

## Local Development

```bash
# Bootstrap
git clone https://github.com/xcorat/wedontneednukes.git
cd wedontneednukes
pnpm install
cp .env.example .dev.vars          # then fill in dev keys
pnpm dev                           # http://localhost:5173
```

`.dev.vars` populates `platform.env` via Wrangler Miniflare. `BETTER_AUTH_URL` in dev = `http://localhost:5173`.

Validation gates before commit:

```bash
pnpm check    # svelte-kit sync && svelte-check
pnpm build    # CF SSR + client bundles
pnpm test     # node test runner on tests/*.test.ts
```

## D1 Migrations

Schema in `drizzle/`. Generate, then apply.

```bash
pnpm db:generate                                       # drizzle-kit generate from src/lib/server/db/schema.ts
pnpm exec wrangler d1 migrations apply wedontneednukes-db --local
pnpm exec wrangler d1 migrations apply wedontneednukes-db --remote
pnpm db:studio                                         # optional inspection
```

## Manual Deploys (CLI)

```bash
pnpm build                                # SvelteKit bundle for CF
pnpm exec wrangler deploy                 # Worker + static assets
```

## Adding a New Provider

1. Add `CLIENT_ID` / `CLIENT_SECRET` variables to Cloudflare (and `.env.example` / `.dev.vars`).
2. Register the provider in `src/lib/server/auth/index.ts` inside the `getAuth(platform.env)` factory using Better Auth's `socialProviders` config.
3. Add OAuth callback URL to the provider's console (`/api/auth/callback/<provider>`).
4. Update the table above.
