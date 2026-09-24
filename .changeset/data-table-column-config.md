---
'@connor-adams/designsystem': minor
---

Add DataTable, and make the Table head sticky and its scroll container styleable.

`data/Table` shipped compose-yourself primitives only, so every consumer with a
"columns + rows" shape rebuilt the same wrapper by hand — the Rainbot dashboard
alone carries 14 raw `<table>` elements across 11 files plus its own generic
column-config component. None of those hand-rolls sort accessibly: the package
had no `aria-sort` anywhere, and the usual shortcut is a click-only `<th>` that
keyboard users cannot reach.

`DataTable` is a thin composition **over** those primitives (not a fork), so the
borders, hover tint and cell metrics stay in lockstep with hand-composed tables.
It is generic over the row type: a column with no `render` must key a real field
of the row, so a typo is a compile error instead of an empty cell. Sorting is
controlled and deliberately presentational — DataTable renders a real
keyboard-operable `<button>` in the head cell and puts the correct `aria-sort` on
the `<th>`, then reports the next state (asc → desc → cleared); the consumer
still owns the ordering. `getRowKey` is required rather than defaulting to the
array index, which silently corrupts row state under sorting or pagination.
`loading` swaps the body for `Skeleton` rows behind `aria-busy`, and `empty`
fills a column-spanning cell.

Two `Table` defects fixed alongside, both backwards compatible:

- `.ca-table-head` was not sticky, so the `maxHeight` prop — whose only purpose
  is to create a scroll region — scrolled the header out of view. It now pins
  with an explicit `var(--card)` background (it had none, so a naive
  `position: sticky` would have let rows bleed through) and an inset box-shadow
  separator, since collapsed borders do not paint on a stuck cell. With no
  scroll region, sticky is a no-op, so existing call sites are unchanged.
- `.ca-table-container` took no class, leaving the scroll region unstylable. New
  optional `containerClassName` prop; `className` still targets the `<table>`.
