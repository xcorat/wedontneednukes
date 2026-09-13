# [ESTABLISHED] Glossary

- **Campaign**: A cause-specific pledge effort (e.g., "nukes"). Campaigns are plugins to the platform.
- **Pledge**: A user's recorded commitment on a campaign. Contains branching responses.
- **Pledge Flow**: A directed graph (JSON) defining the branching question tree for a campaign.
- **Flow Node**: A single screen/step in a pledge flow. Contains choices.
- **Flow Edge**: A connection from a choice to the next node. Defines branching.
- **Commitment Level**: The depth of a user's pledge (passive, active, direct action).
- **Content**: Community-generated media (memes, videos, images) displayed on campaign landing.
- **FAQ Entry**: A wiki-like Q&A linked to specific pledge steps. Community-editable (Phase 2).
- **Action Page**: Post-pledge pages suggesting further engagement.
- **Anonymous Pledge**: A pledge made without social login, verified via Turnstile captcha and tracked by `anon_id`.
- **Platform**: Cloudflare's runtime environment injected per-request (`platform.env.DB`, etc.).
- **Repository**: A typed interface for database operations, abstracting the underlying adapter.
- **Adapter**: A concrete DB implementation (D1, Turso, Memory) behind the repository interface.
- **Widget**: A self-contained, reusable UI component located in `src/lib/components/widgets/` that encapsulates layout, data-binding, and form interactions for a specific user flow step.
- **Vote Claiming**: The process of atomically updating anonymous pledges (`anon_id`) to associate with an authenticated `user_id` when an anonymous user logs in or registers.
- **Theme Engine**: The client-side runes store (`src/lib/theme.svelte.ts`) that manages dynamic themes by toggling `data-theme` attributes and CSS variables.
- **Two-Factor Authentication (2FA)**: TOTP / authenticator app second-factor protection implemented via Better Auth two-factor plugin.
- **Turnstile Token**: Cloudflare Turnstile bot verification token sent via `cf-turnstile-response` header or request body to protect endpoints against automated spam.

