# @connor-adams/tokens

## 0.2.0

### Minor Changes

- f37c634: Add a brand axis to the token layer, with Rainbot as the first named brand.

  Theming had one axis — `[data-theme]` light/dark — with Cashflow's palette baked
  into `:root`, so a second product could only restyle the system by overriding
  the semantic layer from inside its own app. Brands are now a second, orthogonal
  axis: `packages/tokens/src/brands/<name>.css`, scoped to
  `:root[data-brand="<name>"]`, exported as
  `@connor-adams/tokens/brands/<name>.css` and opt-in, so a Cashflow consumer
  ships none of another brand's bytes.

  A brand is a delta, not a fork — anything it does not name falls through to the
  active theme block. `brands/rainbot.css` is ~20 declarations for a completely
  different look (blue/violet/pink triad, its own gradient and chart ramp).

  Also documents the full override surface in the README: every token group a
  brand or an app may re-point, why the token layer must stay unlayered, and the
  components that still hard-code values a brand cannot reach.

- 96510b7: Give the token layer scrollbars.

  Scrollbars were the one piece of chrome the system did not own — no
  `scrollbar-color`, no `scrollbar-width`, no `::-webkit-scrollbar` anywhere in
  `packages/` — so under a dark theme the browser kept painting them light and
  every consumer patched it themselves. The Rainbot dashboard, for one, hand-writes
  `::-webkit-scrollbar` / `-track` / `-thumb` / `-thumb:hover` against raw hex that
  duplicates token values, plus its own `.no-scrollbar` utility.

  New semantic tokens in both theme blocks, all derived from tokens a brand or app
  already controls rather than introducing raw colour: `--scrollbar-track`
  (`--muted`), `--scrollbar-thumb` and `--scrollbar-thumb-hover` (`--border` mixed
  35% / 70% toward `--muted-foreground`), and `--scrollbar-size` (10px, honoured by
  the webkit fallback only). A brand therefore inherits correct scrollbars for
  free — `brands/rainbot.css` names none of them and still gets dark chrome.

  `base.css` applies them standards-first inside `@layer base`, so consumer CSS
  overrides without a specificity fight: `scrollbar-color` + `scrollbar-width:
thin` on `:root` (both inherit, covering the viewport bar and every scroll
  container), with a `::-webkit-scrollbar` block for Safari < 18.2 and Chromium <
  121 gated behind `@supports not (scrollbar-color: auto)` — ungated, Chromium
  prefers the `-webkit-` pseudo-elements and the fallback quietly becomes the real
  implementation. `scrollbar-gutter` is untouched (global layout-shift risk) and
  `::-webkit-scrollbar-button` is left to the platform.

  Adds a `.ca-no-scrollbar` utility (unlayered, so it beats the base layer) for
  horizontal overflow regions such as `Tabs`. It hides the bar without disabling
  scrolling; the README documents the `tabindex="0"` + accessible-name pairing that
  keeps such a region keyboard-reachable.

## 0.1.1

### Patch Changes

- c1ec281: Fix a total CSS load failure in Next.js consumers. The previous layer setup
  applied cascade layers through `@import "..." layer(base|components)` in
  `styles.css`. Next.js's CSS pipeline silently drops layered `@import`s, so the
  whole stylesheet — tokens and components — failed to load: pages rendered
  completely unstyled (serif fallback, no token variables).

  Layers are now baked into the files instead: the token base element resets live
  in `@layer base` (in `tokens/base.css`) and the bundled component CSS is wrapped
  in `@layer components` at build time (tsup `onSuccess`). `styles.css` uses plain
  `@import`, which both Next.js and Vite inline correctly. Cascade order is
  base < components < unlayered: components beat the base resets (e.g. the
  form-control `font: inherit`) while consumer styles still override components.

  Verified in both the Next web app and Storybook (Vite): CSS loads and a default
  Button computes `font-weight: 600`.
