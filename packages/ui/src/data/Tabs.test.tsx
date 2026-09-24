import { createRef, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs } from './Tabs'

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

const trio = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

/** Controlled host, so keyboard navigation can be observed end to end. */
function Host({ initial = 'a', ...rest }: { initial?: string } & Record<string, unknown>) {
  const [value, setValue] = useState(initial)
  return <Tabs items={trio} value={value} onValueChange={setValue} {...rest} />
}

describe('Tabs', () => {
  it('renders a tablist with one tab per item', () => {
    render(<Tabs items={items} value="a" />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('applies the ca-tabs base class to the tablist', () => {
    render(<Tabs items={items} value="a" />)
    expect(screen.getByRole('tablist')).toHaveClass('ca-tabs')
  })

  it('merges a consumer className with the base class', () => {
    render(<Tabs items={items} value="a" className="mt-2" />)
    const list = screen.getByRole('tablist')
    expect(list).toHaveClass('ca-tabs')
    expect(list).toHaveClass('mt-2')
  })

  it('forwards a ref to the underlying tablist element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Tabs ref={ref} items={items} value="a" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('role', 'tablist')
  })

  it('marks the active tab via aria-selected and data-state', () => {
    render(<Tabs items={items} value="b" />)
    const [alpha, beta] = screen.getAllByRole('tab')
    expect(alpha).toHaveAttribute('aria-selected', 'false')
    expect(beta).toHaveAttribute('aria-selected', 'true')
    expect(beta).toHaveAttribute('data-state', 'active')
  })

  it('fires onValueChange when a tab is clicked', () => {
    const onValueChange = vi.fn()
    render(<Tabs items={items} value="a" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Beta' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('applies the ca-tabs-trigger class to each tab', () => {
    render(<Tabs items={items} value="a" />)
    screen.getAllByRole('tab').forEach((tab) => expect(tab).toHaveClass('ca-tabs-trigger'))
  })

  // ---- overflow ----------------------------------------------------------

  it('defaults to overflow="wrap" so existing call sites keep wrapping', () => {
    render(<Tabs items={items} value="a" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('data-overflow', 'wrap')
  })

  it('reflects overflow="scroll" on the tablist', () => {
    render(<Tabs items={items} value="a" overflow="scroll" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('data-overflow', 'scroll')
  })

  it('reports live scroll geometry as data-overflow-start / -end in scroll mode', () => {
    render(<Tabs items={items} value="a" overflow="scroll" />)
    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-overflow-start', 'false')
    expect(list).toHaveAttribute('data-overflow-end', 'false')
  })

  it('leaves the edge-affordance attributes off in wrap mode', () => {
    render(<Tabs items={items} value="a" />)
    const list = screen.getByRole('tablist')
    expect(list).not.toHaveAttribute('data-overflow-start')
    expect(list).not.toHaveAttribute('data-overflow-end')
  })

  describe('scroll-into-view', () => {
    const scrollBy = vi.fn()
    let restoreScrollBy: (() => void) | undefined
    let restoreRect: (() => void) | undefined

    beforeEach(() => {
      scrollBy.mockClear()
      const proto = HTMLElement.prototype as unknown as Record<string, unknown>
      const had = 'scrollBy' in proto
      const prev = proto.scrollBy
      proto.scrollBy = scrollBy
      restoreScrollBy = () => {
        if (had) proto.scrollBy = prev
        else delete proto.scrollBy
      }
      // list spans x 0..100; every tab sits at 200..260, i.e. off the right edge
      const prevRect = HTMLElement.prototype.getBoundingClientRect
      HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement): DOMRect {
        const box =
          this.getAttribute('role') === 'tablist'
            ? { left: 0, right: 100 }
            : { left: 200, right: 260 }
        return { ...box, top: 0, bottom: 0, width: box.right - box.left, height: 0, x: box.left, y: 0, toJSON: () => ({}) } as DOMRect
      }
      restoreRect = () => {
        HTMLElement.prototype.getBoundingClientRect = prevRect
      }
    })

    afterEach(() => {
      restoreScrollBy?.()
      restoreRect?.()
      // @ts-expect-error - jsdom has no matchMedia; tests install one ad hoc
      delete window.matchMedia
    })

    it('scrolls the selected tab into view in scroll mode', () => {
      render(<Tabs items={items} value="b" overflow="scroll" />)
      expect(scrollBy).toHaveBeenCalled()
      expect(scrollBy.mock.calls[0]?.[0]).toMatchObject({ behavior: 'smooth' })
      expect(scrollBy.mock.calls[0]?.[0].left).toBeGreaterThan(0)
    })

    it('does not scroll in wrap mode', () => {
      render(<Tabs items={items} value="b" />)
      expect(scrollBy).not.toHaveBeenCalled()
    })

    it('jumps without animation when prefers-reduced-motion is set', () => {
      window.matchMedia = ((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })) as unknown as typeof window.matchMedia
      render(<Tabs items={items} value="b" overflow="scroll" />)
      expect(scrollBy.mock.calls[0]?.[0]).toMatchObject({ behavior: 'auto' })
    })
  })

  // ---- keyboard navigation (ARIA tabs pattern) ---------------------------

  it('keeps aria-orientation horizontal', () => {
    render(<Tabs items={items} value="a" />)
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('uses a roving tabindex — only the selected tab is in the tab order', () => {
    render(<Tabs items={trio} value="b" />)
    const [alpha, beta, gamma] = screen.getAllByRole('tab')
    expect(alpha).toHaveAttribute('tabindex', '-1')
    expect(beta).toHaveAttribute('tabindex', '0')
    expect(gamma).toHaveAttribute('tabindex', '-1')
  })

  it('ArrowRight selects the next tab', () => {
    render(<Host initial="a" />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Alpha' }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowRight wraps from the last tab to the first', () => {
    render(<Host initial="c" />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Gamma' }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowLeft selects the previous tab', () => {
    render(<Host initial="c" />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Gamma' }), { key: 'ArrowLeft' })
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowLeft wraps from the first tab to the last', () => {
    render(<Host initial="a" />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Alpha' }), { key: 'ArrowLeft' })
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true')
  })

  it('Home selects the first tab and End the last', () => {
    render(<Host initial="b" />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Beta' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Gamma' }), { key: 'Home' })
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
  })

  it('moves DOM focus onto the newly selected tab (automatic activation)', () => {
    render(<Host initial="a" />)
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus()
  })

  it('ignores keys outside the tabs pattern', () => {
    const onValueChange = vi.fn()
    render(<Tabs items={trio} value="a" onValueChange={onValueChange} />)
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    fireEvent.keyDown(alpha, { key: 'ArrowUp' })
    fireEvent.keyDown(alpha, { key: 'ArrowDown' })
    fireEvent.keyDown(alpha, { key: 'PageDown' })
    fireEvent.keyDown(alpha, { key: 'x' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not re-fire onValueChange when navigation lands on the current tab', () => {
    const onValueChange = vi.fn()
    render(<Tabs items={trio} value="a" onValueChange={onValueChange} />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Alpha' }), { key: 'Home' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('still calls a consumer onKeyDown', () => {
    const onKeyDown = vi.fn()
    render(<Tabs items={trio} value="a" onKeyDown={onKeyDown} />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Alpha' }), { key: 'ArrowRight' })
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('lets a consumer onKeyDown opt out via preventDefault', () => {
    const onValueChange = vi.fn()
    render(
      <Tabs
        items={trio}
        value="a"
        onValueChange={onValueChange}
        onKeyDown={(e) => e.preventDefault()}
      />,
    )
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Alpha' }), { key: 'ArrowRight' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  // ---- aria-controls / id wiring -----------------------------------------

  it('gives every tab a stable id so a panel can aria-labelledby it', () => {
    render(<Tabs items={items} value="a" />)
    const ids = screen.getAllByRole('tab').map((t) => t.id)
    expect(ids.every(Boolean)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('wires aria-controls from a per-item panelId', () => {
    render(
      <Tabs
        items={[
          { value: 'a', label: 'Alpha', panelId: 'panel-a' },
          { value: 'b', label: 'Beta', panelId: 'panel-b' },
        ]}
        value="a"
      />,
    )
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-controls', 'panel-a')
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-controls', 'panel-b')
  })

  it('omits aria-controls when no panelId is given', () => {
    render(<Tabs items={items} value="a" />)
    screen.getAllByRole('tab').forEach((tab) => expect(tab).not.toHaveAttribute('aria-controls'))
  })

  it('honours a per-item tabId override', () => {
    render(<Tabs items={[{ value: 'a', label: 'Alpha', tabId: 'my-tab' }]} value="a" />)
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('id', 'my-tab')
  })
})
