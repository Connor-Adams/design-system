---
'@connor-adams/designsystem': minor
---

Make `Card` configurable instead of forcing consumers to hand-roll panels.

`Card` was the most-used and least-configurable component in the system: one
appearance, and `padding: 20px` hard-coded in `Card.css` with `className`/`style`
as the only escape. Downstream that produced 57 hand-rolled card shells in a
single dashboard (a page panel, a nested setting card, and a chart/section card)
because none of them could be a `Card`.

- `Card` gains `variant` (`default` | `nested` | `plain`), `padding`
  (`none` | `sm` | `default` | `lg`) and `radius` (`md` | `lg` | `xl`). All three
  are emitted as `data-variant` / `data-padding` / `data-radius` and resolved in
  `Card.css` off the `--space-*` / `--radius-*` token ladders — no inline style
  arithmetic, no new hard-coded px. `nested` is the inset `--muted` surface for
  cards inside cards (border kept, shadow dropped); `plain` drops border, shadow
  and fill for consumers supplying their own frame.
- Padding and radius resolve through `--ca-card-padding` / `--ca-card-radius`, so
  a one-off can be re-pointed with a custom property instead of fighting the
  `padding` shorthand.
- `CardHeader` gains an `actions` slot: a `ReactNode` placed on the trailing edge
  while the title/description keep stacking on the leading edge. The actions are
  rendered *after* the text in the DOM, so a screen reader still reaches the
  title first; the side-by-side placement is CSS only.
- `.ca-card-content` finally has a rule. It stays padding-free on purpose — the
  root owns the padding and stacking the two is a known bug class — and the
  intent is now documented in the CSS rather than implied by an absent selector.
- New exported types: `CardVariant`, `CardPadding`, `CardRadius`,
  `CardHeaderProps`, `CardTitleProps`, `CardDescriptionProps`, `CardContentProps`.

Backwards compatible. `--space-5` is `1.25rem`, the token spelling of the old
literal `20px`, so a `<Card>` with no props resolves to byte-identical computed
styles (padding, radius, border, fill, shadow) and an identical box height; a
`CardHeader` with no `actions` emits exactly the markup it did before — no
wrapper element, no extra attribute.
