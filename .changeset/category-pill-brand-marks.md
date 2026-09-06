---
"@connor-adams/designsystem": patch
---

Fix `CategoryPill` rendering an empty icon for `brand:` names. Since brand marks moved onto `Icon`, `IconName` spans stroke glyphs and `brand:<slug>` marks, but `CategoryPill` still indexed the stroke-glyph registry directly — so `iconName="brand:spotify"` (or a `brand:` value in the `overrides` map) produced an empty `<svg>`. It now branches on the prefix and renders the brand mark as a filled path tinted with the pill's color. This also unbreaks the package's `.d.ts` build, which was failing on the same implicit-`any` index.
