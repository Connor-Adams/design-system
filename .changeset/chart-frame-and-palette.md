---
'@connor-adams/designsystem': minor
---

Add the missing chart layer: a JS chart palette export and `ChartFrame`.

`--chart-1..5`, `--chart-line-1..6` and the domain aliases have existed in
`semantic.css` (both themes) and in `brands/rainbot.css` since the brand scope
landed, but there was no way to reach them from JS. Charting libraries take
their colors as props rather than classes, so consumers hard-coded hex and the
charts stopped tracking the theme — in the Rainbot dashboard alone, 51 such
sites across 22 files (25× `contentStyle={{ backgroundColor: '#1f2937', … }}`,
26× `tick={{ fill: '#9ca3af', fontSize: 12 }}`, plus raw `fill="rgb(59, 130,
246)"` and `labelLine={{ stroke: '#6b7280' }}`).

- `chartColors` / `chartTheme` / `chartColor(i)` / `chartLineColor(i)` export
  the categorical ramp, the line ramp, the domain aliases, and axis, grid and
  tooltip styling as CSS `var()` **strings**, never resolved colors. `var()`
  resolves in SVG presentation attributes as well as inline styles, so one set
  of props stays light/dark- and brand-reactive with no JS theme detection, no
  `getComputedStyle`, and no re-render on a theme flip. No new tokens: grid and
  axis lines compose `--border`, tick text `--muted-foreground`, the tooltip the
  `--popover` family, all of which already resolve correctly in both themes and
  under every brand.
- Published at the new `@connor-adams/designsystem/chart` subpath as well as
  through the barrel. The subpath entry is React- and CSS-free, so a consumer
  who only wants the palette does not pull in the component stylesheet
  side-effect.
- `ChartFrame` is the frame those charts were missing: the card shell, an
  optional title / subtitle / **actions** header row, a `width: 100%` plot box
  of a known height, and an optional footer. `height` takes a number or
  `'auto'`, where the height is `rowCount × rowHeight` clamped to
  `minHeight`..`maxHeight` — the horizontal-bar case that previously showed up
  as hand-rolled `height: Math.max(200, data.length * 32)`.
- Deliberately chart-library agnostic: `packages/ui` still has no npm
  dependencies. `children` is whatever the consuming app renders inside.
- The frame's shell duplicates `.ca-card` off the same tokens rather than
  composing `Card`, because `Card`'s padding is currently fixed at `20px` and
  `CardHeader` has no actions slot. It should be recomposed onto `Card` once
  that component gains a padding scale and a header actions slot.
