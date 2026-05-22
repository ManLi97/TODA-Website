# CSS tokens

> **Surface naming — read before wiring into `globals.css`**
> `--surface-1/2/3/4` below is raw design-system notation, kept as-is in this reference doc.
> When implementing in `globals.css`, do NOT carry these names over. Map them to the semantic
> aliases the codebase already uses:
>
> | DS token      | `globals.css` alias  | Hex       |
> |---------------|----------------------|-----------|
> | `--surface-2` | `--surface-base`     | `#141414` |
> | `--surface-1` | `--surface-alt`      | `#121212` |
> | `--surface-3` | `--surface-raised`   | `#292929` |
> | `--surface-4` | `--surface-hover`    | `#333333` |
>
> All other tokens (`--bg`, `--border`, `--text-*`, `--gold-*`, `--purple-*`, `--label-*`,
> composed recipes) transfer directly with no renaming.

  :root {
    /* — Foundation — */
    --bg:          #000000;
    --surface-1:   #121212;
    --surface-2:   #141414;
    --surface-3:   #292929;
    --surface-4:   #333333;
    --border:      #383838;

    /* — Text — */
    --text-primary:   #FFFFFF;
    --text-secondary: #A3A3A3;
    --text-tertiary:  #6B6B6B;

    /* — Gold (primary) — */
    --gold-200: #FCE49B;
    --gold-400: #E8B73D;
    --gold-500: #C8941A;
    --gold-600: #9C7314;
    --gold-800: #5C420A;
    --on-gold:  #2B1E08;

    /* — Purple (secondary) — */
    --purple-200: #D9CBEF;
    --purple-400: #CBB5EF;
    --purple-500: #BBA6E8;
    --purple-600: #9D88C9;
    --on-purple:  #231A33;

    /* — Label tints — */
    --label-blue:  #6B8CBE;
    --label-green: #5FB082;
    --label-red:   #B85450;
    --label-terra: #B57236;

    /* — Composed recipes — */
    --glass-tint:        color-mix(in oklch, var(--surface-3) 65%, transparent);
    --glass-border-gold: 1px solid color-mix(in oklch, var(--gold-500) 15%,
  transparent);
    --grad-brand:        linear-gradient(135deg, var(--gold-500) 0%,
  var(--gold-400) 35%, var(--purple-500) 100%);
    --grad-ambient:      radial-gradient(ellipse at 15% 10%,
                           color-mix(in oklch, var(--gold-500) 12%, transparent)
   0%,
                           transparent 55%);
  }

  /* Glass component classes */
  .glass {
    padding: 1.75rem 2rem;
    background: var(--glass-tint);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    border-radius: 18px;
    border: var(--glass-border-gold);
    max-width: 38rem;
  }

  .glass--gradient {
    border: 1px solid transparent;
    background:
      linear-gradient(var(--surface-2), var(--surface-2)) padding-box,
      var(--grad-brand) border-box;
    backdrop-filter: none;
  }