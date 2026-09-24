import { createRef } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Toaster, toast, toastStore, useToast } from './Toaster'

const viewport = () => document.querySelector('[data-slot="toaster"]')
const items = () => Array.from(document.querySelectorAll('[data-slot="toaster-item"]'))

afterEach(() => {
  act(() => {
    toastStore.clear()
  })
})

describe('Toaster (host)', () => {
  it('renders the viewport with the ca-toaster base class', () => {
    render(<Toaster />)
    expect(viewport()).toHaveClass('ca-toaster')
  })

  it('merges a consumer className onto the base class', () => {
    render(<Toaster className="custom-x" />)
    expect(viewport()).toHaveClass('ca-toaster')
    expect(viewport()).toHaveClass('custom-x')
  })

  it('reflects position as a data attribute and defaults to bottom-right', () => {
    const { unmount } = render(<Toaster />)
    expect(viewport()).toHaveAttribute('data-position', 'bottom-right')
    unmount()
    render(<Toaster position="top-center" />)
    expect(viewport()).toHaveAttribute('data-position', 'top-center')
  })

  it('exposes gap as a CSS custom property rather than a hard-coded style', () => {
    render(<Toaster gap={24} />)
    expect(viewport()!.getAttribute('style')).toContain('--ca-toaster-gap: 24px')
  })

  it('still honours a consumer style prop', () => {
    render(<Toaster style={{ zIndex: 999 }} />)
    expect(viewport()).toHaveStyle({ zIndex: '999' })
  })

  it('forwards a ref to the viewport element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Toaster ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'toaster')
  })

  it('portals into document.body by default', () => {
    const { container } = render(<Toaster />)
    expect(container.querySelector('[data-slot="toaster"]')).toBeNull()
    expect(document.body.contains(viewport()!)).toBe(true)
  })

  it('portals into an explicit container when given one', () => {
    const host = document.createElement('div')
    host.id = 'toast-host'
    document.body.appendChild(host)
    render(<Toaster container={host} />)
    expect(host.querySelector('[data-slot="toaster"]')).not.toBeNull()
    host.remove()
  })

  it('is not itself a live region — each toast announces on its own', () => {
    render(<Toaster />)
    expect(viewport()).not.toHaveAttribute('aria-live')
    expect(viewport()).toHaveAttribute('role', 'region')
    act(() => {
      toast.success('Saved')
    })
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders only one stack when two Toasters are mounted', () => {
    render(
      <>
        <Toaster />
        <Toaster />
      </>,
    )
    expect(document.querySelectorAll('[data-slot="toaster"]')).toHaveLength(1)
    act(() => {
      toast('Only once')
    })
    expect(screen.getAllByText('Only once')).toHaveLength(1)
  })

  it('hands the stack to the surviving Toaster when the first unmounts', () => {
    function Two({ showFirst }: { showFirst: boolean }) {
      return (
        <>
          {showFirst && <Toaster className="first" />}
          <Toaster className="second" />
        </>
      )
    }
    const { rerender } = render(<Two showFirst />)
    expect(viewport()).toHaveClass('first')
    rerender(<Two showFirst={false} />)
    expect(document.querySelectorAll('[data-slot="toaster"]')).toHaveLength(1)
    expect(viewport()).toHaveClass('second')
  })
})

describe('toast() store API', () => {
  it('is callable from outside React and renders in the mounted host', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Statement imported', description: '312 transactions added.' })
    })
    expect(screen.getByText('Statement imported')).toBeInTheDocument()
    expect(screen.getByText('312 transactions added.')).toBeInTheDocument()
  })

  it('accepts a bare string as the title', () => {
    render(<Toaster />)
    act(() => {
      toast('Saved')
    })
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('maps the variant helpers onto data-variant', () => {
    render(<Toaster max={0} />)
    act(() => {
      toast.success('ok')
      toast.error('bad')
      toast.warning('careful')
      toast.info('fyi')
    })
    const variants = items().map((el) => el.querySelector('[data-slot="toast"]')!.getAttribute('data-variant'))
    expect(variants).toEqual(['success', 'error', 'warning', 'info'])
  })

  it('escalates an error toast to role=alert / aria-live=assertive', () => {
    render(<Toaster />)
    act(() => {
      toast.error('Sync failed')
    })
    const el = screen.getByRole('alert')
    expect(el).toHaveAttribute('aria-live', 'assertive')
  })

  it('returns an id and dismisses that toast by id', () => {
    render(<Toaster />)
    let id = ''
    act(() => {
      id = toast('Keep')
      toast('Go')
    })
    expect(items()).toHaveLength(2)
    act(() => {
      toast.dismiss(id)
    })
    expect(document.querySelector('[data-slot="toaster-item"][data-state="exiting"]')).not.toBeNull()
  })

  it('dismisses every toast when dismiss() is called with no id', () => {
    render(<Toaster />)
    act(() => {
      toast('a')
      toast('b')
      toast('c')
    })
    expect(items()).toHaveLength(3)
    act(() => {
      toast.dismiss()
    })
    expect(items().every((el) => el.getAttribute('data-state') === 'exiting')).toBe(true)
  })

  it('upserts when the same explicit id is reused', () => {
    render(<Toaster />)
    act(() => {
      toast({ id: 'sync', title: 'Syncing…', variant: 'info' })
      toast({ id: 'sync', title: 'Synced', variant: 'success' })
    })
    expect(items()).toHaveLength(1)
    expect(screen.getByText('Synced')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="toast"]')).toHaveAttribute('data-variant', 'success')
  })

  it('calls onDismiss when the toast is finally removed', () => {
    vi.useFakeTimers()
    try {
      const onDismiss = vi.fn()
      render(<Toaster />)
      let id = ''
      act(() => {
        id = toast({ title: 'Bye', duration: Infinity, onDismiss })
      })
      act(() => {
        toast.dismiss(id)
      })
      expect(onDismiss).not.toHaveBeenCalled()
      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(onDismiss).toHaveBeenCalledWith(id)
      expect(items()).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders a dismiss button by default and none when dismissible is false', () => {
    render(<Toaster />)
    act(() => {
      toast('with close')
    })
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
    act(() => {
      toastStore.clear()
      toast({ title: 'sticky', dismissible: false })
    })
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })
})

describe('auto-dismiss timing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('auto-dismisses after the default duration', () => {
    render(<Toaster />)
    act(() => {
      toast('Transient')
    })
    expect(items()).toHaveLength(1)
    act(() => {
      vi.advanceTimersByTime(4999)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
    act(() => {
      vi.advanceTimersByTime(2)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'exiting')
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(items()).toHaveLength(0)
  })

  it('honours a per-toast duration', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Quick', duration: 1000 })
    })
    act(() => {
      vi.advanceTimersByTime(1001)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'exiting')
  })

  it('honours a host-level default duration', () => {
    render(<Toaster duration={2000} />)
    act(() => {
      toast('Host default')
    })
    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
    act(() => {
      vi.advanceTimersByTime(2)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'exiting')
  })

  it('persists with duration: Infinity', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Sticky', duration: Infinity })
    })
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(items()).toHaveLength(1)
    expect(items()[0]).toHaveAttribute('data-state', 'open')
  })

  it('persists with duration: 0', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Sticky', duration: 0 })
    })
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(items()).toHaveLength(1)
  })

  it('pauses the timer while the pointer is over the stack', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Read me', duration: 3000 })
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.pointerEnter(viewport()!)
    expect(viewport()).toHaveAttribute('data-paused', 'true')
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
    fireEvent.pointerLeave(viewport()!)
    expect(viewport()).toHaveAttribute('data-paused', 'false')
    act(() => {
      vi.advanceTimersByTime(1900)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'exiting')
  })

  it('pauses the timer while focus is inside the stack', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Undo?', action: <button type="button">Undo</button>, duration: 2000 })
    })
    fireEvent.focus(screen.getByRole('button', { name: 'Undo' }))
    expect(viewport()).toHaveAttribute('data-paused', 'true')
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
    fireEvent.blur(screen.getByRole('button', { name: 'Undo' }))
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'exiting')
  })

  it('keeps the timer paused when the pointer leaves but focus is still inside', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Undo?', action: <button type="button">Undo</button>, duration: 2000 })
    })
    const undo = screen.getByRole('button', { name: 'Undo' })
    fireEvent.pointerEnter(viewport()!)
    fireEvent.focus(undo)
    // Pointer wanders off, but the action button still holds focus.
    fireEvent.pointerLeave(viewport()!)
    expect(viewport()).toHaveAttribute('data-paused', 'true')
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
  })

  it('does not unpause when focus moves between two elements inside the stack', () => {
    render(<Toaster />)
    act(() => {
      toast({ title: 'Undo?', action: <button type="button">Undo</button>, duration: 2000 })
    })
    const undo = screen.getByRole('button', { name: 'Undo' })
    const close = screen.getByRole('button', { name: 'Dismiss' })
    fireEvent.focus(undo)
    fireEvent.blur(undo, { relatedTarget: close })
    fireEvent.focus(close)
    expect(viewport()).toHaveAttribute('data-paused', 'true')
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(items()[0]).toHaveAttribute('data-state', 'open')
  })
})

describe('stacking and overflow', () => {
  it('shows at most `max` toasts and collapses the rest into a count', () => {
    render(<Toaster max={2} />)
    act(() => {
      toast('one')
      toast('two')
      toast('three')
      toast('four')
    })
    expect(items()).toHaveLength(2)
    expect(document.querySelector('[data-slot="toaster-overflow"]')).toHaveTextContent('+2 more')
    // The newest toasts stay visible.
    expect(screen.getByText('three')).toBeInTheDocument()
    expect(screen.getByText('four')).toBeInTheDocument()
    expect(screen.queryByText('one')).toBeNull()
  })

  it('renders no overflow indicator below the limit', () => {
    render(<Toaster max={3} />)
    act(() => {
      toast('one')
    })
    expect(document.querySelector('[data-slot="toaster-overflow"]')).toBeNull()
  })

  it('shows the whole queue when max is 0', () => {
    render(<Toaster max={0} />)
    act(() => {
      toast('a')
      toast('b')
      toast('c')
      toast('d')
      toast('e')
    })
    expect(items()).toHaveLength(5)
    expect(document.querySelector('[data-slot="toaster-overflow"]')).toBeNull()
  })

  it('defaults max to 3', () => {
    render(<Toaster />)
    act(() => {
      toast('a')
      toast('b')
      toast('c')
      toast('d')
    })
    expect(items()).toHaveLength(3)
  })
})

describe('useToast', () => {
  it('reads the same store as the module-level toast()', () => {
    function Probe() {
      const { toasts } = useToast()
      return <span data-testid="count">{toasts.length}</span>
    }
    render(
      <>
        <Toaster />
        <Probe />
      </>,
    )
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    act(() => {
      toast('from outside React')
    })
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })

  it('shows a toast fired from a component without its own host', () => {
    function Fire() {
      const { toast: t } = useToast()
      return (
        <button type="button" onClick={() => t.success('Recording deleted')}>
          Delete
        </button>
      )
    }
    render(
      <>
        <Toaster />
        <Fire />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Recording deleted')).toBeInTheDocument()
  })

  it('exposes dismiss and clear', () => {
    function Probe() {
      const { toasts, dismiss, clear } = useToast()
      return (
        <>
          <span data-testid="count">{toasts.length}</span>
          <button type="button" onClick={() => dismiss()}>
            dismiss all
          </button>
          <button type="button" onClick={() => clear()}>
            clear
          </button>
        </>
      )
    }
    render(
      <>
        <Toaster />
        <Probe />
      </>,
    )
    act(() => {
      toast('a')
      toast('b')
    })
    expect(screen.getByTestId('count')).toHaveTextContent('2')
    fireEvent.click(screen.getByRole('button', { name: 'clear' }))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
