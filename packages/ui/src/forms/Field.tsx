import * as React from 'react'
import { Label } from './Label'
import './Field.css'

/**
 * Props Field injects into its control. Also the argument handed to a
 * render-prop child.
 */
export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: 'true'
  'aria-required'?: 'true'
}

/** An element to wire up, or a callback that wires itself. */
export type FieldChildren = React.ReactNode | ((control: FieldControlProps) => React.ReactNode)

/**
 * Label + control + hint/error, with the accessibility wired for you: an id is
 * generated when none is given, the composed `Label` gets `htmlFor`, the hint
 * or error is linked through `aria-describedby`, an error sets `aria-invalid`,
 * and `required` sets `aria-required` plus a visual marker.
 *
 * **Error beats hint.** When `error` is set the hint is not rendered — one
 * message line, so `aria-describedby` never reads stale help text over an
 * error. Drop `error` to get the hint back.
 *
 * Works with any control. An element child is cloned with the wiring props
 * (every control in this package extends an `HTMLAttributes` interface and
 * spreads `...props` onto a real node, so `id`/`aria-*` land where they
 * should); a child that cannot take DOM props — or a control nested deeper —
 * should use the render-prop form and place them itself.
 *
 * Caveat: controls whose `...props` land on a wrapper `<div>` rather than on the
 * focusable element — `Combobox` and `Slider` — take the id on that wrapper, so
 * `htmlFor` does not create a native label association. The label still reads as
 * adjacent text and the description is still announced; use the render-prop form
 * and place `id` on the inner control if you need the hard association.
 *
 * All visuals live in `Field.css`; the ref forwards to the wrapper `<div>`.
 */
export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Label content. Omit for a field that is labelled some other way. */
  label?: React.ReactNode
  /** Help text below the control. Hidden while `error` is set. */
  hint?: React.ReactNode
  /** Error text below the control. Takes precedence over `hint`. */
  error?: React.ReactNode
  /** Marks the control `aria-required` and prints the label's `*`. */
  required?: boolean
  /** Control id. Generated when omitted (a child's own `id` wins over both). */
  id?: string
  children: FieldChildren
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, label, hint, error, required, className, children, ...props },
  ref,
): React.JSX.Element {
  const autoId = React.useId()

  const renderProp = typeof children === 'function' ? children : null
  const element = React.isValidElement<Record<string, unknown>>(children) ? children : null
  const childProps: Record<string, unknown> = element ? element.props : {}
  const childId = typeof childProps.id === 'string' ? childProps.id : undefined
  const childDescribedBy =
    typeof childProps['aria-describedby'] === 'string' ? childProps['aria-describedby'] : undefined

  // An explicit `id` wins over the generated one; a child that already carries
  // its own id keeps it, so htmlFor still points at the real control.
  const controlId = id ?? childId ?? `ca-field-${autoId}`
  const hasError = error != null && error !== false
  const hasHint = !hasError && hint != null && hint !== false
  const messageId = hasError ? `${controlId}-error` : `${controlId}-hint`

  const describedBy =
    [hasError || hasHint ? messageId : undefined, childDescribedBy].filter(Boolean).join(' ') ||
    undefined

  const wiring: FieldControlProps = {
    id: controlId,
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    ...(hasError ? { 'aria-invalid': 'true' as const } : {}),
    ...(required ? { 'aria-required': 'true' as const } : {}),
  }

  // The child's own props win (it may deliberately set aria-invalid or an id);
  // aria-describedby is the exception — it is merged, never replaced.
  const control: React.ReactNode = renderProp
    ? renderProp(wiring)
    : element
      ? React.cloneElement(element, {
          ...wiring,
          ...childProps,
          ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        })
      : (children as React.ReactNode)

  return (
    <div
      ref={ref}
      data-slot="field"
      data-invalid={hasError ? 'true' : undefined}
      className={className ? `ca-field ${className}` : 'ca-field'}
      {...props}
    >
      {label != null && (
        <Label className="ca-field-label" htmlFor={controlId} data-slot="field-label">
          {label}
          {required && (
            <span className="ca-field-required" data-slot="field-required" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {control}
      {hasError ? (
        <p
          id={messageId}
          role="alert"
          data-slot="field-error"
          className="ca-field-message ca-field-message--error"
        >
          {error}
        </p>
      ) : hasHint ? (
        <p id={messageId} data-slot="field-hint" className="ca-field-message">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
