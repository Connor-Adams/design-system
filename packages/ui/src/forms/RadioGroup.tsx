import * as React from 'react'
import { markFieldShape } from './fieldProps'
import './RadioGroup.css'

export type RadioOption = string | { value: string; label: string }

/**
 * Radio group — single-choice list with an oxblood selected dot. Pass
 * `options` (strings or {value,label}); control with `value` + `onValueChange`,
 * or uncontrolled via `defaultValue`. `orientation="horizontal"` for inline.
 *
 * Interactive states (focus-visible ring, selected dot, disabled) live in
 * `RadioGroup.css`, keyed off `data-orientation` / `data-state`. The ref
 * forwards to the root `div[role=radiogroup]`.
 */
export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { options = [], value, defaultValue, onValueChange, name, orientation = 'vertical', disabled, className, ...props },
  ref,
): React.JSX.Element {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const selected = isControlled ? value : internal
  const groupName = React.useMemo(() => name || `radio-${Math.random().toString(36).slice(2, 8)}`, [name])

  const pick = (v: string) => {
    if (disabled) return
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      data-slot="radio-group"
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      className={className ? `ca-radio-group ${className}` : 'ca-radio-group'}
      {...props}
    >
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        const on = selected === v
        return (
          <label key={v} className="ca-radio-group-item">
            <button
              type="button"
              role="radio"
              name={groupName}
              aria-checked={on}
              data-state={on ? 'checked' : 'unchecked'}
              disabled={disabled}
              onClick={() => pick(v)}
              className="ca-radio-group-control"
            >
              {on ? <span className="ca-radio-group-dot" /> : null}
            </button>
            {label}
          </label>
        )
      })}
    </div>
  )
})

// Group-shaped: every option is its own focusable radio, so the `role="radiogroup"`
// root is not labelable. `Field` names it with `aria-labelledby` instead of
// pointing `htmlFor` at a container that associates with nothing.
markFieldShape(RadioGroup, 'group')
