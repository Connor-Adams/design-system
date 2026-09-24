import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies the ca-badge base class', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toHaveClass('ca-badge')
  })

  it('merges a consumer className with the base class', () => {
    render(<Badge className="ml-1">New</Badge>)
    const el = screen.getByText('New')
    expect(el).toHaveClass('ca-badge')
    expect(el).toHaveClass('ml-1')
  })

  it('defaults the variant to "default"', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toHaveAttribute('data-variant', 'default')
  })

  it('reflects the variant as a data attribute', () => {
    render(<Badge variant="success">Done</Badge>)
    expect(screen.getByText('Done')).toHaveAttribute('data-variant', 'success')
  })

  it('defaults the size to "default"', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toHaveAttribute('data-size', 'default')
  })

  it('reflects the size as a data attribute', () => {
    render(<Badge size="sm">New</Badge>)
    expect(screen.getByText('New')).toHaveAttribute('data-size', 'sm')
  })

  it('reflects the warning and info variants', () => {
    render(
      <>
        <Badge variant="warning">Due soon</Badge>
        <Badge variant="info">Heads up</Badge>
      </>,
    )
    expect(screen.getByText('Due soon')).toHaveAttribute('data-variant', 'warning')
    expect(screen.getByText('Heads up')).toHaveAttribute('data-variant', 'info')
  })

  it('keeps the count variant at its own bespoke scale by default', () => {
    render(<Badge variant="count">12</Badge>)
    const el = screen.getByText('12')
    expect(el).toHaveAttribute('data-variant', 'count')
    expect(el).toHaveAttribute('data-size', 'default')
  })

  it('renders no status dot by default', () => {
    const { container } = render(<Badge>New</Badge>)
    expect(container.querySelector('[data-slot="badge-dot"]')).toBeNull()
  })

  it('renders a leading status dot when dot is set', () => {
    const { container } = render(<Badge dot>Online</Badge>)
    const el = screen.getByText('Online')
    const dot = container.querySelector('[data-slot="badge-dot"]')
    expect(dot).not.toBeNull()
    expect(dot).toHaveClass('ca-badge__dot')
    // decorative — the label carries the meaning
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    // leading: the dot precedes the label text
    expect(el.firstElementChild).toBe(dot)
  })

  it('does not mark the dot as pulsing unless pulse is set', () => {
    const { container } = render(<Badge dot>Online</Badge>)
    expect(container.querySelector('[data-slot="badge-dot"]')).not.toHaveAttribute('data-pulse')
  })

  it('pulse implies the dot and marks it as pulsing', () => {
    const { container } = render(
      <Badge variant="success" pulse>
        Live
      </Badge>,
    )
    const dot = container.querySelector('[data-slot="badge-dot"]')
    expect(dot).not.toBeNull()
    expect(dot).toHaveAttribute('data-pulse', 'true')
  })

  it('forwards a ref to the underlying span', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>New</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current).toHaveAttribute('data-slot', 'badge')
  })
})
