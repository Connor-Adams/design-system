A modal for confirmations and short forms (delete transaction, edit category, add account). Keep the footer to one primary + one secondary Button. For a plain yes/no, reach for `ConfirmDialog` instead of hand-rolling the footer.

```jsx
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete transaction?"
  description="This removes it from all reports. You can't undo this."
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="destructive" onClick={confirm}>Delete</Button>
  </>}
/>
```

Variants: `size="sm" | "default" | "lg"`. Closes on scrim click and Escape — turn either off with `closeOnOverlayClick={false}` / `closeOnEscape={false}` (a closed-off dialog still swallows Escape rather than leaking it to the layer below).

Handled for you: portal to `document.body`, body scroll lock, focus moved in on open and restored on close, Tab trapped inside, and `role="dialog" aria-modal` + `aria-labelledby`/`aria-describedby` on the card. `initialFocus` picks the element to focus; `portal={false}`/`container` change where it renders; `lockScroll={false}` leaves the page scrollable.

Escape runs through a shared dismiss stack, so only the topmost layer closes — an open `DropdownMenu` inside a Dialog takes Escape for itself. A nested widget that is not a dismiss layer can still claim Escape first with `stopPropagation()`; a new overlay joins the stack with `useDismissLayer({ active, onDismiss })`.
