---
'@connor-adams/designsystem': minor
---

Add `StatGrid` — the KPI row container for `StatCard`.

Until now the package had no layout component at all, so every consumer
hand-rolled the metric row: the rainbot dashboard alone repeats one tile shell
28 times across 5 files, and a sixth file has already drifted to a different
background and radius. `StatGrid` owns that layout.

`columns` takes a number or `'auto'` (the default intrinsically responsive
auto-fit grid, sized by `minItemWidth`), `gap` steps the `--space-*` ladder, and
`divided` swaps the gutters for hairline separators — the dense KPI strip. The
whole grid lives in CSS, driven by `data-*` and two custom properties, so there
are no media queries or measurements in JS. It accepts any children and never
introspects or clones them.

`StatCard` gains an optional `bare` prop that drops the card shell (border,
background, elevation) and keeps the padding, for tiles inside a container that
already draws one. A `StatCard` placed directly in a `divided` grid gets the
same treatment automatically, so the separators never double up against the
tile's own border.
