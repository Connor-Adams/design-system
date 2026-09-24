import * as React from 'react'

/**
 * Ref-counted `document.body` scroll lock for modal layers. Counted rather
 * than a boolean so a nested dialog closing does not unlock the page while an
 * outer dialog is still open.
 */
let locks = 0
let previousOverflow = ''

function lock(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (locks === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  locks += 1
  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0) document.body.style.overflow = previousOverflow
  }
}

/** Lock body scroll while `active` is true. */
export function useBodyScrollLock(active: boolean): void {
  React.useEffect(() => {
    if (!active) return
    return lock()
  }, [active])
}
