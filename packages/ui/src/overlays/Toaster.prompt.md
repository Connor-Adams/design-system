The host that actually shows toasts — mount `<Toaster />` once near the app root, then fire `toast()` from anywhere (event handlers, API layers, non-React code). Do not hand-roll a container: a hook that owns its own state gives every caller a separate queue, and toasts fired from a screen whose container nothing renders are silently dropped.

```jsx
// app root — once
<Toaster position="bottom-right" max={3} />

// anywhere, no hook and no provider needed
toast.success('Statement imported', { description: '312 transactions added.' })
toast.error('Sync failed', { duration: Infinity })

// or from a component
const { toasts, toast } = useToast()
```

Props: `position="top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"`, `max` (visible count, rest collapse to `+N more`, `0` shows all), `gap`, `duration` (default ms), `container` (portal target). Per-toast: `{ id, variant, title, description, action, duration, dismissible, onDismiss }` — `duration: Infinity` or `0` persists, and timers pause while the stack is hovered or holds focus. Reusing an `id` updates that toast in place. Also `toast.dismiss(id?)` (no id dismisses all) and `toast.clear()`.
