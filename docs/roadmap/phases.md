# [ESTABLISHED] Roadmap Phases

## Phase 0: Documentation & Architecture (COMPLETED)
- [x] Project structure setup and documentation framework.
- [x] AI agent context files (`.ai/AGENTS.md`, `architecture.md`, `conventions.md`, `decisions.md`).
- [x] Architectural Decision Records (ADRs 1–13).
- [x] Defining the pledge flow engine and gated questions concepts.

## Phase 1: Foundation & Modularization (ACTIVE)
- [x] **Scaffold**: SvelteKit 2 on Cloudflare Workers (`@sveltejs/adapter-cloudflare`).
- [x] **Design & Themes**: Neo-brutalist styling with runtime theme switching (`src/lib/theme.svelte.ts`, Tailwind v4).
- [x] **Auth**: Better Auth per-request factory (`getAuth(platform.env)`), email magic links, 2FA (`/auth/two-factor`), social logins (Google, GitHub, Facebook, Twitter/X).
- [x] **Bot Mitigation**: Cloudflare Turnstile token validation for auth and anonymous pledges.
- [x] **Database**: Cloudflare D1 with Drizzle ORM schemas (`user`, `session`, `account`, `campaign`, `pledge`).
- [x] **Modular Widgets**: Independent, composable widgets under `src/lib/components/widgets/` (`QuestionHeroWidget`, `JoinFormWidget`, `PledgeFormWidget`, `ResultsWidget`, `ClaimVoteBanner`, `StepHeaderWidget`).
- [x] **Anonymous Support**: HTTP-only `anon_id` cookie tracking and atomic vote claiming into `user_id`.
- [x] **Knowledge Base & Wiki**: SSR wiki/FAQ at `/wiki` + `/wiki/faq/<slug>` with scoped theming.
- [x] **About & Legal Compliance**: `/about`, `/legal/terms`, and `/legal/privacy` with OAuth standard redirects and consent disclosure.
- [x] **Social Sharing & Official Channels**: Embeddable `SocialShareWidget` with one-click intents (X, Bluesky, Threads, Facebook, WhatsApp, LinkedIn), copy-link clipboard button, official profile links (Facebook, X, Bluesky, TikTok), top-bar `ShareButton` popover, and Helper AI Bot indicator (`BotButton`).
- [x] **Dedicated 4-Step Onboarding Funnel**: Standalone progression routes (`/` hero, `/onboarding/pledge`, `/onboarding/join`, `/onboarding/results`).
- [x] **Public Results & Transparency Stream**: Aggregated distribution stats at `/results` and paginated public voting feed at `/results/votes` with zero-leakage privacy for private and guest voters.
- [x] **AI Research Grounding Assistant**: Full RAG pipeline using OpenAI Responses API (`gpt-5-nano` + `file_search` over 12 ingested reference documents), SSE streaming `/api/chat`, dedicated `/assistant` page, and `/wiki` slide-over drawer (`ChatDrawer`).
- [ ] **Gated Questions Schema**: Migrating from single pledge table to dynamic question tree (`question`, `question_option`, `question_gate`, `user_response`).

## Phase 2: Community & Growth
- **Content Upload**: Integrate R2 for user-generated content (memes, videos).
- **Curation**: Voting and curation mechanisms for community content.
- **Wiki**: Editable FAQ wiki system.
- **Social**: Enhanced social sharing analytics, dynamic quote cards, and downloadable banners.
- **AI Features**: AI meme generator.
- **Expansion**: Add additional campaigns using the modular engine.

## Phase 3: Decentralization & Scale
- **P2P Data Layer**: Explore IPFS/OrbitDB integration.
- **Crypto Pledges**: Cryptographically verified pledges.
- **Governance**: Voting mechanisms for platform governance.
- **Infrastructure**: Implement Durable Objects for real-time features.
- **Federation**: Decentralized campaign federation.
- **Mobile Application**: Native mobile app experience.
