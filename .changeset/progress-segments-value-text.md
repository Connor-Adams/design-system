---
'@connor-adams/designsystem': minor
---

Progress: free-form `valueText`, stacked `segments`, and a named progressbar.

`showValue` hard-coded `{Math.round(pct)}%`, so time, counts, and byte totals had
to be hand-rolled next to the bar. `valueText` now takes any node and replaces
the generated percent in the existing value slot (`"1:23 / 4:56"`, `"3 of 7"`,
`"820 MB / 2 GB"`); a string `valueText` is also mirrored to `aria-valuetext` so
screen readers announce the real readout instead of a percentage. `showValue`
keeps working untouched.

`segments={[{ value, tone?, label? }]}` renders a stacked bar and supersedes
`value` and `indeterminate`. Values are percentages of the track: under 100 they
keep their authored widths (a half-full split bar stays half full), and over 100
every band is scaled down proportionally so the stack fills exactly one track —
nothing is clipped or dropped — with `data-overflow="true"` on the track. A
segment's `tone` falls back to the bar's `tone`.

Accessibility fix: `role="progressbar"` received no accessible name even when
`label` was set — the label rendered as an unlinked sibling span. `label` is now
wired to the bar with `aria-labelledby`, and `aria-label` / `aria-labelledby`
passed as props are forwarded to the bar (they previously landed on the wrapper
div, where they were inert) and win over `label`. In segmented mode a stack is
not one progressbar: when any segment has a `label` the track becomes a labelled
`group` and each labelled segment is its own `progressbar`, while an
all-unlabelled stack stays a single progressbar reporting the clamped total.

Also: track heights moved off inline pixels (`4 / 8 / 12`) onto the spacing
tokens via `data-size` in `Progress.css`, and `prefers-reduced-motion` now
disables the fill/segment width transitions as well as the indeterminate sweep.
