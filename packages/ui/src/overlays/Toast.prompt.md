A transient confirmation that floats bottom-right (transaction saved, statement imported, sync failed). Auto-dismiss after a few seconds; keep copy to one line.

```jsx
<Toast variant="success" title="Statement imported" onClose={dismiss}>
  312 transactions added from Amex Cobalt.
</Toast>
```

Variants: `default | success | error | warning | info`. Optional `action` node under the body. `error` announces as an assertive `alert`; the rest are polite `status` (override with `role` / `aria-live`). Presentational — for auto-dismiss, stacking, positioning and a portal, mount `Toaster` and call `toast()` instead of driving this from your own state.
