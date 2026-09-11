# [ESTABLISHED] Deployment Guide

The production application is deployed on Cloudflare Workers at **`https://wedontneednukes.org`**.

---

## 1. Architecture & Hosting

- **Platform**: Cloudflare Workers with static asset bindings (`@sveltejs/adapter-cloudflare`).
- **Configuration**: [`wrangler.jsonc`](../../wrangler.jsonc)
- **Production Domain**: `https://wedontneednukes.org`
- **Fallback Worker Domain**: `https://wedontneednukes.xcorat.workers.dev`
- **Database**: Cloudflare D1 (`wedontneednukes-db`, binding: `DB`)

---

## 2. Custom Domain Configuration

The custom domain `wedontneednukes.org` is attached directly to the Worker:

1. In Cloudflare Dashboard: **Workers & Pages** → **`wedontneednukes`** → **Settings** → **Domains & Routes**.
2. Click **Add** → **Custom Domain**.
3. Enter `wedontneednukes.org` (and optionally `www.wedontneednukes.org`).
4. Cloudflare automatically handles DNS routing and SSL/TLS certificate provisioning.

---

## 3. Environment Variables & Secrets

Configure the following variables in the Cloudflare Dashboard (**Workers & Pages → `wedontneednukes` → Settings → Variables and Secrets**):

| Variable Name | Type | Value / Description | Required |
|---|---|---|---|
| `BETTER_AUTH_URL` | Variable | `https://wedontneednukes.org` | Yes |
| `BETTER_AUTH_SECRET` | Secret (Encrypted) | 32+ character random string for signing session cookies | Yes |
| `GOOGLE_CLIENT_ID` | Variable / Secret | OAuth 2.0 Client ID from Google Cloud Console | For Google Auth |
| `GOOGLE_CLIENT_SECRET` | Secret (Encrypted) | OAuth 2.0 Client Secret from Google Cloud Console | For Google Auth |
| `GITHUB_CLIENT_ID` | Variable / Secret | OAuth App Client ID from GitHub | For GitHub Auth |
| `GITHUB_CLIENT_SECRET` | Secret (Encrypted) | OAuth App Client Secret from GitHub | For GitHub Auth |
| `TURNSTILE_SITE_KEY` | Variable | Cloudflare Turnstile public site key | For bot protection |
| `TURNSTILE_SECRET_KEY` | Secret (Encrypted) | Cloudflare Turnstile secret key | For bot protection |
| `RESEND_API_KEY` | Secret (Encrypted) | Resend API key (if using external mail delivery) | Optional |
| `EMAIL_FROM` | Variable | e.g. `We Don't Need Nukes <noreply@wedontneednukes.org>` | Optional |

> [!IMPORTANT]
> **Applying Secrets to Active Deployments:**
> Whenever you add or update secrets in Cloudflare Dashboard, Cloudflare does **not** update already running Worker instances automatically. You must trigger a **Redeploy** (under the **Deployments** tab) or deploy a new build for changes to take effect.

---

## 4. OAuth Configuration for `wedontneednukes.org`

### Google OAuth
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
* **Authorized JavaScript origins**:
  * `https://wedontneednukes.org`
  * `http://localhost:5173` *(local dev)*
* **Authorized redirect URIs**:
  * `https://wedontneednukes.org/api/auth/callback/google`
  * `http://localhost:5173/api/auth/callback/google` *(local dev)*

### GitHub OAuth
In [GitHub Developer Settings](https://github.com/settings/developers):
* **Homepage URL**: `https://wedontneednukes.org`
* **Authorization callback URL**:
  * `https://wedontneednukes.org/api/auth/callback/github`

---

## 5. D1 Database & Migrations

The D1 database is managed using Drizzle ORM:

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations locally (for testing against local SQLite/Miniflare)
npx wrangler d1 migrations apply wedontneednukes-db --local

# Apply migrations to remote production D1
npx wrangler d1 migrations apply wedontneednukes-db --remote
```

---

## 6. Manual Deployments via CLI

To build and deploy the Worker directly using Wrangler:

```bash
# 1. Build SvelteKit bundle for Cloudflare
npm run build

# 2. Deploy Worker and static assets
npx wrangler deploy
```
