import * as React from 'react'

/**
 * A module-level stack of dismissible layers (dialogs, menus, popovers,
 * drawers) so that a single Escape press is handled by exactly ONE layer — the
 * topmost one — instead of by every layer that happens to have its own
 * `document` keydown listener.
 *
 * Before this existed each overlay bound its own listener, so two open Dialogs
 * both fired `onClose` on one Escape, and a Dialog sitting behind an open
 * DropdownMenu closed alongside it. Every overlay in the package now registers
 * here instead; a future Popover/Drawer joins by calling `useDismissLayer`.
 *
 * Ordering is registration order: the last layer to open is the top of the
 * stack. Layers register when they open, so this matches visual stacking.
 *
 * Phase: the shared listener sits on `document` in the BUBBLE phase, on
 * purpose. A nested widget that is not (yet) a dismiss layer — a third-party
 * date picker, an emoji popover — can still claim Escape first by calling
 * `stopPropagation()` (React's synthetic `stopPropagation` stops the native
 * event at the React root, which is below `document`) or `preventDefault()`.
 * A capture-phase listener would take Escape away from that code and reopen
 * the very bug consumers work around today.
 */
export interface DismissLayerOptions {
  /** Register the layer while true. Pass the layer's `open` state. */
  active: boolean
  /** Called when Escape reaches this layer as the topmost one. */
  onDismiss?: () => void
  /** `false` keeps the layer in the stack but makes Escape a no-op for it. */
  closeOnEscape?: boolean
  /**
   * `true` (a modal layer) makes Escape stop here even when it does not
   * dismiss, so the key never leaks to an inert layer underneath.
   */
  modal?: boolean
}

/** The mutable record held in the stack. */
export interface DismissLayer {
  onDismiss?: () => void
  closeOnEscape?: boolean
  modal?: boolean
}

const stack: DismissLayer[] = []
let listening = false

function onKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'Escape' && e.key !== 'Esc') return
  // Someone closer to the event already claimed this Escape.
  if (e.defaultPrevented) return
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const layer = stack[i]!
    if (layer.closeOnEscape !== false) {
      e.preventDefault()
      e.stopPropagation()
      layer.onDismiss?.()
      return
    }
    // Non-dismissible but modal: swallow rather than fall through to a layer
    // the user cannot even see.
    if (layer.modal) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
  }
}

function startListening(): void {
  if (listening || typeof document === 'undefined') return
  document.addEventListener('keydown', onKeyDown)
  listening = true
}

function stopListening(): void {
  if (!listening || typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeyDown)
  listening = false
}

/**
 * Imperatively push a layer onto the dismiss stack. Returns the un-register
 * function. `layer` is read at Escape time, so mutating its fields keeps the
 * callbacks fresh without re-registering.
 */
export function pushDismissLayer(layer: DismissLayer): () => void {
  stack.push(layer)
  startListening()
  return () => {
    const i = stack.indexOf(layer)
    if (i !== -1) stack.splice(i, 1)
    if (stack.length === 0) stopListening()
  }
}

/** How many layers are currently registered. Exposed for tests/diagnostics. */
export function dismissStackSize(): number {
  return stack.length
}

/**
 * Register a component as a dismissible layer for as long as `active` is true.
 * This is the seam other overlays use — `Dialog` and `DropdownMenu` both call
 * it, and a new overlay only has to do the same to inherit correct Escape
 * ordering.
 */
export function useDismissLayer({ active, onDismiss, closeOnEscape = true, modal = false }: DismissLayerOptions): void {
  const layer = React.useRef<DismissLayer>({})

  // Keep the registered record pointing at this render's callbacks. Runs on
  // every render (no dep array) and before the registration effect below on
  // mount, so the stack never holds a stale closure.
  React.useEffect(() => {
    layer.current.onDismiss = onDismiss
    layer.current.closeOnEscape = closeOnEscape
    layer.current.modal = modal
  })

  React.useEffect(() => {
    if (!active) return
    return pushDismissLayer(layer.current)
  }, [active])
}
