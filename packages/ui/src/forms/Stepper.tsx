import * as React from 'react'
import './Stepper.css'

/**
 * Compact numeric stepper with −/+ buttons and a mono readout. Controlled via
 * `value` + `onValueChange`, or uncontrolled via `defaultValue`. Clamps to
 * `min`/`max`; `format` renders units (e.g. days, ×).
 *
 * Interactive states (button hover, focus-visible ring, disabled) live in
 * `Stepper.css`, keyed off `data-size`. The ref forwards to the root container.
 *
 * Stepper is inherently multi-element — the −/+ buttons take focus, the readout
 * does not, and no single child is "the" control — so it exposes a labelled
 * *group* rather than pretending to be one labelable element: the root carries
 * `role="group"`, and `id` / `aria-*` stay on it. Name it with
 * `aria-label` / `aria-labelledby` (pointing at your label's id), not with a
 * `<label htmlFor>`, which cannot associate with a group.
 */
export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'default'
  format?: (value: number) => React.ReactNode
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { value, defaultValue = 0, onValueChange, min = -Infinity, max = Infinity, step = 1, disabled, size = 'default', format, className, ...props },
  ref,
): React.JSX.Element {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const v = isControlled ? value : internal

  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const set = (n: number) => {
    const next = clamp(n)
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <div
      ref={ref}
      role="group"
      data-slot="stepper"
      data-size={size}
      data-disabled={disabled || undefined}
      className={className ? `ca-stepper ${className}` : 'ca-stepper'}
      {...props}
    >
      <button
        type="button"
        className="ca-stepper-btn"
        aria-label="Decrease"
        onClick={() => set(v - step)}
        disabled={disabled || v <= min}
      >
        −
      </button>
      <span className="ca-stepper-value">{format ? format(v) : v}</span>
      <button
        type="button"
        className="ca-stepper-btn"
        aria-label="Increase"
        onClick={() => set(v + step)}
        disabled={disabled || v >= max}
      >
        +
      </button>
    </div>
  )
})
