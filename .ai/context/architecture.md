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
- **`JoinFormWidget`**: Magic link email input, Cloudflare Turnstile verification, confirmation view, 4 OAuth buttons (Google, GitHub, Facebook, Twitter), and anonymous continuation.
- **`PledgeFormWidget`**: Multi-select commitment tiers (`passive`, `active`, `direct`) with interactive tooltips, expandable feedback notes, progressive enhancement submit (`use:enhance`), and skip link.
- **`ResultsWidget`**: Animated Agree vs Other distribution bars, total counts, percentages, and personalized "You" stance badge.
- **`ClaimVoteBanner`**: Prompt for anonymous voters to claim and link their pledge with inline quick sign-in.
- **`StepHeaderWidget`**: Standardized top bar providing back navigation, stance badge (`🕊️ No, we don't` / `🤔 Yes, we do`), `FundraiserButton`, and `MenuButton`.

Top-level routes (`/`, `/auth`, `/pledge`, `/results`) serve as lean composition shells around these widgets.

## Anonymous Identity & Vote Claiming Strategy
1. **HTTP-only Cookie (`anon_id`)**: On first anonymous interaction, an `anon_id` cookie (UUIDv4) is issued with `HttpOnly`, `SameSite=Lax`, and `Max-Age=1 year`.
2. **Server-Side Rendering (SSR)**: `+page.server.ts` loaders check for `anon_id` to immediately recognize returning anonymous voters without visual flicker.
3. **Vote Claiming**: When an anonymous user signs in or registers, their existing pledges where `anon_id = :anonId` are updated to associate with `user_id = user.id`, seamlessly preserving their vote and pledge history.

## Authentication & Security
- **Per-Request Factory**: In Cloudflare Workers, bindings are injected per request. Auth is instantiated via `getAuth(platform.env)` using Better Auth.
- **Authentication Methods**: One-time email magic links and multi-provider social OAuth (Google, GitHub, Facebook, Twitter/X).
- **Two-Factor Authentication (2FA)**: Native TOTP / backup codes support via Better Auth two-factor plugin (`/auth/two-factor`).
- **Bot Protection**: Cloudflare Turnstile token validation protects email dispatch and anonymous submission endpoints.
- **Account & Security Settings**: Self-service profile management, active session device tracking, and safe social account unlinking rules.

## Dynamic Theme Runtime
- Managed by `src/lib/theme.svelte.ts` utilizing Svelte 5 runes and localStorage persistence.
- Modifies `data-theme` on `document.documentElement` (`game`, `compact`, `flat`, `dark`, or default neo-brutalist `:root`).
- Controlled globally via `ThemeSwitcher.svelte` and Tailwind CSS v4 variables.

## Progressive Engagement Funnel
1. **Hero**: Quick premise engagement ("Agree" vs "We do | Not sure").
2. **Join / Authenticate**: Magic link, OAuth, or anonymous skip.
3. **Pledge**: Multi-tier commitment selection (`passive`, `active`, `direct`) with optional comments.
4. **Results**: Live community distribution stats with personal marker and claim banner for guests.
5. **Dashboard & Actions**: Post-pledge engagement, profile customization, and sharing tools.

## Future Extension Points
- **Gated Questions Engine**: Dynamic question trees unlocking follow-up inquiries based on prior responses.
- **P2P Data Layer**: Moving from central DB to decentralized pledge proofs.
- **Crypto Voting**: On-chain verifiable commitments.
- **AI / Durable Objects**: Using Cloudflare Durable Objects for real-time live consensus counters and campaign agents.
