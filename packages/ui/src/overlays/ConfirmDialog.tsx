import * as React from 'react'
import { Button } from '../core/Button'
import { Spinner } from '../core/Spinner'
import { Dialog } from './Dialog'
import type { DialogProps } from './Dialog'
import './ConfirmDialog.css'

export type ConfirmTone = 'default' | 'destructive'

function isThenable(value: unknown): value is Promise<unknown> {
  return typeof (value as { then?: unknown } | null | undefined)?.then === 'function'
}

export interface ConfirmDialogProps {
  open: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  /** Confirm button text. Default `Confirm`. */
  confirmLabel?: string
  /** Cancel button text. Default `Cancel`. */
  cancelLabel?: string
  /**
   * `destructive` tints the confirm button and — deliberately — focuses Cancel
   * on open, so a reflexive Enter cannot delete anything.
   */
  tone?: ConfirmTone
  /**
   * The action. May return a promise: the confirm button goes into a pending
   * state, both buttons disable, Escape and scrim clicks stop closing, and the
   * dialog stays open until it settles. A rejection is surfaced (see
   * `onError`), never swallowed, and the dialog stays open so the user can retry.
   */
  onConfirm?: () => void | Promise<unknown>
  onCancel?: () => void
  /** Called after a successful confirm, after cancel, and on Escape/scrim. */
  onClose?: () => void
  /**
   * Handles a rejected/throwing `onConfirm`. Without it the error is re-thrown
   * during render so the nearest error boundary sees it rather than it
   * vanishing into a dead promise.
   */
  onError?: (error: unknown) => void
  /** Force the pending state (for a confirm driven by external state). */
  pending?: boolean
  size?: DialogProps['size']
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  portal?: boolean
  container?: DialogProps['container']
  lockScroll?: boolean
  className?: string
  style?: React.CSSProperties
  /** Extra detail rendered in the dialog body above the actions. */
  children?: React.ReactNode
}

/**
 * Cashflow ConfirmDialog. The `window.confirm` replacement: an `alertdialog`
 * with a title, a short consequence line, and exactly two buttons. Built on
 * `Dialog`, so it inherits the focus trap, focus restore, dismiss stack,
 * scroll lock and portal.
 *
 * Interactive states live in `Button.css` / `ConfirmDialog.css`; the only state
 * held in JS is whether an async `onConfirm` is still in flight — behavior, not
 * styling.
 */
export const ConfirmDialog = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(function ConfirmDialog(
  {
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'default',
    onConfirm,
    onCancel,
    onClose,
    onError,
    pending,
    size = 'sm',
    closeOnEscape = true,
    closeOnOverlayClick = true,
    portal,
    container,
    lockScroll,
    className,
    style,
    children,
    ...props
  },
  ref,
): React.JSX.Element | null {
  const [running, setRunning] = React.useState(false)
  const [thrown, setThrown] = React.useState<unknown>(null)
  const confirmRef = React.useRef<HTMLButtonElement>(null)
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const busy = pending ?? running

  // Nothing is left half-pending if the dialog is closed from outside.
  React.useEffect(() => {
    if (!open) setRunning(false)
  }, [open])

  // Re-thrown during render so the error reaches an error boundary instead of
  // dying in a promise no one is holding.
  if (thrown !== null) throw thrown

  const surface = (error: unknown): void => {
    if (onError) onError(error)
    else setThrown(error ?? new Error('ConfirmDialog: onConfirm rejected'))
  }

  const handleConfirm = (): void => {
    if (busy) return
    let result: void | Promise<unknown>
    try {
      result = onConfirm?.()
    } catch (error) {
      surface(error)
      return
    }
    if (!isThenable(result)) {
      onClose?.()
      return
    }
    setRunning(true)
    result.then(
      () => {
        setRunning(false)
        onClose?.()
      },
      (error: unknown) => {
        setRunning(false)
        surface(error)
      },
    )
  }

  const handleCancel = (): void => {
    if (busy) return
    onCancel?.()
    onClose?.()
  }

  return (
    <Dialog
      ref={ref}
      open={open}
      onClose={onClose}
      size={size}
      role="alertdialog"
      title={title}
      description={description}
      // A confirm in flight must not be dismissible — the action is already
      // happening and the outcome is still unknown.
      closeOnEscape={closeOnEscape && !busy}
      closeOnOverlayClick={closeOnOverlayClick && !busy}
      portal={portal}
      container={container}
      lockScroll={lockScroll}
      // Destructive confirms open with Cancel focused.
      initialFocus={tone === 'destructive' ? cancelRef : confirmRef}
      className={className ? `ca-confirm-dialog ${className}` : 'ca-confirm-dialog'}
      style={style}
      data-slot="confirm-dialog"
      data-tone={tone}
      footer={
        <>
          <Button
            ref={cancelRef}
            variant={tone === 'destructive' ? 'secondary' : 'ghost'}
            className="ca-confirm-dialog-action"
            disabled={busy}
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            className="ca-confirm-dialog-action"
            data-pending={busy ? 'true' : 'false'}
            aria-busy={busy || undefined}
            disabled={busy}
            onClick={handleConfirm}
          >
            {busy && <Spinner size="sm" tone="current" aria-hidden className="ca-confirm-dialog-spinner" />}
            {confirmLabel}
          </Button>
        </>
      }
      {...props}
    >
      {children}
    </Dialog>
  )
})

export interface ConfirmOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
  size?: DialogProps['size']
  children?: React.ReactNode
}

export interface UseConfirmResult {
  /** Resolves `true` on confirm, `false` on cancel / Escape / scrim. */
  confirm: (options?: ConfirmOptions) => Promise<boolean>
  /** Render this once, anywhere in the component. No provider required. */
  dialog: React.ReactNode
}

/**
 * The imperative shape that replaces `window.confirm` one-for-one:
 *
 * ```tsx
 * const { confirm, dialog } = useConfirm({ tone: 'destructive' })
 * // ...
 * if (await confirm({ title: 'Delete sound?' })) remove(id)
 * // ...
 * return <>{button}{dialog}</>
 * ```
 *
 * State is local to the calling component, so there is no provider to install
 * and nothing to wire at the app root — the cost is rendering `dialog` once.
 */
export function useConfirm(defaults?: ConfirmOptions): UseConfirmResult {
  const [request, setRequest] = React.useState<ConfirmOptions | null>(null)
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null)
  const defaultsRef = React.useRef(defaults)
  React.useEffect(() => {
    defaultsRef.current = defaults
  })

  const settle = React.useCallback((value: boolean) => {
    const resolve = resolveRef.current
    resolveRef.current = null
    setRequest(null)
    resolve?.(value)
  }, [])

  const confirm = React.useCallback(
    (options?: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        // A prompt that is superseded before it is answered resolves false.
        resolveRef.current?.(false)
        resolveRef.current = resolve
        setRequest({ ...defaultsRef.current, ...options })
      }),
    [],
  )

  const dialog = (
    <ConfirmDialog
      {...request}
      open={request !== null}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
      onClose={() => settle(false)}
    />
  )

  return { confirm, dialog }
}
