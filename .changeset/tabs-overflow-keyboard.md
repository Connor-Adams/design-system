---
'@connor-adams/designsystem': minor
---

Fix `Tabs` overflow and keyboard navigation.

`Tabs` set up a roving tabindex (`tabIndex={active ? 0 : -1}`) but shipped no
`onKeyDown`, so arrow keys did nothing and only the selected tab was reachable
at all — a WCAG 2.1.1 / ARIA-tabs-pattern failure, and the reason consumers
abandoned it for hand-rolled `<button>` rows with no tablist semantics. It now
implements the pattern: ArrowLeft / ArrowRight wrap around the ends, Home and
End jump to the first and last tab. Activation is **automatic** (moving focus
selects), which keeps focus and `value` identical so the component stays purely
controlled with no internal focused-but-unselected state, and matches the
pointer behaviour where a click selects at once. The tablist stays
`aria-orientation="horizontal"` and ArrowUp / ArrowDown stay unmapped, per APG —
the pill layout and the new scroll axis are both horizontal. A consumer
`onKeyDown` still fires first and can opt out with `preventDefault()`.

Adds `overflow?: 'wrap' | 'scroll'`, defaulting to `'wrap'` so every existing
call site keeps its current multi-row behaviour. `'scroll'` keeps the bar on one
row with horizontal scroll, scroll-snap, and an edge affordance that fades only
the side that still has tabs off-screen — driven from CSS off
`data-overflow-start` / `data-overflow-end`, which the component writes straight
onto the node from live scroll geometry (CSS cannot read `scrollLeft`), with no
state and so no re-render per scroll event. The selected pill is scrolled into
view when `value` changes, animated unless `prefers-reduced-motion` is set. The
scrollbar is hidden: the track is one pill tall, so an OS scrollbar would eat a
third of it and on Windows never auto-hides. Nothing becomes unreachable —
arrow keys move the roving focus and pull the scroll along, and `overflow` hides
nothing from assistive tech, so every tab keeps its `aria-selected` and
`aria-controls` in the a11y tree.

Adds optional per-item ARIA wiring for panels the consumer owns: `TabItem.panelId`
becomes that tab's `aria-controls`, and every trigger now carries a stable `id`
(overridable with `TabItem.tabId`) so a panel can point back with
`aria-labelledby`. No `tabpanel` component is introduced; `Tabs` still renders
only the tablist.

`ToggleGroup` is untouched — it remains the form-semantics sibling
(`role="group"` + `aria-pressed`, deselectable, multi-select). `Tabs` stays
navigation semantics: controlled, always exactly one selected.
