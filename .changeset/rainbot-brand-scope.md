---
'@connor-adams/tokens': minor
---

Add a brand axis to the token layer, and Rainbot as its first named brand.

Theming previously had one axis (`[data-theme]` light/dark) with Cashflow's
palette baked into `:root`, so a second product could only override the semantic
layer by specificity from inside its own app. Brands are now a second,
orthogonal axis: `packages/tokens/src/brands/<name>.css` scoped to
`:root[data-brand="<name>"]`, exported as `@connor-adams/tokens/brands/<name>.css`
and opt-in, so a Cashflow consumer ships none of another brand's bytes.

Adds `brands/rainbot.css` — a dark-only brand on a blue/violet/pink triad. It
redefines the complete semantic surface (all 55 tokens) rather than only the
deltas, so no token falls through to Cashflow's palette. Note it deliberately
diverges on `--secondary`, which is a saturated violet brand hue under Rainbot
where Cashflow uses a quiet neutral chip surface.
