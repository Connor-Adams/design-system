---
'@connor-adams/designsystem': patch
---

Fix `StatGrid`'s `divided` mode on a partial last row.

The interior hairlines are drawn as an outset box-shadow on each cell, which is
what lets the mode work under `columns="auto"` — the track count is not knowable
at author time, so there is no `:nth-child` math available. But the shadows were
on each cell's left and top edge, which means the rule between the last full row
and a partial one was drawn by the cells *below* it. With seven cells across
three columns it therefore spanned only the first column and stopped in mid-air,
leaving the rest of that boundary blank and the trailing cell unclosed.

The shadows now sit on each cell's right and bottom edge instead. That makes the
horizontal rule the property of the row *above* it, which is always full, so it
always spans the whole width; and the right edge closes off a lone trailing cell,
so the empty remainder reads as an empty cell rather than a missing rule. Fully
divisible grids are unchanged — which is why this went unnoticed, since every
existing divided demo used a cell count that divided evenly by its column count.

Adds a `DividedPartialRow` story and a gallery variant with a deliberately uneven
count so the case stays visible.
