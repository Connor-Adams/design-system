import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { CategoryPill } from './CategoryPill'

describe('CategoryPill', () => {
  it('applies the ca-category-pill base class', () => {
    render(<CategoryPill category="groceries" data-testid="pill" />)
    expect(screen.getByTestId('pill')).toHaveClass('ca-category-pill')
  })

  it('merges a consumer className with the base class', () => {
    render(<CategoryPill category="groceries" className="mr-1" data-testid="pill" />)
    const el = screen.getByTestId('pill')
    expect(el).toHaveClass('ca-category-pill')
    expect(el).toHaveClass('mr-1')
  })

  it('reflects size as a data attribute', () => {
    render(<CategoryPill category="dining" size="sm" data-testid="pill" />)
    expect(screen.getByTestId('pill')).toHaveAttribute('data-size', 'sm')
  })

  it('renders a span by default and a button when interactive', () => {
    const { rerender } = render(<CategoryPill category="dining" data-testid="pill" />)
    expect(screen.getByTestId('pill').tagName).toBe('SPAN')
    rerender(<CategoryPill category="dining" interactive data-testid="pill" />)
    expect(screen.getByTestId('pill').tagName).toBe('BUTTON')
  })

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<CategoryPill category="dining" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('derives a capitalized label from the category', () => {
    render(<CategoryPill category="dining" />)
    expect(screen.getByText('Dining')).toBeInTheDocument()
  })

  it('infers a sensible icon from free-text category names', () => {
    const { container, rerender } = render(<CategoryPill category="Eating Out" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'utensils')
    rerender(<CategoryPill category="Spotify" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'music')
  })

  it('drops the inferred data-icon when a custom icon is supplied', () => {
    const { container } = render(<CategoryPill category="dining" icon={<circle />} />)
    expect(container.querySelector('svg')).not.toHaveAttribute('data-icon')
  })

  it('renders a registry glyph by name via iconName, over inference', () => {
    const { container } = render(<CategoryPill category="dining" iconName="trophy" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'trophy')
  })

  it('applies an overrides map to the inferred icon', () => {
    const { container } = render(<CategoryPill category="Clublink" overrides={{ Clublink: 'trophy' }} />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'trophy')
  })

  it('renders a brand: mark as a filled path rather than an empty stroke glyph', () => {
    const { container } = render(<CategoryPill category="Spotify" iconName="brand:spotify" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('data-icon', 'brand:spotify')
    expect(svg).toHaveAttribute('stroke', 'none')
    const path = svg?.querySelector('path')
    expect(path?.getAttribute('d')).toBeTruthy()
  })

  it('accepts a brand: mark through the overrides map', () => {
    const { container } = render(
      <CategoryPill category="Spotify" overrides={{ Spotify: 'brand:spotify' }} />,
    )
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'brand:spotify')
    expect(container.querySelector('svg path')?.getAttribute('d')).toBeTruthy()
  })
})
