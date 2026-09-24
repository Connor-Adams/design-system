---
'@connor-adams/designsystem': patch
---

Fix `Field` labelling group-shaped controls (`Stepper`, `RadioGroup`, `ToggleGroup`).

`Field` wired every child the same way: inject `id`, point the label's `htmlFor`
at it. For a container carrying `role="group"` / `role="radiogroup"` that
associates with nothing — `htmlFor` only resolves to a *labelable* element — so
clicking the label focused nothing and the group had no accessible name. It
failed silently, because the label still rendered as adjacent text and
`aria-describedby` still announced.

Those three controls now declare their shape, and `Field` names a group-shaped
child with `aria-labelledby` pointing at the label (which now always carries an
id) instead of `htmlFor` pointing at the control. `aria-describedby`,
`aria-invalid` and `aria-required` continue to land on the group root.
Labelable children are unchanged.
