# [ESTABLISHED] Architecture Overview

## System Layers
- **Client (Svelte 5 SPA)**: Rich, reactive UI powered by runes. Feature-oriented structure.
- **Edge (CF Workers)**: Server-side rendering, API routing, and SSR logic via SvelteKit on Cloudflare Workers.
- **Data (D1/R2/KV)**: 
  - **D1 (SQLite)**: Primary operational database.
  - **R2**: Object storage for community media (memes, videos).
  - **KV**: Edge caching for fast config delivery and simple state.

## The Pledge Flow Engine Concept
Pledge flows are modeled as directed graphs stored in JSON, traversed by a client-side state machine engine. This allows new campaigns or branching changes without code deployment. 

## Repository Pattern and DB Abstraction
Database interactions occur via typed Repository interfaces located in `src/lib/server/repositories/`. A runtime adapter logic injects the correct database connection (D1, Turso, or Memory), preventing tight coupling to Cloudflare specifics in core business logic.

## Auth Flow: Better Auth Per-Request Factory
Cloudflare Workers inject bindings per request via `platform.env`. Static singleton exports fail here. Auth is instantiated per-request using `getAuth(platform.env)` wrapped with Better Auth.

## Progressive Engagement Funnel
1. **Landing**: Anonymous, community-curated memes/content.
2. **Content**: User interacts with media, leading to pledge prompt.
3. **Auth**: Social login or Anonymous + Turnstile CAPTCHA.
4. **Pledge**: Branching flow answering commitment levels.
5. **Actions**: Post-pledge action pages with social sharing.

## Future Extension Points
- **P2P Data Layer**: Moving from central DB to decentralized pledge proofs.
- **Crypto Voting**: On-chain verifiable commitments.
- **AI / Durable Objects**: Using DO for real-time collaboration or RAG campaign agents.
