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
| `FACEBOOK_APP_ID` | Variable / Secret | Meta App ID from Meta Developer Dashboard | For Facebook Auth |
| `FACEBOOK_APP_SECRET` | Secret (Encrypted) | Meta App Secret from Meta Developer Dashboard | For Facebook Auth |
| `FACEBOOK_BUSINESS_CONFIG_ID` | Variable | Optional Meta Business Login Configuration ID | Optional |
| `GITHUB_CLIENT_ID` | Variable / Secret | OAuth App Client ID from GitHub | For GitHub Auth |
| `GITHUB_CLIENT_SECRET` | Secret (Encrypted) | OAuth App Client Secret from GitHub | For GitHub Auth |
| `TWITTER_CLIENT_ID` | Variable / Secret | OAuth 2.0 Client ID from X / Twitter Developer Portal | For Twitter Auth |
| `TWITTER_CLIENT_SECRET` | Secret (Encrypted) | OAuth 2.0 Client Secret from X / Twitter Developer Portal | For Twitter Auth |
| `TURNSTILE_SITE_KEY` | Variable | Cloudflare Turnstile public site key | For bot protection |
| `TURNSTILE_SECRET_KEY` | Secret (Encrypted) | Cloudflare Turnstile secret key | For bot protection |
| `OPENAI_API_KEY` | Secret (Encrypted) | OpenAI API key (`sk-...`) for AI Assistant | For AI Assistant |
| `OPENAI_VECTOR_STORE_ID` | Variable | Vector store ID (e.g. `vs_...`) generated via `pnpm run ingest:docs` | For AI Assistant |
| `OPENAI_MODEL` | Variable | Model identifier (defaults to `gpt-5-nano`) | Optional |
| `RESEND_API_KEY` | Secret (Encrypted) | Resend API key (if using external mail delivery) | Optional |
| `EMAIL_FROM` | Variable | e.g. `We Don't Need Nukes <noreply@wedontneednukes.org>` | Optional |

> [!IMPORTANT]
> **Applying Secrets to Active Deployments:**
> Whenever you add or update secrets in Cloudflare Dashboard, Cloudflare does **not** update already running Worker instances automatically. You must trigger a **Redeploy** (under the **Deployments** tab) or deploy a new build for changes to take effect.
>
> You can also set secrets directly via Wrangler CLI:
> ```bash
> pnpm exec wrangler secret put OPENAI_API_KEY
> ```

---

## 4. AI Assistant Knowledge Base Ingestion

The AI Assistant queries a pre-indexed vector store in OpenAI. Before running the assistant in production:

1. Ingest the reference PDFs from `downloads/`:
   ```bash
   pnpm run ingest:docs
   ```
2. Copy the resulting `vs_...` vector store ID and configure it as `OPENAI_VECTOR_STORE_ID` in `wrangler.jsonc` (or via Cloudflare Dashboard).

---

## 5. OAuth Configuration for `wedontneednukes.org`

### Google OAuth
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
* **Authorized JavaScript origins**:
  * `https://wedontneednukes.org`
  * `http://localhost:5173` *(local dev)*
* **Authorized redirect URIs**:
  * `https://wedontneednukes.org/api/auth/callback/google`
  * `http://localhost:5173/api/auth/callback/google` *(local dev)*

### Facebook / Meta OAuth
In [Meta Developer Dashboard](https://developers.facebook.com/apps/):
* Under **Facebook Login** → **Settings**:
  * **Valid OAuth Redirect URIs**:
    * `https://wedontneednukes.org/api/auth/callback/facebook`
    * `http://localhost:5173/api/auth/callback/facebook` *(local dev)*
* While in **Development Mode**, add testers under **App roles** ➔ **Roles** ➔ **Add Testers** (enter your personal Facebook account username/ID and accept the invite).

### GitHub OAuth
In [GitHub Developer Settings](https://github.com/settings/developers):
* **Homepage URL**: `https://wedontneednukes.org`
* **Authorization callback URL**:
  * `https://wedontneednukes.org/api/auth/callback/github`

### X / Twitter OAuth 2.0
In [X / Twitter Developer Portal](https://developer.x.com/en/portal/dashboard):
* **Callback / Redirect URL**:
  * `https://wedontneednukes.org/api/auth/callback/twitter`
  * `http://localhost:5173/api/auth/callback/twitter` *(local dev)*

---

## 6. D1 Database & Migrations

The D1 database is managed using Drizzle ORM:

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations locally (for testing against local SQLite/Miniflare)
pnpm exec wrangler d1 migrations apply wedontneednukes-db --local

# Apply migrations to remote production D1
pnpm exec wrangler d1 migrations apply wedontneednukes-db --remote
```

---

## 7. Manual Deployments via CLI

To build and deploy the Worker directly using Wrangler:

```bash
# 1. Build SvelteKit bundle for Cloudflare
pnpm build

# 2. Deploy Worker and static assets
pnpm exec wrangler deploy
```

---

## 8. Session Revocation & Logout Route

The platform provides a centralized session termination endpoint at `/auth/logout` (supporting both `GET` and `POST` methods). It revokes all active session cookies and executes an HTTP `303 See Other` redirect back to the home route. In production, ensure no edge caching rules cache this endpoint.
