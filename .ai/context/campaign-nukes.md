# [DRAFT] Campaign: Nukes (Content Strings & Flow)

Strings, flow screens, and FAQ topics that the `wedontneednukes.org` campaign uses. Distilled from `docs/campaigns/nukes/`. Keep this list in sync with `docs/campaigns/nukes/copy.md` when copy changes.

## Identity

- **Tagline:** `We don't need nukes.`
- **Hero prompt (question):** `We don't need Nukes !`
- **Domain:** `wedontneednukes.org`
- **Choice labels on hero:** `Agree` and `We do | Not sure` (single choice; values `agree` / `other`).

## Pledge Flow Screens

Source: `docs/campaigns/nukes/pledge-flow.md` (target JSON shape documented in `docs/architecture/pledge-engine.md`).

| # | Screen | Choices | Routes to |
|---|---|---|---|
| 1 | Core Position | `I am not against nuclear weapons` → Terminal Dissent. / `We don't need nukes` → Screen 2. | direct or screen 2 |
| 2 | Commitment Level | `I will not support anything that expands nuclear weapons` → Screen 3a. / `I will oppose anything that supports nuclear weapons` → Screen 3b. / `I will fight against nuclear weapons` → Screen 3c. | screen 3a / 3b / 3c |
| 3a | Passive Actions | multi-select passive commitments (e.g. divestment checks, awareness) | Terminal |
| 3b | Active Opposition | `political and ideological` / `market choices` / `both` | Terminal |
| 3c | Direct Action | direct action commitments (protest, organize) | Terminal |

Commitment-level categorization: `passive` (Screen 3a), `active` (Screen 3b), `direct` (Screen 3c).

## FAQ Topics (linked to pledge steps)

Source: `docs/campaigns/nukes/faq-content.md`. Topic slugs are stable handles; do not rename casually.

| Slug | Question | Linked step |
|---|---|---|
| `why-pledge` | Why pledge against nuclear weapons? | Screen 1 |
| `why-now` | Why now? What makes today different from the past? | hero |
| `passive-meaning` | What does "not supporting expansion" mean practically? | Screen 2 / 3a |
| `market-strategy` | What are market-based opposition strategies? | Screen 3b |
| `political-action` | What political actions can I take? | Screen 3b |
| `privacy` | How is my data used? (privacy guarantee) | global |
| `after-pledge` | What happens after I pledge? | Terminal |
| `change-pledge` | Can I change my pledge? | global |

FAQ text bodies must remain in `docs/campaigns/nukes/faq-content.md` (or successor) for human editorial review; this file references slugs only.

## Copy Strings

Hero/screen labels: see the flow table above (these are the canonical commit buttons).

Confirmation messages:

- Standard pledge: `Thank you for taking the pledge. Your voice joins thousands of others demanding a safer future.`
- Dissent record: `Thank you for your honesty. We have recorded your stance.`

Share templates:

- `I just pledged to oppose nuclear weapons. We don't need nukes. Join me at [Link].`
- `Our future doesn't require mutually assured destruction. I took the pledge. [Link]`

Privacy guarantee copy:

> We respect your privacy. We use Cloudflare Turnstile to prevent spam without tracking you. Your data is never sold, and your individual identity remains protected.

## "Why Now?" landing cards (5 cards)

Source: `docs/campaigns/nukes/copy.md`.

1. AI & Brittle Systems.
2. Crisis of Leadership.
3. Breaking the Proliferation Trap.
4. Multiple Flashpoints.
5. Lowered Tech Barriers.

Full card body text lives in `docs/campaigns/nukes/copy.md` — keep this file lean.

## Editing Rules

- Copy change → update both `docs/campaigns/nukes/copy.md` and this file.
- FAQ rename / restructure → update `docs/campaigns/nukes/faq-content.md`, this file (slugs column), and any `question_gate.referenced_topic` references.
- New flow screen → update flow table here and the JSON schematic in `docs/architecture/pledge-engine.md`, then regenerate the campaign's flow JSON.
