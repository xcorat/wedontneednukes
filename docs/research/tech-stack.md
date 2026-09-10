# [RESEARCH / EXPLORATION] Tech Stack Research

This document outlines the technical stack chosen for the WeDoNotNeedNukes project.

## SvelteKit & Svelte
- **Svelte 5.57.x**: Utilizing the new Runes paradigm (`$state`, `$derived`, `$props`, `$effect`, `{#snippet}`) for reactive state management.
- **SvelteKit 2.70.x**: Current stable release (with SvelteKit 3 in RC).
- **CLI**: `npx sv create` replaces the older `npm create svelte@latest`.
- **Example Initialization**:
  ```bash
  npx sv create my-app --template minimal --types ts --add tailwindcss
  ```

## Cloudflare Deployment
- **Platform Strategy**: Pages + Workers converged in 2025. Workers with Static Assets is the recommended deployment strategy.
- **Adapter**: Use `@sveltejs/adapter-cloudflare` (NOT `adapter-cloudflare-workers` or `adapter-auto`).
- **Development**: The `platformProxy` in `svelte.config.js` emulates CF bindings (like D1, KV) during `vite dev`.
- **Configuration**: `wrangler.jsonc` is preferred over `.toml` for better JSON support and comments.
- **Example `svelte.config.js`**:
  ```javascript
  import adapter from '@sveltejs/adapter-cloudflare';
  import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

  /** @type {import('@sveltejs/kit').Config} */
  const config = {
    preprocess: vitePreprocess(),
    kit: {
      adapter: adapter({
        // See below for an explanation of these options
        routes: {
          include: ['/*'],
          exclude: ['<all>']
        },
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
- **Typings**: `app.d.ts` must be updated to type `App.Platform` properly, including `env.DB`, `env.KV`, and `env.BUCKET`.

## shadcn-svelte
- **Version**: 1.6.x (runes-native), built on top of Bits UI v1.
- **Setup**:
  ```bash
  npx shadcn-svelte@latest init
  npx shadcn-svelte@latest add button card
  ```
- **Usage**: Employs `{#snippet}` blocks instead of `<slot />`.
- **Configuration**: Generates `components.json` and configures necessary path aliases in `svelte.config.js` and `tsconfig.json`.

## Database Options

| Option | Pros & Description | Cons / Limitations |
| :--- | :--- | :--- |
| **Cloudflare D1** | **Native edge binding**, zero HTTP overhead, Drizzle ORM support, generous free tier (5M reads/day, 100K writes/day), Time Travel recovery. | Locked into CF ecosystem, serialized writes. |
| **Turso (libSQL)** | Distributed SQLite fork, HTTP/WebSocket client, multi-cloud portable. | Extra latency compared to native D1 bindings. |
| **Cloudflare KV** | High-read low-write key-value, eventually consistent. Good for sessions/cache. | Not suitable for relational data. |
| **PlanetScale** | Retired free tier (April 2024). | Requires CF Hyperdrive for external DB connections. |

## CAPTCHA Options
- **Cloudflare Turnstile** *(Recommended)*: Free, non-intrusive, privacy-preserving. Tokens are single-use and expire in 300s. Note: Need to reset the widget on form retry (use `{#key}` block in Svelte).
- **hCaptcha**: Alternative, also privacy-focused. Not free for high volume.
- **Server verification**: POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify`

## ORM: Drizzle
- **Driver**: `drizzle-orm/d1` specifically for Cloudflare D1.
- **Features**: Lightweight, type-safe, built-in migration support.
- **Approach**: Schema-first approach.

## Future Tech (Phase 2+)
- **P2P Layer**: IPFS, OrbitDB, GunJS for decentralized data sharing.
- **Crypto Voting**: Ethereum L2, Snapshot for verifiable community polls.
- **AI Integration**: Meme generation APIs.
- **Real-time**: Cloudflare Durable Objects for live pledge counts.
- **Search**: Cloudflare Vectorize.
- **AI Agents**: RAG agents for campaign Q&A and active community engagement.
