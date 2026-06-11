## Color — Hex Reference

> **Source of truth: `app/[locale]/globals.css` `@theme`.** These tables mirror it.
> Tailwind utility names derive from the token: `--color-surface-alt` → `bg-surface-alt`,
> `text-surface-alt`, etc. If a value here ever disagrees with `globals.css`, the CSS wins.

### Foundation — black + anthracite

The page rhythm uses **two** surfaces, alternating: `surface-base` (true black) ↔
`surface-alt` (anthracite), starting on base. `raised` / `hover` are not section
backgrounds — they are the lighter fills used by cards, glass tints, and hover states.

| Token                      | Hex       | Role                                                                 |
| -------------------------- | --------- | -------------------------------------------------------------------- |
| `--color-bg`               | `#000000` | True black — semantic canvas token (same value as surface-base)      |
| `--color-surface-base`     | `#000000` | True black — section background (the "black" half of the rhythm)     |
| `--color-surface-alt`      | `#1e1e1e` | Anthracite — section background (the "anthracite" half)              |
| `--color-surface-raised`   | `#292929` | Elevated fill — glass tint source, raised boxes                      |
| `--color-surface-hover`    | `#333333` | Hover / highest elevated fill                                        |
| `--color-surface-elevated` | `#333333` | Legacy alias of `surface-hover` (card/video/team/testimonials fills) |
| `--color-border`           | `#383838` | Hairlines, dividers                                                  |
| `--color-border-subtle`    | `#383838` | Legacy alias of `border` (header/footer/faq/button/team)             |

### Text

| Token                    | Hex       | Role                   |
| ------------------------ | --------- | ---------------------- |
| `--color-text-primary`   | `#FFFFFF` | Headings, primary data |
| `--color-text-secondary` | `#A3A3A3` | Labels, helper text    |
| `--color-text-tertiary`  | `#6B6B6B` | Metadata, fine print   |

### Gold — primary accent

`gold-400` is the everyday accent (the one components reach for — `text-gold-400`);
`gold-500` anchors the warm end of the brand gradient.

| Token              | Hex       | Role                                               |
| ------------------ | --------- | -------------------------------------------------- |
| `--color-gold-200` | `#FCE49B` | Light tint (hover on text)                         |
| `--color-gold-400` | `#E8B73D` | Bright accent — default gold in UI                 |
| `--color-gold-500` | `#C8941A` | Numbers, hairlines, warm end of the brand gradient |
| `--color-gold-600` | `#9C7314` | Pressed / deep accent                              |
| `--color-gold-800` | `#5C420A` | Rare deep tint                                     |
| `--color-on-gold`  | `#2B1E08` | Text on gold fill                                  |

### Purple — secondary accent

| Token                | Hex       | Role                               |
| -------------------- | --------- | ---------------------------------- |
| `--color-purple-200` | `#D9CBEF` | Light tint                         |
| `--color-purple-400` | `#CBB5EF` | Bright accent                      |
| `--color-purple-500` | `#BBA6E8` | Secondary — counter-melody to gold |
| `--color-purple-600` | `#9D88C9` | Pressed                            |
| `--color-on-purple`  | `#231A33` | Text on purple fill                |

### Label / categorical tints

| Token                 | Hex       | Role                                |
| --------------------- | --------- | ----------------------------------- |
| `--color-label-blue`  | `#6B8CBE` | Neutral data, facts, in-progress    |
| `--color-label-green` | `#5FB082` | Positive outcome, proof, success    |
| `--color-label-red`   | `#B85450` | Problem, friction, status quo       |
| `--color-label-terra` | `#B57236` | Blocked, waiting, alternative state |

### Polaroid — testimonial cards (project-specific, not in the base DS)

A deliberately _light_ surface, used only for the skeuomorphic polaroid testimonial
cards. The single place the cinematic dark rule is broken on purpose.

| Token                             | Hex       | Role                       |
| --------------------------------- | --------- | -------------------------- |
| `--color-polaroid`                | `#FAFAFA` | Photo-paper card surface   |
| `--color-polaroid-text`           | `#1A1A1A` | Primary text on the card   |
| `--color-polaroid-text-secondary` | `#555555` | Secondary text on the card |
