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
- **Anonymous Pledge**: A pledge made without social login, verified via Turnstile captcha.
- **Platform**: Cloudflare's runtime environment injected per-request (`platform.env.DB`, etc.).
- **Repository**: A typed interface for database operations, abstracting the underlying adapter.
- **Adapter**: A concrete DB implementation (D1, Turso, Memory) behind the repository interface.
