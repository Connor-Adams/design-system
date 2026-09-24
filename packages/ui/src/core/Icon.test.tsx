import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { GLYPHS, Icon, iconNames } from './Icon'
import { brandColors } from './brandGlyphs'

describe('Icon', () => {
  it('applies the ca-icon base class', () => {
    const { container } = render(<Icon name="wallet" />)
    expect(container.querySelector('svg')).toHaveClass('ca-icon')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<Icon name="wallet" className="mr-2" />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveClass('ca-icon')
    expect(svg).toHaveClass('mr-2')
  })

  it('reflects the glyph name as a data attribute', () => {
    const { container } = render(<Icon name="search" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'search')
  })

  it('defaults to a 20px square', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })

  it('honors a custom size', () => {
    const { container } = render(<Icon name="check" size={32} />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '32')
  })

  it('is decorative (aria-hidden) without a title', () => {
    const { container } = render(<Icon name="bell" />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
  })

  it('exposes an accessible image when given a title', () => {
    render(<Icon name="bell" title="Notifications" />)
    const svg = screen.getByRole('img', { name: 'Notifications' })
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(svg.querySelector('title')).toHaveTextContent('Notifications')
  })

  it('forwards a ref to the underlying svg element', () => {
    const ref = createRef<SVGSVGElement>()
    render(<Icon name="wallet" ref={ref} />)
    expect(ref.current).toBeInstanceOf(SVGSVGElement)
    expect(ref.current).toHaveAttribute('data-icon', 'wallet')
  })

  it('exports the full registry via iconNames', () => {
    expect(iconNames).toContain('wallet')
    expect(iconNames).toContain('chevron-right')
    expect(iconNames.length).toBeGreaterThan(20)
  })

  it('renders a brand glyph as a filled path with currentColor by default', () => {
    const { container } = render(<Icon name="brand:spotify" />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveClass('ca-icon')
    expect(svg).toHaveAttribute('data-icon', 'brand:spotify')
    expect(svg).toHaveAttribute('data-brand', 'spotify')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg.querySelector('path')).toBeInTheDocument()
  })

  it('fills a brand glyph with its official color when brand is set', () => {
    const { container } = render(<Icon name="brand:spotify" brand />)
    expect(container.querySelector('svg')).toHaveAttribute('fill', brandColors.spotify)
  })

  it('leaves stroke glyphs unfilled and brand-prop-agnostic', () => {
    const { container } = render(<Icon name="wallet" brand />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('includes brand names in iconNames', () => {
    expect(iconNames).toContain('brand:spotify')
  })
})

const MEDIA_GLYPHS = [
  'stop',
  'fast-forward',
  'rewind',
  'play-circle',
  'pause-circle',
  'shuffle',
  'repeat-1',
  'volume-1',
  'headphones',
  'speaker',
  'mic-off',
  'cast',
  'airplay',
  'disc',
  'album',
  'radio',
  'podcast',
  'list-music',
  'audio-lines',
] as const

describe('Icon media glyphs', () => {
  it.each(MEDIA_GLYPHS)('registers %s in GLYPHS and iconNames', (name) => {
    expect(GLYPHS).toHaveProperty(name)
    expect(iconNames).toContain(name)
  })

  it.each(MEDIA_GLYPHS)('renders %s with drawable geometry', (name) => {
    const { container } = render(<Icon name={name} />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('data-icon', name)
    expect(svg.querySelectorAll('path, circle, rect, line, polygon, polyline').length).toBeGreaterThan(0)
  })

  it.each(MEDIA_GLYPHS)('keeps %s a pure stroke glyph with no baked-in color', (name) => {
    const { container } = render(<Icon name={name} />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    for (const child of Array.from(svg.children)) {
      expect(child.hasAttribute('fill')).toBe(false)
      expect(child.hasAttribute('stroke')).toBe(false)
      expect(child.hasAttribute('style')).toBe(false)
    }
  })

  it('does not repurpose the existing subscriptions `repeat` glyph', () => {
    expect(iconNames).toContain('repeat')
    expect(GLYPHS.repeat).not.toEqual(GLYPHS['repeat-1'])
  })

  it('wraps play-circle / pause-circle in the same r=10 circle as the other *-circle glyphs', () => {
    const radius = (name: Parameters<typeof Icon>[0]['name']) => {
      const { container } = render(<Icon name={name} />)
      return container.querySelector('svg > circle')!.getAttribute('r')
    }
    expect(radius('play-circle')).toBe(radius('check-circle'))
    expect(radius('pause-circle')).toBe(radius('x-circle'))
    expect(radius('play-circle')).toBe(radius('plus-circle'))
    expect(radius('play-circle')).toBe('10')
  })

  it('covers the full audio surface the media components need', () => {
    for (const name of ['play', 'pause', 'stop', 'skip-forward', 'skip-back', 'volume', 'volume-x', 'music', 'mic']) {
      expect(iconNames).toContain(name)
    }
  })
})
