## Design Philosophy

### Foundation

The system lives on true black. Not near-black, not deep navy — the actual void.
Black gives drama, makes color sing, and signals premium without effort. Everything
else lifts off it.

Anthracite is the structural counterpoint to black. Used as the material of cards,
framed panels, code-like callouts, and internal containers. Anthracite reads as
"object" — black reads as "space." The _section_ rhythm is a strict two-surface
alternation — near-black (`surface-base`) ↔ anthracite (`surface-alt`), back and forth
down the page. The lighter tiers (`surface-raised`, `surface-hover`) are not section
backgrounds; they are the fills for cards, glass tints, and hover states — stacked on
top to get depth without ever needing a light surface. Never go above mid-grey — the
moment a surface looks "light," the cinematic feel breaks.

### Materials — Black · Glass · Anthracite

Use glassmorphism selectively, not as wallpaper. Glass belongs to focal elements:
the hero section, a featured stat, a pull quote. Glass = "look at this." If every
panel is glass, nothing is.

The glass recipe always includes three things: a soft inner blur, a very low-opacity
anthracite tint (so the panel feels like it has matter, not air), and a hairline
border carrying brand color — sometimes gold, sometimes purple, sometimes a gradient
between the two. The border is where the design system makes itself known.

Non-focal containers are flat anthracite. The mix of flat-anthracite +
selective-glass + true-black does the heavy lifting on hierarchy before you ever
reach for an accent color.

### Depth — surface-aware elevation

Surface alternation carries the _section_ rhythm; cards and boxes earn a touch of
real depth on top of it. Because a drop shadow is invisible on true black, elevation
is surface-dependent and cascaded automatically per section (the `.elevated` recipe
and `--shadow-card` in `globals.css`):

- **On black sections** depth is "light from above" — a 1px top inner-highlight rim
  catches light; the dark drop stays near-invisible by design.
- **On anthracite sections** a soft, low-opacity dark drop shadow reads, because the
  surface is light enough to darken beneath the box.

Apply it the way glass is applied — selectively, never as wallpaper. Plain cards and
hairline `.glass` boxes get it; gradient-border glass does not — its gold→purple
border already _is_ the highlight, and stacking a shadow on it would dilute the apex.

### Color — Gold, Purple, and the Supporting Cast

#### Gold — Used Like Jewelry

The gold (warm amber, not yellow, not metallic) is the primary identity signal. Treat
it like jewelry on a tailored black suit: small, intentional, expensive-looking.

Gold belongs on:

- Single-word emphasis in a headline — one gold word, not a phrase
- Numbers and KPIs — a single large gold number on black is the system's signature move
- Hairlines and rules — thin gold dividers, 1px borders on featured cards, underlines
  below section labels
- Icon strokes — line icons traced in gold, never filled
- Punctuation and typographic accents — gold standing in as a spotlight

#### Purple — The Counter-Melody

Purple is the second voice. Where gold = "this is TODA," purple = "new / forward /
answer / future."

Purple belongs on:

- The second element in a comparison or before/after pairing (gold = us, purple = the
  change or outcome)
- Section transitions and chapter markers — purple-tinted glass for "we're entering a
  new act"
- Interactive cues — hover states, callouts, elements just revealed
- Data viz when a second series is needed alongside gold

Purple is cooler and lighter (lavender, not royal) — it deliberately doesn't fight
gold for attention; it complements it.

#### Gradients

Three families:

**Atmospheric** — large, soft, full-bleed background washes. Anthracite-into-black
radial gradients, or a faint gold bloom in one corner fading to pure black across 80%
of the canvas. These are ambient — felt before they're seen.

**Brand** — gold → purple, traveling diagonally. Used on section dividers, thin border
accents on hero cards, large display numerals, and animated transitions. Keep the gold
side dominant (60/40), and let the midpoint sit in a warm bronze-into-mauve transition
rather than muddy brown.

**Edge** — a single border or rule fading from gold to transparent, or from purple to
transparent. Powerful on the leading edge of a featured card; signals "this is the
side that matters."

Gradients fail when they look like a Tailwind demo — they succeed when they look like
light bleeding through a lens.

#### Label Palette

Labels are orientation, not decoration. Build from low-saturation tints of the
existing palette:

- **Gold-tint** — primary category, "our thing"
- **Purple-tint** — comparison / future / new
- **Muted steel-blue** — neutral data, facts
- **Muted green** — positive outcome, proof
- **Muted terracotta** — problem, friction, status quo

All labels dim by default — small text, thin border, ~10–15% color fill on glass. A
bright label competes with the gold; a dim label supports it. Avoid pure red, pure
green, pure blue — they shatter the cinematic palette. Everything should look like it
was filtered through the same lens.

### Typography

Inter is the only typeface — continuity with other TODA products, and the closest free
analogue to SF Pro. At marketing scale, Inter's personality changes completely: TODA's
internal company app uses it for high-density UI; this website uses it for theater.

One exception: Playfair Display is used exactly once — the "Weniger Chaos" span inside
the hero headline. Nowhere else on the site.

Three principles do the heavy lifting:

**Weight contrast is the system.** Only three weights: 200 (thin) for hero numerals,
400 (regular) for everything readable, 600 (semibold) for headlines and eyebrows. The
thin / semibold gap is what gives the page its drama. Never use thin and bold adjacent
— let thin live alone at hero scale, and the gap speaks for itself.

**Negative tracking scales with size.** Anything above ~32px gets pulled tighter
(−0.025em to −0.05em). Eyebrows go the opposite direction — uppercase with generous
+0.14em tracking. The two extremes anchor the page.

**Tight leading on display, generous on body.** Hero numerals at 0.92 line-height;
sub-display at 1.1; body at 1.55. Display text is sculpted; body text breathes.

### Motion

Three principles govern every animation:

**Reveal on arrival, fire once.** The default is per-element: each element (or each
child of a `<RevealGroup>`) plays its entrance the moment it crosses into view, then
**stays** — no reset, no replay on scroll-back. A calm single reveal reads more premium
than re-animating every time you pass. Deliberate _sequencing_ (beats landing one at a
time, tight overlaps within a group, wider breaths between phases) is reserved for the
two places that tell a story on a clock: the Origin GSAP timeline and the
StrikethroughList cascade. Everywhere else, things animate as you reach them — not on a
pre-timed schedule. (See `motion.md`.)

**One ease.** `cubic-bezier(0.16, 1, 0.3, 1)` — a quick start with a soft landing —
handles every entrance. Continuous loops use `ease-in-out`. No bouncing, no
overshoots, no spring physics.

**Motion is a guest, not a host.** The page is read, not poked. Entrances fire once and
get out of the way; nothing loops or pulses to draw the eye except the few deliberate
accents (the team avatar ring, the swipe hint). When in doubt, less motion.

### The Overall Feeling

Imagine a dark gallery at night: black walls, anthracite plinths, a single piece of
gold jewelry under a spotlight, occasionally a violet beam passing through. Lots of
breathing room. Few elements per section. When a number appears it's huge; when a
statement appears it commands the full width with empty space around it; when proof
arrives it comes on a piece of glass with a gold-to-purple edge.

That's the bar: **cinematic, sparse, expensive.** Black does the work. Gold and purple
are the highlights.

### Design Guardrails

These are not technical constraints — they are statements about taste. Breaking any of
them is a signal that the design has drifted.

- **Glass is not wallpaper.** If every panel is glass, none of them are focal. The
  material earns its use.
- **Gold does not fill.** If it's larger than a thumbnail or longer than a phrase, use
  white or contain it inside a gradient.
- **Not every element animates.** Only animate what carries narrative weight. Static
  elements are anchors, not oversights.
- **No simultaneous focal events.** If two things would compete for the eye at the
  same moment, push one back by 200ms. There is always one thing happening — even when
  many things are visible.
- **No hover micro-animations on content.** Buttons and nav elements may transition
  (≤ 200ms); nothing else. Cards do not lift, glow, or scale on hover. This system is
  read, not poked.
- **No spring physics, no bounce, no overshoot.** The single ease curve is
  non-negotiable. Bouncing reads as toy-like; this brand reads as instrument.
- **No decorative parallax.** The scroll architecture is plain smooth scroll — no
  scroll-snap. Each section is at least one viewport tall (`min-h-svh`) so it still
  reads as a distinct "spotlight," but the page scrolls continuously like a premium
  editorial site (Apple / Stripe / Linear), and sections taller than the viewport
  scroll naturally instead of being trapped. The spotlight feel comes from the
  viewport-height rhythm, the surface-colour alternation, and entrance reveals — not
  from hijacking the scroll. Entrance animations fire **once** when an element scrolls
  into view (element-scoped `IntersectionObserver`) and stay — no scroll-position
  tweens, no parallax, no decorative motion bound to scroll progress.
