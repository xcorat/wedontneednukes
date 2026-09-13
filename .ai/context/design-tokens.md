# [ESTABLISHED] Design Tokens

Distilled from `docs/design/design-system.md`. Apply via Tailwind v4 utility classes that map to these CSS variables (`src/app.css`).

## Theme Presets

Themes are toggled by setting `data-theme` on `<html>` via the runes-based runtime at `src/lib/theme.svelte.ts`. Persistence is localStorage.

1. **Neo-Brutalist (default)** — sharp 0px corners, heavy 2px–4px black borders, hard offset shadows.
2. **`data-theme="game"` — Rounded 2D Game** — 16px corners, cartoonish vertical shadows, `Fredoka` display font.
3. **`data-theme="compact"` — Ultra-Compact** — tight spacing, 2px borders, 1.5px shadows; high information density.
4. **`data-theme="flat"` — Clean Flat** — crisp borders, zero offset shadows; distraction-free minimalism.
5. **`data-theme="dark"` — High-Contrast Dark** — inverted dark slate surfaces, high-visibility accents.

## CSS Custom Properties

| Variable | Default | `game` | Use |
|---|---|---|---|
| `--background` | `#fffde7` (warm cream) | `#fffde7` | Page viewport |
| `--foreground` | `#212121` (near-black) | `#212121` | Primary text / headings |
| `--surface` | `#ffffff` (pure white) | `#ffffff` | Elevated cards, forms, dialogs |
| `--primary` | `#e53935` (bright red) | `#e53935` | "Agree" CTA, primary actions, error |
| `--primary-foreground` | `#fffde7` | `#ffffff` | Text on primary backgrounds |
| `--primary-shadow` | `#b71c1c` (dark red) | `#b71c1c` | Hard shadow under primary buttons |
| `--secondary` | `#ffd600` (vivid yellow) | `#ffd600` | "We do / Not sure" CTA, badges |
| `--secondary-foreground` | `#212121` | `#212121` | Text on secondary backgrounds |
| `--secondary-shadow` | `#c79a00` | `#c79a00` | Hard shadow under secondary buttons |
| `--border` | `#212121` | `#212121` | All card / input / button outlines |
| `--radius` | `0px` | `16px` | Applied via `rounded-theme` utility |
| `--shadow-sm` | `2px 2px 0 var(--border)` | `0 2px 0 var(--border)` | Sub-cards, inputs, badge pills |
| `--shadow-md` | `4px 4px 0 var(--border)` | `0 4px 0 var(--border)` | Main cards, form containers |
| `--shadow-primary` | `4px 4px 0 var(--primary-shadow)` | `0 4px 0 var(--primary-shadow)` | Primary button drop shadow |
| `--shadow-secondary` | `4px 4px 0 var(--secondary-shadow)` | `0 4px 0 var(--secondary-shadow)` | Secondary button drop shadow |
| `--font-display` | `"Poppins", sans-serif` | `"Fredoka", sans-serif` | Headings, button labels |
| `--font-body` | `"Poppins", sans-serif` | `"Nunito", sans-serif` | Body, form labels, tooltips |

## Interactive Physics

- **Buttons** simulate mechanical presses by translating along the shadow vector:
  `hover:translate-y-[1px]` then `active:translate-x-[1px] active:translate-y-[2px] active:shadow-none`.
- **Inputs**: solid `border-2 border-border` plus solid high-contrast focus ring (no blur).
- **`InfoTooltip.svelte`** — adaptive: tap-popup on mobile, inline helper text on desktop.
- **`ThemeSwitcher.svelte`** — live preview across all routes. Style benchmarks at `/tests/ui-forms`.

## Tailwind Semantic Utilities (use these names)

`bg-primary`, `bg-secondary`, `bg-surface`, `bg-background`, `text-foreground`, `rounded-theme`, `shadow-theme-md`. These resolve to the variables above so theme switches carry no stylesheet cost.
