# [ESTABLISHED] Visual Design System

## The Aesthetic

The core design language is **Neo-Brutalist with dynamic multi-theme support**. It combines high-contrast colors, bold borders, hard offset drop shadows, and expressive typography. It is accessible, punchy, and instantly recognizable.

Through the runes-based theme runtime (`src/lib/theme.svelte.ts`) and CSS custom properties, users can also toggle stylistic presets:
1. **Neo-Brutalist (Default)**: Sharp edges (`0px` radius), heavy 2px–4px solid black borders, and hard offset drop shadows (`4px 4px 0 #212121`).
2. **Rounded 2D Game (`data-theme="game"`)**: Friendly `16px` border radiuses, cartoonish vertical drop shadows (`0 4px 0 #212121`), and `Fredoka` display font.
3. **Ultra-Compact (`data-theme="compact"`)**: Tight spacing, snug padding, 2px borders, and 1.5px drop shadows designed for high information density on mobile screens.
4. **Clean Flat Minimal (`data-theme="flat"`)**: Crisp borders with zero offset drop shadows for a distraction-free, low-elevation aesthetic.
5. **High-Contrast Dark (`data-theme="dark"`)**: Inverted dark slate surfaces with high-visibility primary and secondary accents.

---

## Design Tokens & CSS Custom Properties

Configured in `src/app.css` and applied via Tailwind CSS v4 utility classes:

| Token / CSS Property | Default Value | Game Theme | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#fffde7` (warm cream) | `#fffde7` | Page viewport background |
| `--foreground` | `#212121` (near-black) | `#212121` | Primary text and headings |
| `--surface` | `#ffffff` (pure white) | `#ffffff` | Elevated cards, forms, and dialogs |
| `--primary` | `#e53935` (bright red) | `#e53935` | "Agree" CTA, primary confirm buttons, error badges |
| `--primary-foreground` | `#fffde7` | `#ffffff` | Text on primary red backgrounds |
| `--primary-shadow` | `#b71c1c` (dark red) | `#b71c1c` | Hard shadow under primary buttons |
| `--secondary` | `#ffd600` (vivid yellow) | `#ffd600` | "We do / Not sure" button, badges, highlights |
| `--secondary-foreground` | `#212121` | `#212121` | Text on secondary yellow backgrounds |
| `--secondary-shadow` | `#c79a00` | `#c79a00` | Hard shadow under secondary buttons |
| `--border` | `#212121` | `#212121` | Outlines on all cards, inputs, and buttons |
| `--radius` | `0px` | `16px` | Border radius applied via `rounded-theme` |
| `--shadow-sm` | `2px 2px 0 var(--border)` | `0 2px 0 var(--border)` | Sub-cards, input fields, pill badges |
| `--shadow-md` | `4px 4px 0 var(--border)` | `0 4px 0 var(--border)` | Main cards, form containers |
| `--shadow-primary` | `4px 4px 0 var(--primary-shadow)` | `0 4px 0 var(--primary-shadow)` | Primary action button drop shadows |
| `--shadow-secondary` | `4px 4px 0 var(--secondary-shadow)` | `0 4px 0 var(--secondary-shadow)` | Secondary action button drop shadows |
| `--font-display` | `"Poppins", sans-serif` | `"Fredoka", sans-serif` | Big headings and button labels |
| `--font-body` | `"Poppins", sans-serif` | `"Nunito", sans-serif` | Body text, form labels, tooltips |

---

## Interactive Physics & Elevation

- **Button Press Action**:
  Neo-brutalist buttons simulate mechanical buttons by translating along the shadow vector and shrinking the shadow on active press:
  ```css
  /* Example hover and active translation */
  hover:translate-y-[1px]
  active:translate-x-[1px] active:translate-y-[2px] active:shadow-none
  ```
- **Form Focus States**:
  Inputs use solid borders (`border-2 border-border`) with high-contrast ring focus without blur.
- **Tooltips (`InfoTooltip.svelte`)**:
  Adaptive display supporting responsive mode (tap tooltip on mobile, visible inline text on desktop).
- **Theme Switcher (`ThemeSwitcher.svelte`)**:
  Allows visitors to preview and switch between all themes live across all application views. Direct preview route available at `/tests/ui-forms`.
