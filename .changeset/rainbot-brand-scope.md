---
'@connor-adams/tokens': minor
---

Add a brand axis to the token layer, with Rainbot as the first named brand.

Theming had one axis — `[data-theme]` light/dark — with Cashflow's palette baked
into `:root`, so a second product could only restyle the system by overriding
the semantic layer from inside its own app. Brands are now a second, orthogonal
axis: `packages/tokens/src/brands/<name>.css`, scoped to
`:root[data-brand="<name>"]`, exported as
`@connor-adams/tokens/brands/<name>.css` and opt-in, so a Cashflow consumer
ships none of another brand's bytes.

A brand is a delta, not a fork — anything it does not name falls through to the
active theme block. `brands/rainbot.css` is ~20 declarations for a completely
different look (blue/violet/pink triad, its own gradient and chart ramp).

Also documents the full override surface in the README: every token group a
brand or an app may re-point, why the token layer must stay unlayered, and the
components that still hard-code values a brand cannot reach.
