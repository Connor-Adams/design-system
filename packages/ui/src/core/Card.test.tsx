import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Body</Card>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('applies the ca-card base class', () => {
    const { container } = render(<Card>Body</Card>)
    expect(container.querySelector('[data-slot="card"]')).toHaveClass('ca-card')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<Card className="mt-4">Body</Card>)
    const el = container.querySelector('[data-slot="card"]')!
    expect(el).toHaveClass('ca-card')
    expect(el).toHaveClass('mt-4')
  })

  it('forwards a ref to the underlying div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref}>Body</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'card')
  })

  it('sets the data-slot', () => {
    const { container } = render(<Card>Body</Card>)
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument()
  })
})

describe('Card sub-parts', () => {
  it('CardHeader applies base class and forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<CardHeader ref={ref}>H</CardHeader>)
    const el = container.querySelector('[data-slot="card-header"]')!
    expect(el).toHaveClass('ca-card-header')
    expect(ref.current).toBe(el)
  })

  it('CardTitle applies base class and forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<CardTitle ref={ref}>T</CardTitle>)
    const el = container.querySelector('[data-slot="card-title"]')!
    expect(el).toHaveClass('ca-card-title')
    expect(ref.current).toBe(el)
  })

  it('CardDescription applies base class and forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<CardDescription ref={ref}>D</CardDescription>)
    const el = container.querySelector('[data-slot="card-description"]')!
    expect(el).toHaveClass('ca-card-description')
    expect(ref.current).toBe(el)
  })

  it('CardContent applies base class and forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<CardContent ref={ref}>C</CardContent>)
    const el = container.querySelector('[data-slot="card-content"]')!
    expect(el).toHaveClass('ca-card-content')
    expect(ref.current).toBe(el)
  })

  it('merges consumer className on sub-parts', () => {
    const { container } = render(<CardContent className="p-0">C</CardContent>)
    const el = container.querySelector('[data-slot="card-content"]')!
    expect(el).toHaveClass('ca-card-content')
    expect(el).toHaveClass('p-0')
  })
})

describe('Card variants, padding and radius', () => {
  it('defaults reproduce the historical appearance via explicit data attributes', () => {
    const { container } = render(<Card>Body</Card>)
    const el = container.querySelector('[data-slot="card"]')!
    expect(el).toHaveAttribute('data-variant', 'default')
    expect(el).toHaveAttribute('data-padding', 'default')
    expect(el).toHaveAttribute('data-radius', 'lg')
  })

  it.each(['default', 'nested', 'plain'] as const)('reflects variant=%s on data-variant', (variant) => {
    const { container } = render(<Card variant={variant}>Body</Card>)
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute('data-variant', variant)
  })

  it.each(['none', 'sm', 'default', 'lg'] as const)('reflects padding=%s on data-padding', (padding) => {
    const { container } = render(<Card padding={padding}>Body</Card>)
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute('data-padding', padding)
  })

  it.each(['md', 'lg', 'xl'] as const)('reflects radius=%s on data-radius', (radius) => {
    const { container } = render(<Card radius={radius}>Body</Card>)
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute('data-radius', radius)
  })

  it('does not leak the config props onto the DOM as raw attributes', () => {
    const { container } = render(
      <Card variant="nested" padding="lg" radius="xl">
        Body
      </Card>,
    )
    const el = container.querySelector('[data-slot="card"]')!
    expect(el).not.toHaveAttribute('variant')
    expect(el).not.toHaveAttribute('padding')
    expect(el).not.toHaveAttribute('radius')
  })

  it('still merges className and forwards ref when configured', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <Card ref={ref} variant="plain" padding="none" className="mt-4">
        Body
      </Card>,
    )
    const el = container.querySelector('[data-slot="card"]')!
    expect(el).toHaveClass('ca-card', 'mt-4')
    expect(ref.current).toBe(el)
  })
})

describe('CardHeader actions slot', () => {
  it('renders children directly with no wrapper when no actions are passed', () => {
    const { container } = render(
      <CardHeader>
        <CardTitle>Spending</CardTitle>
      </CardHeader>,
    )
    const header = container.querySelector('[data-slot="card-header"]')!
    expect(header).not.toHaveAttribute('data-has-actions')
    expect(header.querySelector('[data-slot="card-header-text"]')).toBeNull()
    expect(header.querySelector('[data-slot="card-header-actions"]')).toBeNull()
    // the title is a direct child, exactly as before
    expect(header.firstElementChild).toHaveAttribute('data-slot', 'card-title')
  })

  it('renders the actions node and flags the header', () => {
    const { container } = render(
      <CardHeader actions={<button type="button">Export</button>}>
        <CardTitle>Spending</CardTitle>
      </CardHeader>,
    )
    const header = container.querySelector('[data-slot="card-header"]')!
    expect(header).toHaveAttribute('data-has-actions', 'true')
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
  })

  it('keeps the title before the actions in DOM order for screen readers', () => {
    const { container } = render(
      <CardHeader actions={<button type="button">Export</button>}>
        <CardTitle>Spending</CardTitle>
        <CardDescription>June 2025</CardDescription>
      </CardHeader>,
    )
    const header = container.querySelector('[data-slot="card-header"]')!
    const text = header.querySelector('[data-slot="card-header-text"]')!
    const actions = header.querySelector('[data-slot="card-header-actions"]')!
    expect(text).not.toBeNull()
    expect(actions).not.toBeNull()
    expect(text.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // title and description stay stacked inside the leading text column
    expect(text.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
    expect(text.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
  })

  it('treats a falsy actions value as absent', () => {
    const { container } = render(<CardHeader actions={null}>H</CardHeader>)
    const header = container.querySelector('[data-slot="card-header"]')!
    expect(header).not.toHaveAttribute('data-has-actions')
    expect(header.querySelector('[data-slot="card-header-actions"]')).toBeNull()
  })

  it('does not leak the actions prop onto the DOM', () => {
    const { container } = render(<CardHeader actions={<span>A</span>}>H</CardHeader>)
    expect(container.querySelector('[data-slot="card-header"]')).not.toHaveAttribute('actions')
  })

  it('forwards ref to the header root even with actions', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <CardHeader ref={ref} actions={<span>A</span>}>
        H
      </CardHeader>,
    )
    expect(ref.current).toBe(container.querySelector('[data-slot="card-header"]'))
  })
})
