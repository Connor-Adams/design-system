---
'@connor-adams/designsystem': minor
---

Add `Toaster` — a real toast host — plus `toast()` and `useToast()`, and derive `Toast`'s live-region strength from its variant.

`Toast` was presentational by design and said so, but the design system never shipped the other half: no auto-dismiss, no enter/exit animation, no positioning or stacking container, no portal. Every consuming app hand-rolled that host, and the hand-rolled version has a failure mode that is silent and hard to spot: when `useToast()` owns its own `useState`, each caller gets a *separate* queue, so a toast fired from a screen whose container nothing renders is dropped with no error anywhere. That shipped in a consuming dashboard — one screen rendered the container, another fired into its own instance, and every one of its toasts vanished.

`Toaster` closes the gap and makes that bug unrepresentable:

- The queue is a single module-level store, so `toast()` is callable from event handlers, API layers and other non-React code, and `useToast()` is a `useSyncExternalStore` read of the same queue. There is deliberately no provider — a provider is what invites the split-state mistake — and two mounted `Toaster`s render one stack rather than duplicates.
- Portalled fixed stack with six `position` options, `max` visible toasts with the overflow collapsed into a `+N more` count, and a `gap`.
- Per-toast `duration` with `Infinity`/`0` to persist, and timers that pause while the stack is hovered or holds focus, so a toast cannot vanish mid-read or while its action button is focused.
- Enter/exit animation in CSS, keyed off `data-position`/`data-state` and disabled under `prefers-reduced-motion`.
- Reusing a toast `id` updates that toast in place (loading to success) instead of stacking a second one.

`Toast` also had `role="status"` and `aria-live="polite"` hardcoded, so an `error` toast could not escalate past a polite announcement. Both are now derived from `variant` — `error` announces as `alert`/`assertive`, every other variant stays `status`/`polite` — with explicit `role` and `aria-live` props to override. The viewport itself is a `role="region"` landmark and deliberately not a live region, so adding one toast does not re-announce the whole stack.
