import * as React from 'react'
import { splitControlProps } from './fieldProps'
import './Combobox.css'

export type ComboboxOption = string | { value: string; label: string; hint?: string }

/**
 * Searchable single-select. Type to filter the option list; choose to commit.
 * Controlled via `value` + `onValueChange`, or uncontrolled via `defaultValue`.
 * Options may carry a `hint` (right-aligned mono note). For a short static list
 * use NativeSelect instead.
 *
 * KEYBOARD (ARIA 1.2 combobox pattern, `aria-activedescendant`): focus never
 * leaves the search `<input>`. It carries `role="combobox"` + `aria-expanded` +
 * `aria-controls` and names the active row with `aria-activedescendant`; the
 * options are non-focusable `role="option"` elements, so the list can never trap
 * Tab. ArrowDown / ArrowUp open the list (seeded on the committed value, else
 * the first / last row) and then move the active row, wrapping at both ends —
 * the same wrap-around Tabs uses. Focusing the field also opens the list, so the
 * seeding hangs off "no row is active yet" rather than off "the list was
 * closed". Home / End jump to the first / last row *while
 * the list is open*, and are left to the text caret while it is closed. Enter
 * commits the active row; Alt+ArrowDown opens without moving, Alt+ArrowUp
 * closes. Escape closes and discards the filter text.
 *
 * SELECTION DOES NOT FOLLOW FOCUS. Unlike Tabs — where moving focus also
 * selects, because a tab strip's focus and value are the same thing — the active
 * row here is separate state from the committed `value`, and only Enter or a
 * click fires `onValueChange`. Arrowing through a category list must not fire a
 * change per keystroke: consumers reconcile, refetch and navigate on
 * `onValueChange`, and the input's displayed text would flip on every press.
 * The APG allows either; this is the "manual selection" variant, which it
 * recommends whenever selecting causes more than a visual change.
 *
 * ESCAPE AND BLUR both discard the typed filter and leave the committed value
 * untouched, so the input falls back to showing the selected option's label.
 * Escape is only claimed while the list is open — closed, it is left to bubble,
 * so a Combobox inside a Dialog does not swallow the Dialog's Escape.
 *
 * The listbox is deliberately NOT `aria-multiselectable`: this is a
 * single-select, `false` is the default, and stating it only adds noise.
 *
 * Interactive states (focus ring, option hover, the selected fill and the
 * keyboard highlight) live in `Combobox.css`, keyed off `data-state` /
 * `data-active` / `data-highlighted` / `data-disabled` — no JS onMouseEnter.
 * The ref forwards to the search `<input>`.
 *
 * `id`, `name` and the labelling/validation `aria-*` attributes are routed to
 * that search `<input>` — the element that takes focus — so a `<label htmlFor>`
 * (or a `Field` wrapper injecting them) actually associates. Layout props
 * (`className`, `style`, `data-*`, handlers) stay on the wrapper.
 */
export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  /** Form control name — forwarded to the inner search `<input>`. */
  name?: string
  size?: 'sm' | 'default'
  /**
   * Disable the control: the inner `<input>` is really `disabled` (so it leaves
   * the tab order), the list can no longer be opened by focus, click or key,
   * and the wrapper reflects `data-disabled` for CSS.
   */
  disabled?: boolean
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { options = [], value, defaultValue = null, onValueChange, placeholder = 'Search…', emptyText = 'No matches', size = 'default', disabled, className, onKeyDown, ...rest },
  ref,
): React.JSX.Element {
  const { control, wrapper } = splitControlProps(rest)
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [internal, setInternal] = React.useState<string | null>(defaultValue)
  const isControlled = value !== undefined
  const selected = isControlled ? value : internal

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  // The keyboard-active row. Genuine component state (it is what
  // `aria-activedescendant` names), not styling state: -1 means "no row active".
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const optionRefs = React.useRef<Array<HTMLDivElement | null>>([])

  // One stable id per instance, so two Comboboxes on a page never collide.
  // `:` is stripped because useId's output is not a valid CSS identifier.
  const uid = React.useId().replace(/:/g, '')
  const listId = `${uid}-listbox`
  const optionId = (i: number): string => `${uid}-option-${i}`

  // A disabled control can never be open, even if `disabled` flips while it is.
  const isOpen = open && !disabled

  const selectedLabel = norm.find((o) => o.value === selected)?.label
  const filtered = query ? norm.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : norm
  // Clamp rather than sync: the list shrinks as the filter narrows, and a stale
  // index must not name an option that is no longer rendered.
  const active = activeIndex >= 0 && activeIndex < filtered.length ? activeIndex : -1

  React.useEffect(() => {
    if (!isOpen) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isOpen])

  // Keep the active row inside the panel's `max-height` viewport. Scrolls the
  // list itself via scrollTop (never an ancestor, the way scrollIntoView would),
  // and instantly — there is no animation to respect prefers-reduced-motion for.
  React.useEffect(() => {
    if (!isOpen || active < 0) return
    const list = listRef.current
    const option = optionRefs.current[active]
    if (!list || !option) return
    // The list is `position: absolute`, so it is its options' offsetParent and
    // offsetTop is measured from its own padding box.
    const top = option.offsetTop
    const bottom = top + option.offsetHeight
    if (top < list.scrollTop) list.scrollTop = top
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight
  }, [isOpen, active])

  const closeList = (): void => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  const choose = (v: string): void => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
    closeList()
  }

  /** Where the highlight lands when the list is opened by an arrow key. */
  const seed = (fallback: number): number => {
    const i = filtered.findIndex((o) => o.value === selected)
    return i >= 0 ? i : fallback
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return
    const count = filtered.length
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        // Alt+ArrowDown opens the list without moving the active row (APG).
        if (event.altKey) {
          setOpen(true)
          return
        }
        // Seeding is keyed off "no row is active", not off "the list was
        // closed": focusing the field already opens the list, so keying off
        // `isOpen` would make the first ArrowDown after a Tab-in land on row 0
        // instead of on the committed value.
        if (!isOpen) setOpen(true)
        if (count > 0) setActiveIndex(active < 0 ? seed(0) : (active + 1) % count)
        return
      case 'ArrowUp':
        event.preventDefault()
        if (event.altKey) {
          if (isOpen) closeList()
          return
        }
        if (!isOpen) setOpen(true)
        if (count > 0) setActiveIndex(active < 0 ? seed(count - 1) : (active - 1 + count) % count)
        return
      case 'Home':
      case 'End':
        // Closed, these are the text caret's keys — hijacking them would break
        // editing the filter. Only claimed while the list is showing.
        if (!isOpen) return
        event.preventDefault()
        setActiveIndex(event.key === 'Home' ? 0 : count - 1)
        return
      case 'Enter':
        // No active row (or closed) means nothing to commit — leave Enter alone
        // so a wrapping form still submits.
        if (!isOpen || active < 0) return
        event.preventDefault()
        choose(filtered[active]!.value)
        return
      case 'Escape':
      case 'Esc':
        // Closed, Escape belongs to whatever layer is above (a Dialog). Only
        // preventDefault when it is actually consumed here — the shared dismiss
        // stack reads `defaultPrevented` to decide it was claimed.
        if (!isOpen) return
        event.preventDefault()
        closeList()
        return
      case 'Tab':
        // Never preventDefault: focus must be free to move on. Just tidy up.
        if (isOpen) closeList()
        return
      default:
        return
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="combobox"
      data-size={size}
      data-disabled={disabled || undefined}
      className={className ? `ca-combobox ${className}` : 'ca-combobox'}
      onKeyDown={handleKeyDown}
      {...wrapper}
    >
      <div
        className="ca-combobox-control"
        data-state={isOpen ? 'open' : 'closed'}
        onClick={() => {
          if (!disabled) setOpen(true)
        }}
      >
        <svg className="ca-combobox-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          ref={ref}
          className="ca-combobox-input"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={isOpen && active >= 0 ? optionId(active) : undefined}
          disabled={disabled}
          value={isOpen ? query : selectedLabel || ''}
          placeholder={selectedLabel ? selectedLabel : placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value)
            if (!disabled) setOpen(true)
            // Narrowing the list highlights its best candidate, so typing then
            // pressing Enter commits the obvious match.
            setActiveIndex(0)
          }}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            // Focus moving within the control (nothing does today) is not a
            // dismissal; leaving it discards the filter, keeping the value.
            if (rootRef.current?.contains(e.relatedTarget as Node | null)) return
            closeList()
          }}
          {...control}
        />
      </div>
      {/* Always rendered so `aria-controls` always resolves; `hidden` keeps it
          out of the accessibility tree and out of `getByRole` while closed. */}
      <div ref={listRef} id={listId} role="listbox" hidden={!isOpen} className="ca-combobox-list">
        {isOpen &&
          (filtered.length === 0 ? (
            <div className="ca-combobox-empty">{emptyText}</div>
          ) : (
            filtered.map((o, i) => {
              const isSelected = o.value === selected
              return (
                <div
                  key={o.value}
                  ref={(node) => {
                    optionRefs.current[i] = node
                  }}
                  id={optionId(i)}
                  role="option"
                  className="ca-combobox-option"
                  data-active={isSelected || undefined}
                  data-highlighted={i === active || undefined}
                  aria-selected={isSelected}
                  // Keep focus on the input: a pointer press on an option must
                  // not blur the combobox (which would close the list before the
                  // click landed).
                  onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                  onClick={() => choose(o.value)}
                >
                  <span>{o.label}</span>
                  {o.hint && <span className="ca-combobox-hint">{o.hint}</span>}
                </div>
              )
            })
          ))}
      </div>
    </div>
  )
})
