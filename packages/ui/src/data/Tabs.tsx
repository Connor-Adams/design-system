import * as React from 'react'
import './Tabs.css'

/**
 * Cashflow Tabs. A pill tablist: muted track, the active pill lifts to a white
 * --card surface with a soft shadow. Controlled — pass `value` + `onValueChange`
 * and an `items` array of { value, label }.
 *
 * KEYBOARD (ARIA tabs pattern, roving tabindex): ArrowLeft / ArrowRight wrap
 * around the ends, Home jumps to the first tab, End to the last. Activation is
 * **automatic** — moving focus also selects. That keeps focus and `value`
 * identical, so the component stays purely controlled with no internal
 * "focused but unselected" state, and keyboard matches pointer (a click selects
 * immediately, so an arrow should too). The tablist is
 * `aria-orientation="horizontal"`, so ArrowUp / ArrowDown are deliberately
 * unmapped — per APG those belong to a vertical tablist, and this component's
 * layout and its `overflow="scroll"` axis are both horizontal.
 *
 * OVERFLOW: `overflow="wrap"` (the default, and today's behaviour) lets a long
 * bar wrap onto several rows. `overflow="scroll"` keeps it on one row with
 * horizontal scroll, scroll-snap, a masked edge affordance, and scrolls the
 * selected pill into view whenever `value` changes (honouring
 * `prefers-reduced-motion`).
 *
 * PANELS are the consumer's — Tabs renders only the tablist. Pass `panelId` on
 * an item to wire that tab's `aria-controls`; every tab also carries a stable
 * `id` (override per item with `tabId`) so the panel can point back with
 * `aria-labelledby`.
 *
 * Hover, the focus ring, the active lift and the edge fades all live in
 * `Tabs.css`, keyed off `data-state` / `data-overflow` /
 * `data-overflow-start` / `data-overflow-end` — no `useState`, no
 * `onMouseEnter`.
 */

/** `wrap` (default) lets a long bar wrap; `scroll` keeps one scrolling row. */
export type TabsOverflow = 'wrap' | 'scroll'

export interface TabItem {
  value: string
  label: React.ReactNode
  /** `id` of the consumer's `role="tabpanel"` element — wires `aria-controls`. */
  panelId?: string
  /** Override the auto-generated trigger `id` (what a panel `aria-labelledby`s). */
  tabId?: string
}

/** Controlled pill tabs. Active pill lifts to a white card surface. */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[]
  value: string
  onValueChange?: (value: string) => void
  /** `wrap` (default) preserves the multi-row wrap; `scroll` scrolls one row. */
  overflow?: TabsOverflow
}

/**
 * Inset kept clear at each end in scroll mode. Must stay in sync with
 * `--ca-tabs-fade-size` in Tabs.css, so a pill never parks under the fade.
 */
const EDGE_INSET = 28

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { items, value, onValueChange, overflow = 'wrap', className, onKeyDown, ...props },
  ref,
): React.JSX.Element {
  const autoId = React.useId().replace(/:/g, '')
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null): void => {
      listRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [ref],
  )

  const activeIndex = items.findIndex((item) => item.value === value)

  // Edge affordance. CSS cannot read scrollLeft, so report the live geometry as
  // data-* and let Tabs.css draw the fades. Written straight onto the node —
  // no state, so scrolling never re-renders.
  React.useEffect((): (() => void) | undefined => {
    const list = listRef.current
    if (!list) return undefined
    if (overflow !== 'scroll') {
      delete list.dataset.overflowStart
      delete list.dataset.overflowEnd
      return undefined
    }
    const sync = (): void => {
      const max = list.scrollWidth - list.clientWidth
      list.dataset.overflowStart = list.scrollLeft > 1 ? 'true' : 'false'
      list.dataset.overflowEnd = max > 1 && list.scrollLeft < max - 1 ? 'true' : 'false'
    }
    sync()
    list.addEventListener('scroll', sync, { passive: true })
    // `scroll` can stop firing a beat before a smooth scroll settles, which
    // would leave a fade up for a moment after the strip came to rest.
    list.addEventListener('scrollend', sync)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(sync) : null
    observer?.observe(list)
    return () => {
      list.removeEventListener('scroll', sync)
      list.removeEventListener('scrollend', sync)
      observer?.disconnect()
    }
  }, [overflow, items.length])

  // Keep the selected pill visible when `value` changes. Scrolls the tablist
  // itself (never an ancestor, the way scrollIntoView would).
  React.useEffect((): void => {
    if (overflow !== 'scroll' || activeIndex < 0) return
    const list = listRef.current
    const tab = triggerRefs.current[activeIndex]
    if (!list || !tab || typeof list.scrollBy !== 'function') return
    const listBox = list.getBoundingClientRect()
    const tabBox = tab.getBoundingClientRect()
    let left = 0
    if (tabBox.left < listBox.left + EDGE_INSET) left = tabBox.left - listBox.left - EDGE_INSET
    else if (tabBox.right > listBox.right - EDGE_INSET) left = tabBox.right - listBox.right + EDGE_INSET
    if (left === 0) return
    list.scrollBy({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [overflow, activeIndex, items.length])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented || items.length === 0) return
    const from = activeIndex < 0 ? 0 : activeIndex
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = (from + 1) % items.length
        break
      case 'ArrowLeft':
        next = (from - 1 + items.length) % items.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    const target = items[next]
    if (!target) return
    triggerRefs.current[next]?.focus()
    if (target.value !== value) onValueChange?.(target.value)
  }

  return (
    <div
      ref={setListRef}
      role="tablist"
      aria-orientation="horizontal"
      data-slot="tabs"
      data-overflow={overflow}
      className={className ? `ca-tabs ${className}` : 'ca-tabs'}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {items.map((item, index) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            ref={(node) => {
              triggerRefs.current[index] = node
            }}
            type="button"
            role="tab"
            id={item.tabId ?? `${autoId}-tab-${item.value}`}
            aria-selected={active}
            aria-controls={item.panelId}
            tabIndex={active ? 0 : -1}
            data-slot="tabs-trigger"
            data-state={active ? 'active' : 'inactive'}
            className="ca-tabs-trigger"
            onClick={() => onValueChange?.(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
})
