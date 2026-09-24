import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { ChartFrame, resolveChartHeight } from './ChartFrame'

describe('ChartFrame', () => {
  it('renders its children in the plot box', () => {
    render(
      <ChartFrame>
        <div>plot</div>
      </ChartFrame>,
    )
    expect(screen.getByText('plot')).toBeInTheDocument()
  })

  it('applies the ca-chart-frame base class', () => {
    const { container } = render(<ChartFrame />)
    expect(container.querySelector('[data-slot="chart-frame"]')).toHaveClass('ca-chart-frame')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<ChartFrame className="col-span-2" />)
    const el = container.querySelector('[data-slot="chart-frame"]')
    expect(el).toHaveClass('ca-chart-frame')
    expect(el).toHaveClass('col-span-2')
  })

  it('forwards a ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ChartFrame ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'chart-frame')
  })

  it('omits the header entirely when there is no title, subtitle or actions', () => {
    const { container } = render(<ChartFrame>x</ChartFrame>)
    expect(container.querySelector('[data-slot="chart-frame-header"]')).toBeNull()
  })

  it('renders title, subtitle and actions in the header', () => {
    const { container } = render(
      <ChartFrame title="Spend by month" subtitle="Last 12 months" actions={<button>Export</button>} />,
    )
    expect(container.querySelector('[data-slot="chart-frame-header"]')).not.toBeNull()
    expect(screen.getByText('Spend by month')).toBeInTheDocument()
    expect(screen.getByText('Last 12 months')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('renders a header with actions alone', () => {
    const { container } = render(<ChartFrame actions={<button>Export</button>} />)
    expect(container.querySelector('[data-slot="chart-frame-header"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="chart-frame-title"]')).toBeNull()
  })

  it('reflects the padding prop as a data attribute', () => {
    const { container } = render(<ChartFrame padding="compact" />)
    expect(container.querySelector('[data-slot="chart-frame"]')).toHaveAttribute(
      'data-padding',
      'compact',
    )
  })

  it('defaults to a fixed 280px plot height', () => {
    const { container } = render(<ChartFrame />)
    const plot = container.querySelector('[data-slot="chart-frame-plot"]')
    expect(plot).toHaveAttribute('data-height-mode', 'fixed')
    expect(plot).toHaveAttribute('data-height', '280')
    expect(plot).toHaveStyle({ '--ca-chart-frame-height': '280px' })
  })

  it('honours a numeric height', () => {
    const { container } = render(<ChartFrame height={420} />)
    const plot = container.querySelector('[data-slot="chart-frame-plot"]')
    expect(plot).toHaveAttribute('data-height', '420')
    expect(plot).toHaveStyle({ '--ca-chart-frame-height': '420px' })
  })

  it('derives the height from rowCount in auto mode', () => {
    const { container } = render(<ChartFrame height="auto" rowCount={12} />)
    const plot = container.querySelector('[data-slot="chart-frame-plot"]')
    expect(plot).toHaveAttribute('data-height-mode', 'auto')
    // 12 rows * 32px = 384, inside the default 200..560 clamp
    expect(plot).toHaveAttribute('data-height', '384')
  })

  it('clamps the auto height to minHeight and maxHeight', () => {
    const { container: lo } = render(<ChartFrame height="auto" rowCount={1} />)
    expect(lo.querySelector('[data-slot="chart-frame-plot"]')).toHaveAttribute('data-height', '200')
    const { container: hi } = render(<ChartFrame height="auto" rowCount={400} />)
    expect(hi.querySelector('[data-slot="chart-frame-plot"]')).toHaveAttribute('data-height', '560')
  })

  it('renders the footer when given', () => {
    render(<ChartFrame footer="Source: ledger" />)
    expect(screen.getByText('Source: ledger')).toBeInTheDocument()
  })

  it('spreads arbitrary props onto the root', () => {
    const { container } = render(<ChartFrame id="spend-chart" aria-label="Spend chart" />)
    const el = container.querySelector('[data-slot="chart-frame"]')
    expect(el).toHaveAttribute('id', 'spend-chart')
    expect(el).toHaveAttribute('aria-label', 'Spend chart')
  })
})

describe('resolveChartHeight', () => {
  it('passes a number through', () => {
    expect(resolveChartHeight({ height: 300 })).toBe(300)
  })

  it('multiplies rowCount by rowHeight in auto mode', () => {
    expect(resolveChartHeight({ height: 'auto', rowCount: 10, rowHeight: 24 })).toBe(240)
  })

  it('clamps to the min/max window', () => {
    expect(resolveChartHeight({ height: 'auto', rowCount: 0, minHeight: 120 })).toBe(120)
    expect(resolveChartHeight({ height: 'auto', rowCount: 99, maxHeight: 400 })).toBe(400)
  })

  it('floors fractional results and never goes below zero', () => {
    expect(resolveChartHeight({ height: 'auto', rowCount: 3.5, rowHeight: 10, minHeight: 0 })).toBe(35)
    expect(resolveChartHeight({ height: -50, minHeight: 0 })).toBe(0)
  })
})
