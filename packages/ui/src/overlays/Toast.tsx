import * as React from 'react'
import './Toast.css'

/**
 * Toast notification — a popover card with a semantic left accent. Presentational:
 * for timing, stacking, positioning and a portal, mount `Toaster` and fire
 * `toast()`. Use `Toast` directly only when you are driving visibility from your
 * own state. `onClose` renders a dismiss button.
 *
 * Visuals live in `Toast.css`, keyed off `data-variant`. The dismiss button
 * carries a `:focus-visible` ring for keyboard users.
 */

/** Semantic tone of the toast. Drives the accent colour and the ARIA urgency. */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  variant?: ToastVariant
  title?: React.ReactNode
  action?: React.ReactNode
  onClose?: () => void
  /**
   * ARIA role. Derived from `variant` when omitted: `'alert'` for `error`,
   * `'status'` otherwise. Override to force one either way.
   */
  role?: 'status' | 'alert'
  /**
   * Live-region politeness. Derived from `variant` when omitted: `'assertive'`
   * for `error`, `'polite'` otherwise. Override to force one either way.
   */
  'aria-live'?: 'polite' | 'assertive' | 'off'
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/**
 * Cashflow Toast. A --popover card with a semantic left accent bar, title,
 * optional body, and a close affordance.
 *
 * A failure is urgent and a confirmation is not, so the live-region strength is
 * derived from `variant` rather than fixed: `error` announces as
 * `alert`/`assertive` and interrupts, every other variant stays
 * `status`/`polite`. Pass `role` / `aria-live` to override.
 *
 * Presentational — `Toaster` drives show/hide, stacking and auto-dismiss.
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    variant = 'default',
    title,
    action,
    onClose,
    role,
    'aria-live': ariaLive,
    className,
    style,
    children,
    ...props
  },
  ref,
): React.JSX.Element {
  const urgent = variant === 'error'
  return (
    <div
      ref={ref}
      role={role ?? (urgent ? 'alert' : 'status')}
      aria-live={ariaLive ?? (urgent ? 'assertive' : 'polite')}
      data-slot="toast"
      data-variant={variant}
      className={className ? `ca-toast ${className}` : 'ca-toast'}
      style={style}
      {...props}
    >
      <div className="ca-toast-content">
        {title && <p className="ca-toast-title">{title}</p>}
        {children && <p className="ca-toast-body">{children}</p>}
        {action && <div className="ca-toast-action">{action}</div>}
      </div>
      {onClose && (
        <button type="button" aria-label="Dismiss" className="ca-toast-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  )
})
