---
'@connor-adams/designsystem': minor
---

Harden `Dialog` and add `ConfirmDialog` / `useConfirm`.

`Dialog` was a scrim with a raw `document` keydown listener. Two open dialogs
both closed on one Escape, a dialog behind an open `DropdownMenu` closed with
it, focus was never moved in or restored, the page scrolled behind the modal,
`position: fixed` was at the mercy of any `transform` ancestor, and
`role="dialog" aria-modal` sat on the scrim with nothing linking the title.

- **Shared dismiss stack** (`useDismissLayer`, `pushDismissLayer`): Escape is
  handled by the topmost layer only. `DropdownMenu` now registers here instead
  of binding its own listener, so an open menu inside a dialog takes Escape for
  itself. A new overlay (`Popover`, `Drawer`) joins by calling the hook. The
  listener stays on the bubble phase so a nested widget that is not yet a layer
  can still claim Escape with `stopPropagation()`/`preventDefault()`.
- **Focus management**: focus moves into the dialog on open (`initialFocus`,
  else the first focusable child, else the card), Tab is trapped and wraps both
  ways, and focus returns to the previously focused element on close.
- **Body scroll lock** while open, ref-counted so nested dialogs behave.
  `lockScroll={false}` opts out.
- **Portal** to `document.body` by default; `container` retargets it and
  `portal={false}` restores the old in-tree rendering.
- **Accessibility**: `role` / `aria-modal` moved to the content card, with
  `aria-labelledby` / `aria-describedby` wired to the rendered `title` and
  `description`. `role="alertdialog"` and other div attributes pass through.
- **`closeOnEscape` / `closeOnOverlayClick`** make the two dismissal routes
  optional; a scrim click now only closes when it starts and ends on the scrim.

`ConfirmDialog` is the `window.confirm` replacement built on top: `title`,
`description`, `confirmLabel`, `cancelLabel`, and a `tone` of `default` or
`destructive` — destructive focuses **Cancel**, so a reflexive Enter cannot
delete. An `onConfirm` returning a promise puts the confirm button in a pending
state and holds the dialog open, non-dismissible, until it settles; a rejection
is reported through `onError` or re-thrown to the nearest error boundary, never
swallowed. `useConfirm()` gives the `if (await confirm(...))` shape with no
provider to install.

All existing props keep their behavior and defaults. Two changes are visible to
code that reaches past the public props: the dialog renders under
`document.body` unless `portal={false}`, and `getByRole('dialog')` now matches
the content card rather than the scrim.
