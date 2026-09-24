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
 * Interactive states (focus ring, option hover/active highlight) live in
 * `Combobox.css`, keyed off `data-state` / `data-active` — no JS onMouseEnter.
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
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { options = [], value, defaultValue = null, onValueChange, placeholder = 'Search…', emptyText = 'No matches', size = 'default', className, ...rest },
  ref,
): React.JSX.Element {
  const { control, wrapper } = splitControlProps(rest)
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [internal, setInternal] = React.useState<string | null>(defaultValue)
  const isControlled = value !== undefined
  const selected = isControlled ? value : internal

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selectedLabel = norm.find((o) => o.value === selected)?.label
  const filtered = query ? norm.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : norm

  const choose = (v: string) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
    setOpen(false)
    setQuery('')
  }

  return (
    <div
      ref={rootRef}
      data-slot="combobox"
      data-size={size}
      className={className ? `ca-combobox ${className}` : 'ca-combobox'}
      {...wrapper}
    >
      <div className="ca-combobox-control" data-state={open ? 'open' : 'closed'} onClick={() => setOpen(true)}>
        <svg className="ca-combobox-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          ref={ref}
          className="ca-combobox-input"
          value={open ? query : selectedLabel || ''}
          placeholder={selectedLabel ? selectedLabel : placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          {...control}
        />
      </div>
      {open && (
        <div role="listbox" className="ca-combobox-list">
          {filtered.length === 0 ? (
            <div className="ca-combobox-empty">{emptyText}</div>
          ) : (
            filtered.map((o) => {
              const active = o.value === selected
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  className="ca-combobox-option"
                  data-active={active || undefined}
                  aria-selected={active}
                  onClick={() => choose(o.value)}
                >
                  <span>{o.label}</span>
                  {o.hint && <span className="ca-combobox-hint">{o.hint}</span>}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
})
