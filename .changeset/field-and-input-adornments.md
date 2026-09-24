---
'@connor-adams/designsystem': minor
---

Add the Field component and give Input somewhere to hang an adornment.

`Field` wraps a label, a control and one hint-or-error line, and wires the
accessibility that consumers were hand-writing: it generates an id when none is
given, sets the composed `Label`'s `htmlFor`, links the message through
`aria-describedby`, sets `aria-invalid` when there is an error and
`aria-required` when the field is required. An element child is cloned with
those props; a control that cannot take DOM props can use the render-prop form.
Error takes precedence over hint — the hint is not rendered while `error` is set,
so `aria-describedby` never points at stale help text.

`Input` gains `leadingIcon`, `trailingIcon`, `clearable`, `onClear` and
`clearLabel`. The clear button is a real focusable `<button>` with an accessible
name, and is disabled (so out of the tab order) while there is nothing to clear.
Adornment space is reserved in CSS off `data-leading` / `data-trailing`, never
measured in JS. A field with no adornment renders exactly as before — a single
bare `<input>`, no wrapper — and the ref always forwards to the `<input>`.
