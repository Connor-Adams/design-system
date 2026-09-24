---
'@connor-adams/tokens': minor
---

Give the token layer scrollbars.

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
