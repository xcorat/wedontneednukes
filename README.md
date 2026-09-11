# We Don't Need Nukes

> **Live Production**: [https://wedontneednukes.org](https://wedontneednukes.org)

An edge-native, participatory campaign platform for nuclear disarmament. Built on SvelteKit 2 (Svelte 5 Runes), Cloudflare Workers, Cloudflare D1, and Better Auth.

## Tech Stack

- **Framework**: [SvelteKit 2](https://svelte.dev) with [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- **Runtime & Hosting**: [Cloudflare Workers](https://workers.cloudflare.com) with Static Assets (`@sveltejs/adapter-cloudflare`)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) with [Drizzle ORM](https://orm.drizzle.team)
- **Auth**: [Better Auth](https://better-auth.com) (Magic link, Google, GitHub, and Anonymous pledges)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)

## Developing

1. Copy `.env.example` to `.dev.vars`:
   ```sh
   cp .env.example .dev.vars
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Start development server:
   ```sh
   pnpm dev
   ```

## Documentation

Full architectural documentation, guides, and roadmaps are in [`docs/`](docs/README.md):

- [Deployment Guide](docs/guides/deployment.md)
- [Local Development Guide](docs/guides/local-dev.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Campaign Strategy](docs/campaigns/nukes/strategy.md)

