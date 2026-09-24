---
'@connor-adams/designsystem': major
---

Route `id`, `name` and labelling/validation `aria-*` to the focusable element in
Combobox and Slider; expose Stepper as a labelled group.

A `Field` wrapper (label + control + hint + error) works by cloning its child and
injecting `id`, `aria-describedby`, `aria-invalid` and `aria-required`, then
pointing the label's `htmlFor` at that `id`. Combobox and Slider spread `...props`
onto their outer presentational wrapper, so the injected `id` landed on a `<div>`:
`htmlFor` pointed at a non-labelable element, `label.control` was `null`, and
clicking the label focused nothing. It failed *silently* — the label still read as
adjacent text and the hint still announced — which is worse than failing loudly.

Both now split their props through a single shared allow-list
(`forms/fieldProps.ts`), so they cannot drift: `id`, `name`, `aria-label`,
`aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required` and
`aria-errormessage` go to the focusable inner element (Combobox's search
`<input>`, Slider's `input[type=range]`); everything else — `className`, `style`,
`data-*`, handlers, wrapper-level ARIA such as `aria-orientation` — stays on the
wrapper, exactly as before. `ref` is unchanged: it already forwarded to those
inner inputs. Both also accept `name` explicitly now.

Stepper is inherently multi-element — the −/+ buttons take focus, the readout does
not — so no single `id` can be labelable. Its root now carries `role="group"`
(additive; it previously had no role) so an injected `aria-labelledby` /
`aria-describedby` actually announces. Name it with `aria-labelledby`, not
`<label htmlFor>`. RadioGroup (`role="radiogroup"`) and ToggleGroup
(`role="group"`) already worked this way and are unchanged.

**Breaking:** `id` no longer lands on the Combobox / Slider wrapper element. A
consumer who passed `id` and then targeted that wrapper — `#myId { width: 320px }`
in CSS, or `document.querySelector('#myId')` — now resolves to the inner input
instead, which will size or match the wrong node. This is `major` rather than
`minor` because the selector target genuinely moves on a 1.x package, even though
the wrapper was never the documented styling hook (`.ca-combobox` /
`.ca-slider` and `[data-slot]` are, and still are) and there is no
non-breaking path: fixing label association requires the `id` to be on the
labelable element. Migration: style off `className`, `.ca-combobox` /
`.ca-slider`, or `[data-slot="combobox"]` / `[data-slot="slider"]` instead of the
`id`.
