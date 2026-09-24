import * as React from 'react'
import { createPortal } from 'react-dom'
import { useBodyScrollLock } from './bodyScrollLock'
import { useDismissLayer } from './dismissStack'
import './Dialog.css'

/**
 * Elements that can take focus. Deliberately attribute-based rather than
 * geometry-based (`offsetParent` / `getClientRects`) — jsdom reports every
 * element as zero-sized, so a geometry filter would make the trap find nothing
 * under test while behaving differently in a browser.
 */
const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex^="-"])',
].join(',')

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true' && el.tabIndex !== -1,
  )
}

export interface DialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean
  /** Fires on Escape (when topmost), scrim click, and nothing else. */
  onClose?: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
  /** `false` keeps the dialog open on Escape (it still swallows the key). */
  closeOnEscape?: boolean
  /** `false` keeps the dialog open when the scrim is clicked. */
  closeOnOverlayClick?: boolean
  /** `false` renders in place in the React tree instead of a portal. */
  portal?: boolean
  /** Portal target. Defaults to `document.body`. */
  container?: Element | DocumentFragment | null
  /** `false` leaves `document.body` scrollable while the dialog is open. */
  lockScroll?: boolean
  /** Element to focus on open. Defaults to the first focusable child. */
  initialFocus?: React.RefObject<HTMLElement | null>
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/**
 * Cashflow Dialog. A centered --popover card over a dimmed, blurred scrim.
 * Controlled with `open` + `onClose`; closes on scrim click or Escape. Pass
 * `title` / `description` for the header and `footer` for the action row.
 *
 * Layout and visuals live in `Dialog.css`, keyed off `data-size`. Behavior
 * stays in JS, because it is behavior and not styling:
 *
 * - **Escape** goes through the shared dismiss stack (`./dismissStack`), so the
 *   topmost layer handles it and exactly one layer closes. A nested menu or
 *   popover that registers itself wins over the dialog beneath it.
 * - **Focus** moves into the dialog on open (`initialFocus`, else the first
 *   focusable child, else the card itself), Tab is trapped inside, and focus
 *   returns to whatever was focused before on close.
 * - **Body scroll** is locked while open (ref-counted, so nested dialogs
 *   behave), opt out with `lockScroll={false}`.
 * - **Portals** to `document.body` by default so the fixed scrim escapes
 *   `overflow`/`transform` ancestors; `portal={false}` or `container` override.
 *
 * `role="dialog" aria-modal="true"` sit on the content card (not the scrim),
 * with `aria-labelledby`/`aria-describedby` wired to the rendered `title` and
 * `description`. Pass `role="alertdialog"` for a destructive confirmation.
 */
export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    description,
    footer,
    size = 'default',
    closeOnEscape = true,
    closeOnOverlayClick = true,
    portal = true,
    container,
    lockScroll = true,
    initialFocus,
    role = 'dialog',
    className,
    style,
    children,
    ...props
  },
  forwardedRef,
): React.JSX.Element | null {
  const contentRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(forwardedRef, () => contentRef.current as HTMLDivElement)

  const uid = React.useId()
  const titleId = `${uid}dialog-title`
  const descriptionId = `${uid}dialog-description`

  // Read at effect time so a freshly-created ref object does not re-trigger
  // the focus effect (which would steal focus back on every render).
  const initialFocusRef = React.useRef(initialFocus)
  React.useEffect(() => {
    initialFocusRef.current = initialFocus
  })

  // A modal dialog swallows Escape even when `closeOnEscape` is false: the
  // layers underneath are inert, so the key must not reach them.
  useDismissLayer({ active: open, onDismiss: onClose, closeOnEscape, modal: true })
  useBodyScrollLock(open && lockScroll)

  // Focus in on open, focus back out on close.
  React.useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const node = contentRef.current
    const explicit = initialFocusRef.current?.current ?? null
    const target = explicit ?? (node ? focusableWithin(node)[0] ?? node : null)
    target?.focus()
    return () => {
      if (previous && previous.isConnected && typeof previous.focus === 'function') previous.focus()
    }
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Tab') return
    const node = contentRef.current
    if (!node) return
    const items = focusableWithin(node)
    if (items.length === 0) {
      e.preventDefault()
      node.focus()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement
    const outside = !active || !node.contains(active)
    if (e.shiftKey ? active === first || outside : active === last || outside) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    }
  }

  if (!open) return null

  const tree = (
    <div
      data-slot="dialog-scrim"
      className="ca-dialog-scrim"
      onKeyDown={onKeyDown}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        // Only a click that started and ended on the scrim itself — never a
        // drag that began inside the card.
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={contentRef}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        data-slot="dialog-content"
        data-size={size}
        className={className ? `ca-dialog ${className}` : 'ca-dialog'}
        style={style}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        {...props}
      >
        {(title || description) && (
          <div className="ca-dialog-header">
            {title && (
              <h2 id={titleId} className="ca-dialog-title">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="ca-dialog-description">
                {description}
              </p>
            )}
          </div>
        )}
        {children && <div className="ca-dialog-body">{children}</div>}
        {footer && <div className="ca-dialog-footer">{footer}</div>}
      </div>
    </div>
  )

  const target = container ?? (typeof document !== 'undefined' ? document.body : null)
  return portal && target ? createPortal(tree, target) : tree
})
