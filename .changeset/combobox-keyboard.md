---
'@connor-adams/designsystem': major
---

Make `Combobox` keyboard-operable, and make its `disabled` prop real.

`Combobox` shipped with no keyboard operation *at all* — there was no `onKeyDown`
anywhere in it, so the only way to choose an option was a mouse click. It also
had no `role="combobox"`, `aria-expanded`, `aria-controls` or
`aria-activedescendant`: the input announced as a plain textbox with a `listbox`
floating next to it that nothing claimed to own. For anyone adopting it as an
accessibility upgrade over a native `<select>`, it was a downgrade.

It now implements the ARIA 1.2 combobox pattern with `aria-activedescendant`:

- **ArrowDown / ArrowUp** open the list and move the active row, wrapping at both
  ends (the same wrap-around `Tabs` uses). Opening is seeded on the committed
  value, else the first / last row.
- **Home / End** jump to the first / last row *while the list is open*, and are
  left to the text caret while it is closed, so editing the filter still works.
- **Enter** commits the active row. With nothing active — or with the list closed
  — Enter is left alone so a wrapping form still submits.
- **Escape** closes and discards the typed filter, leaving the committed value
  untouched. Only claimed while the list is open: closed, it bubbles, so a
  Combobox inside a `Dialog` no longer swallows the Dialog's Escape.
- **Alt+ArrowDown** opens without moving the active row; **Alt+ArrowUp** closes.
- **Tab** closes the list and is never `preventDefault`ed, so focus moves on.
- **Blur** behaves like Escape: the filter is discarded, the value stands.

`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`,
`aria-autocomplete="list"` and `aria-activedescendant` now sit on the search
`<input>`, with ids derived from `React.useId()` so two Comboboxes on a page
never collide. The listbox stays mounted (`hidden` while closed) so
`aria-controls` always resolves; it is deliberately *not*
`aria-multiselectable`, since this is a single-select and `false` is the default.

**Selection does not follow focus.** Arrowing moves `aria-activedescendant`
only; `onValueChange` fires on Enter or a click. The APG allows either, and
`Tabs` in this package takes the other branch — but a tab strip's focus *is* its
value, whereas here the active row and the committed value are separate, and
consumers reconcile, refetch and navigate on `onValueChange`.

`disabled` is now a real prop. It was never in `ComboboxProps`, so a consumer
passing it had it spread onto the presentational wrapper `<div>`, where it does
nothing — a silent no-op. It now reaches the inner `<input>` (which therefore
leaves the tab order), blocks opening by focus, click and key, and is reflected
as `data-disabled` on the wrapper, matching `Slider` and `Stepper`.

The active row is kept scrolled inside the panel's `max-height` by adjusting the
list's own `scrollTop` — never `scrollIntoView`, which would scroll ancestors
too.

**Breaking (twice over), which is why this is `major` and not `minor`:**

1. **`role="combobox"` changes what role queries find.** A consumer's
   `getByRole('textbox')` — or any `[role=textbox]` / a11y-snapshot assertion —
   stops matching the search input. Nine such queries in this package's own
   `Combobox.test.tsx` broke and were migrated. Migration: query
   `getByRole('combobox')`, or better `getByLabelText` / `getByRole('combobox',
   { name })`, which survives future role changes.
2. **Options are no longer `<button>`s.** They are non-focusable
   `<div role="option">` elements, because in the `aria-activedescendant` pattern
   focus must stay on the input — and focusable options are exactly what made
   Tab trap inside the open list. `getByRole('option')` and `aria-selected` are
   unchanged; `getByRole('button')` and a `.ca-combobox-option` selector
   assuming `button` semantics (or the now-removed
   `.ca-combobox-option:focus-visible` ring) are not. The keyboard-active row is
   styleable as `[data-highlighted="true"]`; `[data-active="true"]` still means
   *selected*, unchanged.
