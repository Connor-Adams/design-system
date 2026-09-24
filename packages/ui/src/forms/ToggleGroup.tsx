import * as React from 'react'
import { markFieldShape } from './fieldProps'
import './ToggleGroup.css'

export interface ToggleItem {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
}

/**
 * Segmented control. `type="single"` selects one option (active segment lifts
 * to a card surface); `type="multiple"` toggles several. Controlled via `value`
 * + `onValueChange`, or uncontrolled via `defaultValue`. Value is a string for
 * single, string[] for multiple.
 *
 * Interactive states (hover, focus-visible ring, active lift) live in
 * `ToggleGroup.css`, keyed off `data-size` / `data-state`. The ref forwards to
 * the root `div[role=group]`.
 */
export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  items: ToggleItem[]
  type?: 'single' | 'multiple'
  value?: string | string[] | null
  defaultValue?: string | string[] | null
  onValueChange?: (value: string | string[] | null) => void
  size?: 'sm' | 'default'
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { items = [], type = 'single', value, defaultValue, onValueChange, size = 'default', className, ...props },
  ref,
): React.JSX.Element {
  const initial = defaultValue != null ? defaultValue : type === 'multiple' ? [] : null
  const [internal, setInternal] = React.useState<string | string[] | null>(initial)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const isActive = (v: string) =>
    type === 'multiple' ? ((current as string[] | null) || []).includes(v) : current === v
  const pick = (v: string) => {
    let next: string | string[] | null
    if (type === 'multiple') {
      const arr = (current as string[] | null) || []
      next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
    } else {
      next = current === v ? null : v
    }
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <div
      ref={ref}
      role="group"
      data-slot="toggle-group"
      data-size={size}
      className={className ? `ca-toggle-group ${className}` : 'ca-toggle-group'}
      {...props}
    >
      {items.map((it) => {
        const active = isActive(it.value)
        return (
          <button
            key={it.value}
            type="button"
            className="ca-toggle-group-item"
            data-state={active ? 'on' : 'off'}
            aria-pressed={active}
            onClick={() => pick(it.value)}
          >
            {it.icon && <span className="ca-toggle-group-item-icon">{it.icon}</span>}
            {it.label}
          </button>
        )
      })}
    </div>
  )
})

// Group-shaped: each segment is its own focusable button, so the `role="group"`
// root is not labelable. `Field` names it with `aria-labelledby` instead.
markFieldShape(ToggleGroup, 'group')
