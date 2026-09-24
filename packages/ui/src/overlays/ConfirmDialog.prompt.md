The `window.confirm` replacement: an `alertdialog` with a title, one consequence line, and exactly two buttons. Reach for it before any destructive action (delete transaction, remove account, merge categories). Built on `Dialog`, so it inherits the focus trap, focus restore, dismiss stack and scroll lock.

```jsx
<ConfirmDialog
  open={open}
  tone="destructive"
  title="Delete transaction?"
  description="This removes it from all reports. You can't undo this."
  confirmLabel="Delete"
  onConfirm={async () => { await api.remove(id) }}  // stays open + pending until it settles
  onClose={() => setOpen(false)}
/>
```

For the one-for-one `window.confirm` swap, use the hook — no provider, just render `dialog` once:

```jsx
const { confirm, dialog } = useConfirm({ tone: 'destructive' })
// ...
if (await confirm({ title: 'Delete sound?' })) remove(id)
// ...
return <>{button}{dialog}</>
```

Variants: `tone="default" | "destructive"` (destructive focuses **Cancel**, so a reflexive Enter can't delete), `size="sm" | "default" | "lg"` (default `sm`). Props: `confirmLabel`, `cancelLabel`, `onCancel`, `pending` (force the spinner), `onError` (a rejected `onConfirm` is surfaced, never swallowed — without `onError` it re-throws to the nearest error boundary).
