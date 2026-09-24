import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { StatGrid } from './StatGrid'
import { StatCard } from './StatCard'

function root(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-slot="stat-grid"]')
  if (!el) throw new Error('stat-grid root not found')
  return el
}

describe('StatGrid', () => {
  it('renders its children', () => {
    render(
      <StatGrid>
        <StatCard label="Net spend" value="$4,210" />
        <StatCard label="Income" value="$9,800" />
      </StatGrid>,
    )
    expect(screen.getByText('Net spend')).toBeInTheDocument()
    expect(screen.getByText('$9,800')).toBeInTheDocument()
  })

  it('applies the ca-stat-grid base class', () => {
    const { container } = render(<StatGrid>x</StatGrid>)
    expect(root(container)).toHaveClass('ca-stat-grid')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<StatGrid className="mb-4">x</StatGrid>)
    expect(root(container)).toHaveClass('ca-stat-grid')
    expect(root(container)).toHaveClass('mb-4')
  })

  it('forwards a ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<StatGrid ref={ref}>x</StatGrid>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'stat-grid')
  })

  it('defaults to an auto-fit grid with the md gap and no dividers', () => {
    const { container } = render(<StatGrid>x</StatGrid>)
    const el = root(container)
    expect(el).toHaveAttribute('data-columns', 'auto')
    expect(el).toHaveAttribute('data-gap', 'md')
    expect(el).not.toHaveAttribute('data-divided')
  })

  it('reflects a fixed column count on data-columns and the track custom property', () => {
    const { container } = render(<StatGrid columns={4}>x</StatGrid>)
    const el = root(container)
    expect(el).toHaveAttribute('data-columns', '4')
    expect(el.style.getPropertyValue('--ca-stat-grid-columns')).toBe('4')
  })

  it('sets the auto-fit minimum track width from minItemWidth', () => {
    const { container } = render(<StatGrid minItemWidth={220}>x</StatGrid>)
    expect(root(container).style.getPropertyValue('--ca-stat-grid-min')).toBe('220px')
  })

  it('passes a string minItemWidth through verbatim', () => {
    const { container } = render(<StatGrid minItemWidth="14rem">x</StatGrid>)
    expect(root(container).style.getPropertyValue('--ca-stat-grid-min')).toBe('14rem')
  })

  it('reflects the gap scale on data-gap', () => {
    const { container } = render(<StatGrid gap="lg">x</StatGrid>)
    expect(root(container)).toHaveAttribute('data-gap', 'lg')
  })

  it('reflects divided on data-divided', () => {
    const { container } = render(<StatGrid divided>x</StatGrid>)
    expect(root(container)).toHaveAttribute('data-divided', 'true')
  })

  it('keeps a consumer style alongside the layout custom properties', () => {
    const { container } = render(
      <StatGrid columns={3} style={{ marginTop: 8 }}>
        x
      </StatGrid>,
    )
    const el = root(container)
    expect(el.style.marginTop).toBe('8px')
    expect(el.style.getPropertyValue('--ca-stat-grid-columns')).toBe('3')
  })

  it('spreads arbitrary props onto the root', () => {
    const { container } = render(
      <StatGrid role="group" aria-label="Key metrics">
        x
      </StatGrid>,
    )
    expect(root(container)).toHaveAttribute('aria-label', 'Key metrics')
    expect(root(container)).toHaveAttribute('role', 'group')
  })

  it('accepts non-StatCard children untouched — no cloning or introspection', () => {
    const { container } = render(
      <StatGrid>
        <span data-testid="raw" className="mine">
          anything
        </span>
      </StatGrid>,
    )
    const child = screen.getByTestId('raw')
    expect(child).toHaveClass('mine')
    expect(child.className).toBe('mine')
    expect(root(container).children).toHaveLength(1)
  })
})

describe('StatCard bare', () => {
  it('does not mark the shell bare by default', () => {
    const { container } = render(<StatCard label="Net" value="$1" />)
    expect(container.querySelector('[data-slot="stat-card"]')).not.toHaveAttribute('data-bare')
  })

  it('marks the shell bare so it can sit inside a divided StatGrid', () => {
    const { container } = render(<StatCard label="Net" value="$1" bare />)
    expect(container.querySelector('[data-slot="stat-card"]')).toHaveAttribute('data-bare', 'true')
  })
})
