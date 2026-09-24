import * as React from 'react'
import './Input.css'

/**
 * Single-line text field. 36px tall, `--input` border, oxblood focus ring.
 * Set `invalid` (or `aria-invalid`) for the destructive error treatment.
 *
 * Adornments: pass `leadingIcon` / `trailingIcon` as nodes (this package has no
 * icon dependency), and `clearable` for a search-style clear button. The space
 * an adornment occupies is reserved in `Input.css` off `data-leading` /
 * `data-trailing` — never by measuring the icon in JS. A field with no adornment
 * renders exactly as before: a single bare `<input>`, no wrapper element.
 *
 * Interactive states (focus-visible ring, disabled, invalid, clear-button
 * hover) live in `Input.css`, not JS — keyboard focus is visible and the ref
 * forwards to the native `<input>` (never to the wrapper) for react-hook-form /
 * `focus()`.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  /** Node rendered inside the field's left edge. Decorative (`aria-hidden`). */
  leadingIcon?: React.ReactNode
  /** Node rendered inside the field's right edge. Decorative (`aria-hidden`). */
  trailingIcon?: React.ReactNode
  /**
   * Render a clear button once the field has a value. It is a real `<button>`
   * with an accessible name, and is disabled (so out of the tab order) while
   * there is nothing to clear.
   */
  clearable?: boolean
  /** Called after the clear button is pressed. Controlled callers clear here. */
  onClear?: () => void
  /** Accessible name for the clear button. */
  clearLabel?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leadingIcon, trailingIcon, clearable = false, onClear, clearLabel = 'Clear', ...props },
  ref,
): React.JSX.Element {
  const { value, defaultValue, onChange, disabled, readOnly } = props

  // The clear button needs the node to reset an uncontrolled field and to hand
  // focus back, so keep an internal ref and mirror it onto the forwarded one.
  // The consumer's ref still lands on the <input>, not on the wrapper.
  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const attachRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    },
    [ref],
  )

  // Whether the field holds a value is *data*, not an interactive state: the
  // clear affordance cannot exist with nothing to clear. Controlled callers are
  // read off `value`; uncontrolled ones are tracked here from `defaultValue`.
  const isControlled = value !== undefined
  const [uncontrolledFilled, setUncontrolledFilled] = React.useState<boolean>(
    () => String(defaultValue ?? '') !== '',
  )
  const filled = isControlled ? String(value ?? '') !== '' : uncontrolledFilled

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUncontrolledFilled(event.target.value !== '')
    onChange?.(event)
  }

  const clear = (): void => {
    const node = innerRef.current
    if (node && !isControlled) {
      node.value = ''
      setUncontrolledFilled(false)
    }
    node?.focus()
    onClear?.()
  }

  const canClear = clearable && filled && !disabled && !readOnly
  const trailingCount = (trailingIcon != null ? 1 : 0) + (clearable ? 1 : 0)
  const adorned = leadingIcon != null || trailingCount > 0

  const control = (
    <input
      ref={attachRef}
      data-slot="input"
      data-leading={leadingIcon != null || undefined}
      data-trailing={trailingCount > 0 ? String(trailingCount) : undefined}
      aria-invalid={invalid || props['aria-invalid'] || undefined}
      className={className ? `ca-input ${className}` : 'ca-input'}
      {...props}
      onChange={clearable && !isControlled ? handleChange : onChange}
    />
  )

  if (!adorned) return control

  return (
    <span data-slot="input-wrap" className="ca-input-wrap">
      {leadingIcon != null && (
        <span
          data-slot="input-leading"
          className="ca-input-adornment ca-input-adornment--leading"
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      )}
      {control}
      {trailingCount > 0 && (
        <span data-slot="input-trailing" className="ca-input-trailing">
          {clearable && (
            <button
              type="button"
              data-slot="input-clear"
              data-visible={canClear ? 'true' : 'false'}
              className="ca-input-clear"
              aria-label={clearLabel}
              aria-hidden={!canClear || undefined}
              tabIndex={canClear ? undefined : -1}
              disabled={!canClear}
              onClick={clear}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {trailingIcon != null && (
            <span data-slot="input-trailing-icon" className="ca-input-adornment" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </span>
      )}
    </span>
  )
})
