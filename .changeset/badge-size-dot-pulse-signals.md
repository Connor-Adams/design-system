---
'@connor-adams/designsystem': minor
---

Badge: add `size`, `dot` and `pulse` props plus the missing `warning` / `info` variants.

- **`size?: 'sm' | 'default'`** — the hard-coded `2px 8px` padding moves onto `data-size`. `variant="count"` keeps its own bespoke bold/uppercase scale and `size` selects *within* it (via `[data-variant='count'][data-size='…']`), so an unsized `count` pill is unchanged.
- **`dot?: boolean`** — a real leading status dot tinted from the variant, rather than asking consumers to pass one as a child. Covers the pattern that was previously hand-rolled per app (and that `Avatar`'s avatar-only `status` dot and `AccountCard`'s inline-styled dot could later share).
- **`pulse?: boolean`** — gently expands and fades a halo out of the dot (1.6s, matching the system's existing slow-ambient cadence; implies `dot`). The loop is scoped to the 6px dot, never the label, and is removed entirely under `prefers-reduced-motion`.
- **`warning` / `info` variants** — Badge was the only signal-bearing component without them; `Alert` and `Toast` both already carry the four-way semantic vocabulary. Uses the existing `--warning-bg` / `--warning-foreground` / `--info-bg` / `--info-foreground` tokens.

Backwards compatible: every existing call site renders visually unchanged with no new props passed.
