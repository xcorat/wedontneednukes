# [ESTABLISHED] Local Development Guide

This guide covers setting up, running, and developing the **We Don't Need Nukes** project locally.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher (`node -v`)
- **pnpm**: `v9.x` or `v10.x` (`pnpm -v`) — **Do not use npm or Bun**
- **Cloudflare Account & Wrangler CLI**: For remote bindings, though local development uses local Miniflare D1 emulation.

---

## 2. Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/xcorat/wedontneednukes.git
   cd wedontneednukes
   ```

2. **Install dependencies using pnpm**:
   ```bash
   pnpm install
   ```

3. **Configure local environment variables**:
   ```bash
   cp .env.example .dev.vars
   ```
   Fill in `.dev.vars` with any local test keys (e.g., `BETTER_AUTH_SECRET`, Google/GitHub credentials, Turnstile keys).

---

## 3. Database & Migrations (Local D1)

The application uses Cloudflare D1 with Drizzle ORM. Local development uses Miniflare's local SQLite persistence.

```bash
# Generate migration SQL files after changing src/lib/server/db/schema.ts
pnpm db:generate

# Apply migrations to local Miniflare D1
pnpm exec wrangler d1 migrations apply wedontneednukes-db --local

# Inspect local database via Drizzle Studio (optional)
pnpm db:studio
```

---

## 4. Running the Development Server

Start Vite with SvelteKit and the Cloudflare `platformProxy`:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`. `platformProxy` simulates Cloudflare bindings (`env.DB`, `env.EMAIL`) locally using Wrangler.

---

## 5. Automated Testing & Verification

Before committing or pushing changes, run the automated verification suite:

```bash
# Run all unit and integration tests (Node.js test runner)
pnpm test

# Run Svelte & TypeScript diagnostic check
pnpm check

# Build production bundle (includes wiki manifest generation)
pnpm build
```

---

## 6. Content & AI Ingestion Scripts

```bash
# Rebuild the static wiki manifest from static/wiki/faq/*.md
pnpm manifest

# Ingest/update reference PDFs in downloads/ to the OpenAI Vector Store
pnpm run ingest:docs
```
