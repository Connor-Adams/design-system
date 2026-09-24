import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast } from './Toast'

describe('Toast', () => {
  it('renders with the ca-toast base class', () => {
    render(<Toast title="Saved" />)
    expect(screen.getByRole('status')).toHaveClass('ca-toast')
  })

  it('merges a consumer className onto the base class', () => {
    render(<Toast title="Saved" className="mt-2" />)
    const el = screen.getByRole('status')
    expect(el).toHaveClass('ca-toast')
    expect(el).toHaveClass('mt-2')
  })

  it('keeps static styling in CSS so a className can override it (no inline style attr)', () => {
    render(<Toast title="Saved" className="mt-2" onClose={() => {}} />)
    // No static inline style competing with the class — the consumer className wins.
    expect(screen.getByRole('status')).not.toHaveAttribute('style')
    expect(screen.getByRole('button', { name: 'Dismiss' })).not.toHaveAttribute('style')
  })

  it('still honours a consumer style prop via the ...style spread', () => {
    render(<Toast title="Saved" style={{ opacity: 0.5 }} />)
    expect(screen.getByRole('status')).toHaveStyle({ opacity: '0.5' })
  })

  it('reflects variant as a data attribute', () => {
    render(<Toast variant="warning" title="Careful" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'warning')
  })

  it('announces politely as a status by default', () => {
    render(<Toast title="Saved" />)
    const el = screen.getByRole('status')
    expect(el).toHaveAttribute('aria-live', 'polite')
  })

  it('escalates the error variant to an assertive alert', () => {
    render(<Toast variant="error" title="Sync failed" />)
    const el = screen.getByRole('alert')
    expect(el).toHaveAttribute('aria-live', 'assertive')
    expect(el).toHaveAttribute('data-variant', 'error')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('keeps every non-error variant polite', () => {
    for (const variant of ['default', 'success', 'warning', 'info'] as const) {
      const { unmount } = render(<Toast variant={variant} title="Hi" />)
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
      unmount()
    }
  })

  it('lets an explicit role and aria-live override the derived pair', () => {
    const { unmount } = render(<Toast variant="error" title="Quietly" role="status" aria-live="polite" />)
    const el = screen.getByRole('status')
    expect(el).toHaveAttribute('aria-live', 'polite')
    unmount()
    render(<Toast variant="info" title="Loudly" role="alert" aria-live="assertive" />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('defaults variant to "default"', () => {
    render(<Toast title="Hi" />)
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'default')
  })

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Toast ref={ref} title="Saved" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'toast')
  })

  it('renders title and body', () => {
    render(<Toast title="Saved">Your file is uploaded</Toast>)
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Your file is uploaded')).toBeInTheDocument()
  })

  it('renders a dismiss button when onClose is provided and fires it', () => {
    const onClose = vi.fn()
    render(<Toast title="Saved" onClose={onClose} />)
    const btn = screen.getByRole('button', { name: 'Dismiss' })
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders no dismiss button without onClose', () => {
    render(<Toast title="Saved" />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })
})
