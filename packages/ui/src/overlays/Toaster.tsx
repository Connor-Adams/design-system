import * as React from 'react'
import { createPortal } from 'react-dom'
import { Toast, type ToastVariant } from './Toast'
import './Toaster.css'

/**
 * Toast host. `Toast` is presentational; `Toaster` is the thing that actually
 * owns timing, stacking, positioning and the portal.
 *
 * ## Why there is no provider
 *
 * The obvious shape for this is `<ToastProvider>` + a context-backed
 * `useToast()`. We deliberately do NOT do that, because the failure mode it
 * invites is silent and expensive: when `useToast()` carries its own state,
 * every caller gets a *different* queue, and a toast fired from a component
 * whose queue nothing renders is dropped with no error. (That exact bug shipped
 * in a consuming dashboard — a hook with `useState` + a `ToastContainer` it
 * returned, one screen rendering the container and another screen firing into
 * its own instance. Every toast from the second screen vanished.)
 *
 * So the queue is a single module-level store. `toast()` is importable and
 * callable from anywhere — event handlers, API/fetch layers, non-React code —
 * and `useToast()` is a thin `useSyncExternalStore` read of the same queue.
 * There is exactly one queue per bundle, so there is nothing to mis-wire.
 *
 * The cost of dropping the provider is that two mounted `Toaster`s would each
 * render the whole queue, so we guard it: hosts register in mount order and
 * only the first one renders. That degrades to "one stack", never "duplicates".
 *
 * ## Accessibility
 *
 * The viewport is a `role="region"` landmark and is **not** a live region — if
 * it were, adding one toast would re-announce the whole stack. Each `Toast` is
 * its own live region instead (`status`/`polite`, escalating to
 * `alert`/`assertive` for `variant="error"`), so only the new toast is spoken.
 *
 * ## Behavior vs. styling
 *
 * Enter/exit animation, positioning and stacking direction live in
 * `Toaster.css`, keyed off `data-position` / `data-state`, and are disabled
 * under `prefers-reduced-motion`. The JS here is behavior only: timers, and the
 * pointer/focus handlers that pause them. Pausing on hover and on focus-within
 * is not decoration — a toast must not disappear mid-read, or while its action
 * button is the focused element.
 */

/** Corner or edge the stack is pinned to. */
export type ToasterPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/** What a caller passes to `toast()`. */
export interface ToastOptions {
  /** Stable id. Reusing one updates that toast in place instead of stacking a new one. */
  id?: string
  variant?: ToastVariant
  /** The headline. A bare string passed to `toast()` becomes this. */
  title?: React.ReactNode
  /** Secondary line under the title. */
  description?: React.ReactNode
  /** An action node (typically a Button) rendered under the body. */
  action?: React.ReactNode
  /** ms before auto-dismiss. `Infinity` or `0` persists until dismissed. Defaults to the host's `duration`. */
  duration?: number
  /** Set `false` to drop the close button (pair it with a persistent duration). */
  dismissible?: boolean
  /** Fired once the toast has actually left the queue (after the exit animation). */
  onDismiss?: (id: string) => void
}

/** A queued toast: the caller's options plus the store's bookkeeping. */
export interface ToastRecord extends ToastOptions {
  id: string
  createdAt: number
  /** Bumped on every upsert; restarts the auto-dismiss timer. */
  updatedAt: number
  /** `exiting` toasts are still mounted so CSS can animate them out. */
  state: 'open' | 'exiting'
}

/** Time the exit animation is given before the record leaves the queue. Keep in sync with Toaster.css. */
const EXIT_MS = 180
const DEFAULT_DURATION = 5000
const DEFAULT_MAX = 3

// ---------------------------------------------------------------------------
// The queue — one per bundle, deliberately outside React.
// ---------------------------------------------------------------------------

const EMPTY: ToastRecord[] = []
let queue: ToastRecord[] = EMPTY
let seq = 0
const listeners = new Set<() => void>()
const exitTimers = new Map<string, ReturnType<typeof setTimeout>>()

function emit(): void {
  for (const listener of [...listeners]) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Referentially stable between mutations, as `useSyncExternalStore` requires. */
function getSnapshot(): ToastRecord[] {
  return queue
}

function getServerSnapshot(): ToastRecord[] {
  return EMPTY
}

function clearExitTimer(id: string): void {
  const handle = exitTimers.get(id)
  if (handle !== undefined) {
    clearTimeout(handle)
    exitTimers.delete(id)
  }
}

/** Enqueue a toast, or update the one already holding this `id`. Returns the id. */
function add(options: ToastOptions | string): string {
  const opts: ToastOptions = typeof options === 'string' ? { title: options } : options
  const now = Date.now()
  const id = opts.id ?? `ca-toast-${++seq}`
  if (queue.some((t) => t.id === id)) {
    clearExitTimer(id)
    queue = queue.map((t) =>
      t.id === id ? { ...t, ...opts, id, state: 'open' as const, updatedAt: now } : t,
    )
  } else {
    queue = [...queue, { ...opts, id, createdAt: now, updatedAt: now, state: 'open' }]
  }
  emit()
  return id
}

/** Drop a record immediately, no animation. */
function remove(id: string): void {
  clearExitTimer(id)
  const record = queue.find((t) => t.id === id)
  if (!record) return
  queue = queue.filter((t) => t.id !== id)
  emit()
  record.onDismiss?.(id)
}

/** Start the exit animation; the record leaves the queue `EXIT_MS` later. No id dismisses every toast. */
function dismiss(id?: string): void {
  if (id === undefined) {
    for (const record of [...queue]) dismiss(record.id)
    return
  }
  const record = queue.find((t) => t.id === id)
  if (!record || record.state === 'exiting') return
  queue = queue.map((t) => (t.id === id ? { ...t, state: 'exiting' as const } : t))
  emit()
  exitTimers.set(
    id,
    setTimeout(() => remove(id), EXIT_MS),
  )
}

/** Wipe the queue with no animation and no `onDismiss` — teardown, route changes, tests. */
function clear(): void {
  for (const id of [...exitTimers.keys()]) clearExitTimer(id)
  if (queue.length === 0) return
  queue = EMPTY
  emit()
}

/**
 * The toast queue itself. Exposed for teardown (`clear()`) and for wiring the
 * queue into something other than `Toaster`; day-to-day you want `toast()`.
 */
export const toastStore = {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  add,
  remove,
  dismiss,
  clear,
} as const

/** Extra options a variant helper accepts — `variant` and `title` are already decided. */
export type ToastHelperOptions = Omit<ToastOptions, 'variant' | 'title'>

/** The callable `toast()` plus its variant helpers and dismissers. */
export interface ToastFn {
  (options: ToastOptions | string): string
  success: (message: React.ReactNode, options?: ToastHelperOptions) => string
  error: (message: React.ReactNode, options?: ToastHelperOptions) => string
  warning: (message: React.ReactNode, options?: ToastHelperOptions) => string
  info: (message: React.ReactNode, options?: ToastHelperOptions) => string
  /** Animate one toast out, or every toast when called with no id. */
  dismiss: (id?: string) => void
  /** Remove everything immediately, without the exit animation. */
  clear: () => void
}

function helper(variant: ToastVariant) {
  return (message: React.ReactNode, options?: ToastHelperOptions): string =>
    add({ ...options, variant, title: message })
}

/**
 * Fire a toast from anywhere — no hook, no provider, no component required.
 *
 * ```ts
 * toast.success('Statement imported', { description: '312 transactions added.' })
 * const id = toast({ title: 'Uploading…', duration: Infinity })
 * toast({ id, title: 'Uploaded', variant: 'success', duration: 4000 })
 * toast.dismiss()   // all of them
 * ```
 */
export const toast: ToastFn = Object.assign(
  (options: ToastOptions | string): string => add(options),
  {
    success: helper('success'),
    error: helper('error'),
    warning: helper('warning'),
    info: helper('info'),
    dismiss,
    clear,
  },
)

/** What `useToast()` hands back. */
export interface UseToastReturn {
  /** The live queue, oldest first. */
  toasts: readonly ToastRecord[]
  /** The same module-level `toast()` — re-exported so components need only one import. */
  toast: ToastFn
  dismiss: (id?: string) => void
  clear: () => void
}

/**
 * Read the toast queue from inside React. This holds no state of its own — it
 * subscribes to the one module store — so calling it in ten components gives
 * you ten views of the same queue, not ten queues.
 */
export function useToast(): UseToastReturn {
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { toasts, toast, dismiss, clear }
}

// ---------------------------------------------------------------------------
// Host registry — provider-free, but still only one visible stack.
// ---------------------------------------------------------------------------

const hosts: object[] = []
const hostListeners = new Set<() => void>()

function claimHost(token: object): () => void {
  hosts.push(token)
  for (const listener of [...hostListeners]) listener()
  return () => {
    const index = hosts.indexOf(token)
    if (index >= 0) hosts.splice(index, 1)
    for (const listener of [...hostListeners]) listener()
  }
}

function isPrimaryHost(token: object): boolean {
  return hosts.length > 0 && hosts[0] === token
}

// ---------------------------------------------------------------------------
// Toaster
// ---------------------------------------------------------------------------

export interface ToasterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Corner or edge to pin the stack to. Default `'bottom-right'`. */
  position?: ToasterPosition
  /** Most toasts shown at once; the rest collapse into a `+N more` count. `0` shows all. Default `3`. */
  max?: number
  /** Space between stacked toasts, in px. Default `10`. */
  gap?: number
  /** Default auto-dismiss in ms for toasts that don't set their own. Default `5000`. */
  duration?: number
  /** Portal target. Defaults to `document.body`. */
  container?: HTMLElement | null
}

/**
 * Cashflow Toaster. Mount it once, near the root. It portals a fixed stack of
 * `Toast`s out of the layout, auto-dismisses them (pausing while hovered or
 * focused), animates them in and out, and collapses overflow past `max`.
 * Feed it with `toast()` from anywhere or `useToast()` from a component.
 */
export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(function Toaster(
  {
    position = 'bottom-right',
    max = DEFAULT_MAX,
    gap = 10,
    duration = DEFAULT_DURATION,
    container,
    className,
    style,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ...props
  },
  ref,
): React.JSX.Element | null {
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Timers pause while the stack is hovered OR holds focus. These are tracked
  // separately on purpose: with one shared flag, moving the pointer away while
  // an action button is still focused would resume the timer and yank the toast
  // out from under the keyboard user. This is behavior, not styling — nothing
  // here drives a visual state that CSS could own.
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const paused = hovered || focused

  const token = React.useMemo(() => ({}), [])
  const [primary, setPrimary] = React.useState(false)
  React.useEffect(() => {
    const update = () => setPrimary(isPrimaryHost(token))
    hostListeners.add(update)
    const release = claimHost(token)
    return () => {
      release()
      hostListeners.delete(update)
    }
  }, [token])

  const target = container ?? (typeof document === 'undefined' ? null : document.body)
  if (!primary || !target) return null

  const visible = max > 0 ? toasts.slice(-max) : toasts
  const collapsed = toasts.length - visible.length

  return createPortal(
    <div
      ref={ref}
      data-slot="toaster"
      data-position={position}
      data-paused={paused ? 'true' : 'false'}
      role="region"
      aria-label="Notifications"
      className={className ? `ca-toaster ${className}` : 'ca-toaster'}
      style={{ ['--ca-toaster-gap' as string]: `${gap}px`, ...style }}
      onPointerEnter={(e: React.PointerEvent<HTMLDivElement>) => {
        setHovered(true)
        onPointerEnter?.(e)
      }}
      onPointerLeave={(e: React.PointerEvent<HTMLDivElement>) => {
        setHovered(false)
        onPointerLeave?.(e)
      }}
      onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
        setFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
        // Focus moving between two elements inside the stack is not "focus left".
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
        onBlur?.(e)
      }}
      {...props}
    >
      {collapsed > 0 && (
        <div data-slot="toaster-overflow" className="ca-toaster-overflow">
          {`+${collapsed} more`}
        </div>
      )}
      {visible.map((record) => (
        <ToasterItem key={record.id} record={record} paused={paused} fallbackDuration={duration} />
      ))}
    </div>,
    target,
  )
})

interface ToasterItemProps {
  record: ToastRecord
  paused: boolean
  fallbackDuration: number
}

/**
 * One row of the stack: the animation wrapper plus its auto-dismiss timer.
 * The timer banks its remaining time on every pause so a hovered toast resumes
 * where it left off instead of restarting its full duration.
 */
function ToasterItem({ record, paused, fallbackDuration }: ToasterItemProps): React.JSX.Element {
  const duration = record.duration ?? fallbackDuration
  const timed = Number.isFinite(duration) && duration > 0
  const remaining = React.useRef(duration)
  const startedAt = React.useRef(0)

  // Re-issuing the same id gives the toast its full duration again. Declared
  // before the timer effect so it wins over that effect's cleanup on the same commit.
  React.useEffect(() => {
    remaining.current = duration
  }, [record.updatedAt, duration])

  React.useEffect(() => {
    if (!timed || paused || record.state === 'exiting') return
    startedAt.current = Date.now()
    const handle = setTimeout(() => dismiss(record.id), remaining.current)
    return () => {
      clearTimeout(handle)
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current))
    }
  }, [timed, paused, record.state, record.id, record.updatedAt])

  return (
    <div data-slot="toaster-item" data-state={record.state} className="ca-toaster-item">
      <Toast
        variant={record.variant}
        title={record.title}
        action={record.action}
        onClose={record.dismissible === false ? undefined : () => dismiss(record.id)}
      >
        {record.description}
      </Toast>
    </div>
  )
}
