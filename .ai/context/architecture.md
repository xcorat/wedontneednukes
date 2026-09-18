# [ESTABLISHED] Architecture Overview

## System Layers
- **Client (Svelte 5 + Runes)**: Rich, reactive UI powered by runes (`$state`, `$derived`, `$props`, `$effect`, `untrack`). Modular independent widgets in `src/lib/components/widgets/`.
- **Edge (Cloudflare Workers)**: Server-side rendering (SSR), API endpoints, and form actions via SvelteKit (`@sveltejs/adapter-cloudflare`).
- **Data (D1 / R2 / KV)**: 
  - **D1 (SQLite)**: Primary relational database via Drizzle ORM (`user`, `session`, `account`, `campaign`, `pledge`).
  - **R2**: Object storage for community media (memes, campaign visuals).
  - **KV**: Edge caching for fast config and rate-limiting.

## Component Layer: Modular Independent Widgets
UI forms and page sections are decoupled into independent widgets under `src/lib/components/widgets/`:
- **`QuestionHeroWidget`**: Iconic hero premise ("We don't need Nukes !"), "Why?" link, and Agree / Other action buttons.
- **`PledgeFormWidget`**: Multi-select commitment tiers (`passive`, `active`, `direct`) with interactive tooltips, expandable feedback notes, progressive enhancement submit (`use:enhance`), and skip link.
- **`JoinFormWidget`**: Magic link email input, Cloudflare Turnstile verification, confirmation view, 4 OAuth buttons (Google, GitHub, Facebook, Twitter), and anonymous continuation.
- **`ResultsWidget`**: Animated Agree vs Other distribution bars, total counts, percentages, and personalized "You" stance badge.
- **`ClaimVoteBanner`**: Prompt for anonymous voters to claim and link their pledge with inline quick sign-in.
- **`SocialShareWidget`**: Multi-channel share intents (X, Bluesky, Threads, Facebook, WhatsApp, LinkedIn) and copy-link clipboard utility.
- **`ResearchChatWidget`**: Grounded AI chat feed with SSE streaming, markdown rendering, citations drawer, starter inquiries, and active send button.
- **`ChatDrawer`**: Floating wiki action button (`🤖 Ask Questions`) and slide-over panel with unauthenticated login guidance.
- **`StepHeaderWidget`**: Standardized top bar providing back navigation, stance badge (`🕊️ No, we don't` / `🤔 Yes, we do`), `FundraiserButton`, and `MenuButton`.

Top-level routes (`/`, `/onboarding/*`, `/results`, `/results/votes`, `/assistant`, `/wiki/*`, `/dashboard`, `/profile`) serve as lean composition shells around these widgets.

## AI Assistant & Research Grounding Engine
- **Engine**: OpenAI Responses API with `gpt-5-nano` (`ENFORCED_MODEL`) and `file_search` tool grounded in 12 authoritative nuclear peace documents.
- **Ingestion**: Offline CLI script (`pnpm run ingest:docs`) uploads PDFs in `downloads/` to OpenAI vector store (`OPENAI_VECTOR_STORE_ID`).
- **Edge Endpoint**: `/api/chat` (`+server.ts`) handles SSE streaming (`text/event-stream`) and JSON fallback, gated to authenticated users (`locals.user`).
- **Client Reactivity**: Subscribes to SvelteKit's `$app/stores` (`$page.data.user`).
- **UI Targets**: Dedicated research library at `/assistant` and slide-over drawer (`ChatDrawer`) scoped to `/wiki` routes.
- **Copy**: Title `"We dont need nukes!"`, subtext `"Ask why, how and what we can do as part of the larger global community of nuclear disarmamant community."`, placeholder `"Ask away..."`.

## Anonymous Identity & Vote Claiming Strategy
1. **HTTP-only Cookie (`anon_id`)**: On first anonymous interaction, an `anon_id` cookie (UUIDv4) is issued with `HttpOnly`, `SameSite=Lax`, and `Max-Age=1 year`.
2. **Server-Side Rendering (SSR)**: `+page.server.ts` loaders check for `anon_id` to immediately recognize returning anonymous voters without visual flicker.
3. **Vote Claiming**: When an anonymous user signs in or registers, their existing pledges where `anon_id = :anonId` are updated to associate with `user_id = user.id`, seamlessly preserving their vote and pledge history.

## Authentication & Security
- **Per-Request Factory**: In Cloudflare Workers, bindings are injected per request. Auth is instantiated via `getAuth(platform.env)` using Better Auth.
- **Authentication Methods**: One-time email magic links and multi-provider social OAuth (Google, GitHub, Facebook, Twitter/X).
- **Two-Factor Authentication (2FA)**: Native TOTP / backup codes support via Better Auth two-factor plugin (`/auth/two-factor`).
- **Session Revocation**: Centralized `/auth/logout` endpoint wiping all session cookies with 303 redirect.
- **Bot Protection**: Cloudflare Turnstile token validation protects email dispatch and anonymous submission endpoints.
- **Account & Security Settings**: Self-service profile management, active session device tracking, and safe social account unlinking rules.

## Dynamic Theme Runtime
- Managed by `src/lib/theme.svelte.ts` utilizing Svelte 5 runes and localStorage persistence.
- Modifies `data-theme` on `document.documentElement` (`game`, `compact`, `flat`, `dark`, or default neo-brutalist `:root`).
- Controlled globally via `ThemeSwitcher.svelte` and Tailwind CSS v4 variables.

## Progressive Engagement Funnel
1. **Step 1 · Hero (`/`)**: Quick premise engagement ("Agree" -> `/onboarding/pledge?answer=no`, "Other" -> `/onboarding/join?answer=yes`).
2. **Step 2 · Pledge (`/onboarding/pledge`)**: Multi-tier commitment selection (`passive`, `active`, `direct`) with optional comments.
3. **Step 3 · Join / Record (`/onboarding/join`)**: Magic link, OAuth, or anonymous skip.
4. **Step 4 · Results Hub (`/onboarding/results`)**: Live community distribution stats, claim banner for guests, social sharing, and What's Next hub with `AskUsButton`.
5. **Dashboard & Community (`/dashboard`, `/results`, `/assistant`)**: Post-pledge engagement, public voting stream, profile customization, and AI research grounding.

## Future Extension Points
- **Gated Questions Engine**: Dynamic question trees unlocking follow-up inquiries based on prior responses.
- **P2P Data Layer**: Moving from central DB to decentralized pledge proofs.
- **Crypto Voting**: On-chain verifiable commitments.
- **AI / Durable Objects**: Using Cloudflare Durable Objects for real-time live consensus counters and campaign agents.
