# Cashflow Design System

A portable design system for **Cashflow** — a self-hosted, multi-currency finance
tracker for one person or a couple. Drop in card CSVs and PDF statements, let
merchant rules categorize and split them, attach receipts, track investments and
net worth, plan budgets and forecasts, and roll it all up into per-currency
dashboards. It's a real ledger (~90 tables, ~80 API routers, an 85-page React
app), not a spreadsheet.

This project distills that product's look and feel into tokens, components, a
foundation specimen set, and a clickable UI-kit recreation so you can design new
Cashflow screens and assets that match the real app.

## Sources

Built by reading the Cashflow codebase. Explore these to go deeper:

- **GitHub:** https://github.com/Connor-Adams/cashflow
  - `cashflow-design-system.md` — the original portable design brief
  - `packages/ui/src/styles/tokens.css` + `theme.css` — the token source of truth
  - `packages/ui/src/components/` — the primitive components (Button, Card, Alert, …)
  - `frontend/src/components/` + `frontend/src/pages/` — app shell, sidebar, dashboard
  - `frontend/src/App.css` — layout/sidebar/table component classes

> The repo is source-available for review only (not open-source). Nothing is
> assumed to be accessible to the reader — these links are stored for those who have access.

---

## Content fundamentals

How Cashflow writes copy:

- **Plain, calm, second person.** The product talks to *you* about *your* money:
  "Totals stay in each currency.", "Drop in your card CSVs.", "Waiting on category,
  split, or business decisions before they roll into your totals." Instructional,
  never breathless.
- **Sentence case everywhere** — page titles, buttons, nav. Not Title Case.
  ("Add transaction", "Open review", "Net spend by category".) The one exception
  is **micro-labels**, which are `UPPERCASE` + letter-spaced + muted (stat labels,
  table headers): "NET SPEND", "MERCHANT".
- **Money is precise and literal.** Amounts carry sign and currency: `−$84.20`,
  `+$4,900.00`, `CAD`. Numbers use tabular/mono figures so columns align.
- **Honest, slightly dry tone.** Feature copy is matter-of-fact ("No third-party
  services touch your data unless you opt into an integration."). Mild personality
  surfaces only in dev-facing corners (e.g. a superadmin "God mode" badge).
- **No emoji, no exclamation spam.** Iconography carries affect, not punctuation.
- **Verb-first actions.** Buttons are an action: "Import statement", "Open review",
  "Add", "Log out".

---

## Visual foundations

- **Oxblood is the signature.** A deep wine red (`#9B2D3A`, `--primary`) used for
  brand, CTA, and money-out — restrained and serious, "money you respect." It is
  *precious*: brand/CTA/primary only, never a surface fill.
- **Greyscale (zinc) is the workhorse.** Most surfaces, borders, and text are zinc.
  Color appears only where it carries meaning.
- **Money semantics are load-bearing.** Green (`--positive`) = money-in/gain;
  oxblood (`--negative`) = money-out/loss. Never decorative. StatCard's delta tone
  resolves from `sign × metricKind` — for `spend` metrics "up" is bad (red), for
  `gain` metrics "up" is good (green), `neutral` stays muted. Arrows: ▲ ▼ —.
- **The hero gradient is the one moment of warmth.** `linear-gradient(135deg,
  #FF7847, #E84393)` (warm orange → pink). Used at **11–24% opacity only** — never
  a flat fill: the active nav link's faded fill + full-color rail, tree indent
  guides, the 1.6s skeleton shimmer, and the dashboard-only "living gradient"
  backdrop (two radial blooms drifting on a 24s loop, faded in only on the
  dashboard, frozen under `prefers-reduced-motion`).
- **Backgrounds are flat token fills**, not washes. `--background` (zinc-100 light /
  near-black dark) behind `--card` (white / `#141416`).
- **Cards:** `rounded-lg` (8px), 1px `--border` hairline, a single light `--shadow`
  (`0 8px 18px rgb(9 9 11 / .08)`). Elevation stays light — no stacked shadows.
- **Radii:** base 0.5rem. sm 2 · md 4 · lg 8 (default) · xl 12 · full pill.
- **Borders** do most of the structural work; shadows are secondary.
- **Hover states:** neutral controls go to `--muted`/`--accent`; nav links and
  footer buttons take the full hero gradient with light text. Primary buttons
  darken (`color-mix(... 88%, black)`).
- **Focus:** every interactive element gets a visible oxblood ring (3px,
  `--ring` at ~35%). Touch targets ≥ 44px.
- **Motion:** 150–700ms transitions, gentle. Skeleton shimmer 1.6s. No bounce, no
  decorative infinite loops on content. All motion respects reduced-motion.
- **Dark mode** is the *same* token layer re-pointed via `[data-theme="dark"]` —
  never a separate stylesheet.
- **Brands** are a second, orthogonal axis, re-pointed via `[data-brand="…"]`.
  Cashflow is the unnamed default on `:root`; a named brand overlays it as a
  delta. See *Customization* below.
- **Type:** geometric-humanist sans (Avenir Next in the app; **substituted with
  Mulish** here — see Caveats). Tight negative tracking on display/headline sizes;
  body default 14px; uppercase letter-spaced micro-labels; mono/tabular figures
  for money.

---

## Customization

Theming has two independent axes. `[data-theme]` swaps light/dark. `[data-brand]`
swaps the *palette and feel* that the semantic layer resolves to. Components only
ever read semantic names (`--primary`, `--card`, `--radius-lg`, `--font-sans`), so
neither axis requires touching a component.

Cashflow is the unnamed default, defined directly on `:root`. Additional brands
live in `packages/tokens/src/brands/<name>.css` and are **opt-in imports** — a
Cashflow consumer never ships another brand's bytes.

| Brand | Scope | Import |
| --- | --- | --- |
| Cashflow | `:root` (default) | included in `@connor-adams/tokens/styles.css` |
| Rainbot | `:root[data-brand="rainbot"]` | `@connor-adams/tokens/brands/rainbot.css` |

```css
@import "@connor-adams/tokens/styles.css";
@import "@connor-adams/tokens/brands/rainbot.css";
```

```html
<html data-brand="rainbot" data-theme="dark">
```

**Import order is load-bearing.** A brand selector (`:root[data-brand="x"]`) has
the same specificity as a theme selector (`:root[data-theme="dark"]`), so it wins
on source order alone. Importing a brand *before* the base stylesheet silently
does nothing.

Note that token files are deliberately **unlayered** (only the element resets in
`base.css` sit in `@layer base`, and component CSS in `@layer components`). Do not
wrap the token layer in a cascade layer: unlayered declarations beat every layer,
so layering `semantic.css` while `colors.css` stays unlayered would stop a brand
from overriding the raw ramps or the gradient.

### A brand is a delta, not a fork

Anything a brand does not name falls through to the active theme block. So a
brand overriding five tokens is a five-declaration file — see
`brands/rainbot.css`, which is ~20 declarations for a completely different look.
There is no requirement to restate the token layer.

The one thing to be deliberate about: a brand written against dark surfaces
expects `data-theme="dark"` to be set too. Pair the attributes.

### What you can override

Every token below lives on a plain `:root` selector, so a brand (or an app) can
re-point any of them. This is the whole knob surface:

| Group | File | Tokens |
| --- | --- | --- |
| Semantic colors | `semantic.css` | surfaces, text, `--primary*`, `--secondary*`, `--accent*`, `--text-link*`, signals (`--success*`/`--warning*`/`--danger*`/`--info*`), money (`--positive*`/`--negative*`), `--destructive*`, `--border`, `--input`, `--ring` — 55 in total, defined per theme |
| Chart palette | `semantic.css` | `--chart-1..5`, `--chart-line-1..6`, plus the domain aliases `--chart-spend`/`-credit`/`-payment`/`-business`/`-personal` |
| Raw ramps | `colors.css` | the oxblood/zinc/green/amber/alert scales, `--chart-steel`, and `--gradient-hero`/`-from`/`-to` |
| Radius | `spacing.css` | `--radius`, `--radius-sm/md/lg/xl/full` |
| Spacing | `spacing.css` | `--space-0.5` … `--space-8` |
| Layout | `spacing.css` | `--sidebar-width`, `--content-max`, `--content-max-wide`, `--content-max-ultrawide`, `--breakpoint-3xl` |
| Elevation | `spacing.css` | `--shadow` (light and dark variants) |
| Type | `typography.css` | `--font-sans`, `--font-mono`, `--leading-base`, `--weight-regular/medium/semibold/bold`, the full `--text-*` scale with its `-lh`/`-ls` pairs, `--text-label` |

Semantic names carry meaning, not just a value. `--secondary` is a quiet neutral
chip surface, not "the second brand hue" — re-pointing it at a saturated colour
makes every `<Button variant="secondary">` loud. Use `--accent` for a second hue.
If a brand does diverge on what a name means, say so in a comment in the brand
file.

### Known limits

Some components hard-code values a brand cannot reach. These are bugs, not
design: `Progress`'s `4/8/12px` size ramp, `Sparkline`'s fixed pixel dimensions,
and `CategoryBreakdown`'s inlined `BAR_GRADIENT` constant. Prefer a token or a
prop when you touch them.

`Card`'s padding **used** to be on this list as a hard-coded `20px`. It is now
`var(--ca-card-padding)`, defaulting to `--space-5` (the token spelling of the
same 20px) and switchable with `padding="none|sm|default|lg"` — plus
`variant="default|nested|plain"` and `radius="md|lg|xl"`, all resolved off the
token layer via `data-*` attributes. One gap remains: the radius ladder stops at
`--radius-xl` (12px), so the `rounded-2xl` (16px) page panel some apps hand-roll
still has no token to reach for — add `--radius-2xl` to `spacing.css` if you
need it.

---

## Iconography

- **lucide-react** is the icon system throughout the app — stroke-based, 2px
  weight, rounded caps/joins, sized via `size={px}` (typically 16–18 in chrome).
  The UI kit renders the same icons from the **lucide UMD** CDN (`ui_kits/cashflow-app/icons.jsx`).
  When designing new Cashflow surfaces, use lucide names (LayoutDashboard, Inbox,
  CreditCard, ReceiptText, Wallet, ShoppingBag, PiggyBank, Target, LineChart, …).
- **Accent moments** apply the hero gradient to an icon stroke via an SVG
  `<linearGradient>` (e.g. tree row icons) — used sparingly.
- **No emoji** as iconography. The categorical **LetterAvatar** (first letter on a
  hashed `--avatar-*` color) stands in for merchant/counterparty logos.
- **Logo:** the money-flow "G" glyph (green up-arrow / orange down-arrow inside a
  letterform) on an oxblood-900 rounded square. Stored in `assets/logo/`
  (192/512/64px PNG + `favicon.ico`). The marketing site's social icons (Bluesky,
  GitHub, X, Discord) are in `assets/brand/social-icons.svg` — supplementary, not core.

---

## Index — what's in this system

**Tokens** (`styles.css` is the entry point; link this one file)
- `tokens/colors.css` — raw ramps (zinc, oxblood, alert, green, amber, gradient, avatars)
- `tokens/semantic.css` — semantic aliases, light + dark
- `tokens/typography.css` — font families + type scale
- `tokens/spacing.css` — radius, spacing ladder, layout, shadow
- `tokens/fonts.css` — webfont imports · `tokens/base.css` — element resets + shimmer

**Components** (`window.CashflowDesignSystem_2cf89d.<Name>` after loading `_ds_bundle.js`)
- `components/core/` — Button, Badge, Card (+ Header/Title/Description/Content), Text, Link, Separator, Spinner, Kbd, Avatar, Progress, Accordion
- `components/navigation/` — Breadcrumb, Pagination
- `components/finance/` — AmountText, MoneyInput, CategoryPill, Sparkline, PeriodSelector, AccountCard, BudgetMeter, ImportDropzone
- `components/forms/` — Input, Textarea, NativeSelect, Label, Switch, Checkbox, RadioGroup, Slider, ToggleGroup, Stepper, Combobox
- `components/feedback/` — Alert, EmptyState, Skeleton (+ SkeletonText)
- `components/data/` — StatCard, Table (+ parts), Tabs, LetterAvatar
- `components/overlays/` — Dialog, Tooltip, Toast, DropdownMenu
- Each has a `.d.ts` (props), a `.prompt.md` (usage), and a `@dsCard` HTML in its dir.

**Foundations** (`foundations/*.html`) — specimen cards for the Design System tab:
colors (oxblood, zinc, money, signals, surfaces, gradient, avatars), type (face,
display, body), spacing (radius, scale, elevation), brand (logo, motion).

**UI kit** (`ui_kits/cashflow-app/`) — a clickable recreation: login → app shell
(240px sidebar + top bar) → dashboard bento (KPI stats, review banner, category
bars, business/personal splits, budget pacing) → transactions table (tabs,
review filter, money-colored amounts). `index.html` is the entry + a Starting Point.

---

## Caveats

- **Font substitution:** the app's primary face is **Avenir Next** (proprietary,
  not redistributable). This system substitutes **Mulish** (a geometric-humanist
  Avenir-family alternative) plus IBM Plex Sans/Mono via Google Fonts. If you have
  licensed Avenir Next binaries, drop them in and swap the `@import` in
  `tokens/fonts.css` for local `@font-face` rules.
- The UI kit uses representative **demo data**, not live figures, and recreates the
  dashboard + transactions surfaces (the two most representative views) rather than
  all 85 pages. Charts are simplified bar/share visuals — the app uses recharts.

---

## Repository & development

This is a **living repository**. The source of truth is the CSS tokens and the
component sources; the bundle, manifest, and adherence config are generated and
git-ignored.

```bash
git clone https://github.com/<you>/cashflow-design-system.git
cd cashflow-design-system
# open any foundations/*.html or components/**/*.card.html in a browser to preview
```

| File / dir | Role |
|---|---|
| `styles.css` | Global entry — a list of `@import`s only (links every token + font file) |
| `tokens/` | CSS custom properties (colors, typography, spacing, fonts) |
| `components/<group>/` | React primitives, each as `.jsx` + `.d.ts` + `.prompt.md` + a `@dsCard` card |
| `foundations/` | Specimen cards for the Design System tab |
| `templates/` | Copyable starting points (e.g. the Cashflow Dashboard) |
| `assets/` | Logos, icons, brand imagery |
| `SKILL.md` | Agent-Skills entry point — clone into Claude Code to invoke as a skill |
| `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` | **Generated — git-ignored, never edit** |

See **CONTRIBUTING.md** for the component recipe and conventions, **CHANGELOG.md**
for version history, and **LICENSE** (note: confirm redistribution rights before
publishing — the upstream product repo is source-available, not open-source).
