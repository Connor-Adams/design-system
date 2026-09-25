import { createRef } from 'react'
import type * as React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Combobox } from './Combobox'

const options = ['Apple', 'Banana', 'Cherry']

describe('Combobox', () => {
  it('renders with the ca-combobox base class', () => {
    const { container } = render(<Combobox options={options} />)
    expect(container.querySelector('[data-slot="combobox"]')).toHaveClass('ca-combobox')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<Combobox options={options} className="mt-4" />)
    const el = container.querySelector('[data-slot="combobox"]')
    expect(el).toHaveClass('ca-combobox')
    expect(el).toHaveClass('mt-4')
  })

  it('carries the combobox data-slot', () => {
    const { container } = render(<Combobox options={options} />)
    expect(container.querySelector('[data-slot="combobox"]')).toBeInTheDocument()
  })

  it('opens the listbox and filters on typing', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ban' } })
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument()
  })

  it('fires onValueChange when an option is chosen', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    fireEvent.focus(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onValueChange).toHaveBeenCalledWith('Cherry')
  })

  it('marks the selected option active via data-active / aria-selected', () => {
    render(<Combobox options={options} value="Banana" onValueChange={() => {}} />)
    fireEvent.focus(screen.getByRole('combobox'))
    const opt = screen.getByRole('option', { name: 'Banana' })
    expect(opt).toHaveAttribute('aria-selected', 'true')
    expect(opt).toHaveAttribute('data-active', 'true')
  })

  it('shows emptyText when nothing matches', () => {
    render(<Combobox options={options} emptyText="Nope" />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(screen.getByText('Nope')).toBeInTheDocument()
  })

  it('forwards a ref to the underlying search input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Combobox options={options} ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  // --- identity / label association -------------------------------------------
  // `Field`-style wrappers inject id + aria-* expecting them to land on the
  // element that takes focus. jsdom does not implement the browser's
  // "click a label, focus its control" behaviour (verified: activeElement stays
  // BODY), so association is asserted through `HTMLLabelElement.control` — the
  // very DOM link a browser uses to implement that click — plus a real focus().

  it('routes id to the focusable input, not the wrapper', () => {
    const { container } = render(
      <>
        <label htmlFor="category">Category</label>
        <Combobox id="category" options={options} />
      </>,
    )
    const labelled = screen.getByLabelText('Category')
    expect(labelled).toBe(screen.getByRole('combobox'))
    expect(container.querySelector('[data-slot="combobox"]')).not.toHaveAttribute('id')
  })

  it('associates a <label htmlFor> with the focusable control', () => {
    render(
      <>
        <label htmlFor="category">Category</label>
        <Combobox id="category" options={options} />
      </>,
    )
    const label = screen.getByText('Category') as HTMLLabelElement
    const control = screen.getByRole('combobox')
    expect(label.control).toBe(control)
    // focusing opens the listbox, hence act()
    act(() => control.focus())
    expect(document.activeElement).toBe(control)
  })

  it('routes aria-* description/validation props to the input', () => {
    const { container } = render(
      <Combobox
        options={options}
        aria-describedby="hint-1"
        aria-invalid
        aria-required
        aria-errormessage="err-1"
      />,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-describedby', 'hint-1')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-errormessage', 'err-1')
    const wrapper = container.querySelector('[data-slot="combobox"]')
    expect(wrapper).not.toHaveAttribute('aria-describedby')
    expect(wrapper).not.toHaveAttribute('aria-invalid')
  })

  it('routes aria-label / aria-labelledby and name to the input', () => {
    render(<Combobox options={options} aria-label="Pick a fruit" name="fruit" />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('name', 'fruit')
    expect(screen.getByLabelText('Pick a fruit')).toBe(input)
  })

  it('keeps className, style and data-* on the wrapper', () => {
    const { container } = render(
      <Combobox options={options} className="mt-4" style={{ width: 300 }} data-testid="cb" id="x" />,
    )
    const wrapper = container.querySelector('[data-slot="combobox"]') as HTMLElement
    expect(wrapper).toHaveClass('ca-combobox', 'mt-4')
    expect(wrapper.style.width).toBe('300px')
    expect(wrapper).toHaveAttribute('data-testid', 'cb')
    expect(screen.getByRole('combobox')).not.toHaveClass('mt-4')
  })
})

// --- keyboard operation (ARIA combobox pattern) --------------------------------
// Focus never leaves the search input: options are non-focusable `role="option"`
// elements and the active one is conveyed with `aria-activedescendant`. jsdom
// implements `aria-*` as plain attributes, so the wiring below is fully
// assertable here; only the scroll-into-view geometry needs a real browser.

describe('Combobox keyboard', () => {
  const openWithKeyboard = (): HTMLElement => {
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    return input
  }
  const activeOption = (input: HTMLElement): HTMLElement | null => {
    const id = input.getAttribute('aria-activedescendant')
    return id ? document.getElementById(id) : null
  }

  it('exposes role=combobox with the collapsed ARIA wiring', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')
    expect(input).toHaveAttribute('aria-controls')
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('points aria-controls at the listbox it owns', () => {
    render(<Combobox options={options} />)
    const input = openWithKeyboard()
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(input.getAttribute('aria-controls') as string)).toBe(
      screen.getByRole('listbox'),
    )
  })

  it('gives two Comboboxes on one page distinct option ids', () => {
    render(
      <>
        <Combobox options={options} aria-label="one" />
        <Combobox options={options} aria-label="two" />
      </>,
    )
    const [a, b] = screen.getAllByRole('combobox')
    fireEvent.keyDown(a as HTMLElement, { key: 'ArrowDown' })
    fireEvent.keyDown(b as HTMLElement, { key: 'ArrowDown' })
    expect(a).toHaveAttribute('aria-activedescendant')
    expect(a?.getAttribute('aria-activedescendant')).not.toBe(
      b?.getAttribute('aria-activedescendant'),
    )
  })

  it('opens on ArrowDown and highlights the first option', () => {
    render(<Combobox options={options} />)
    const input = openWithKeyboard()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(activeOption(input)).toHaveTextContent('Apple')
    expect(activeOption(input)).toHaveAttribute('data-highlighted', 'true')
  })

  it('opens on ArrowUp and highlights the last option', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(activeOption(input)).toHaveTextContent('Cherry')
  })

  it('opens with the committed value highlighted', () => {
    render(<Combobox options={options} defaultValue="Banana" />)
    const input = openWithKeyboard()
    expect(activeOption(input)).toHaveTextContent('Banana')
  })

  it('moves the active option with ArrowDown / ArrowUp, wrapping at both ends', () => {
    render(<Combobox options={options} />)
    const input = openWithKeyboard()
    expect(activeOption(input)).toHaveTextContent('Apple')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption(input)).toHaveTextContent('Banana')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption(input)).toHaveTextContent('Cherry')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(activeOption(input)).toHaveTextContent('Apple')
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(activeOption(input)).toHaveTextContent('Cherry')
  })

  it('jumps to the first / last option with Home / End', () => {
    render(<Combobox options={options} />)
    const input = openWithKeyboard()
    fireEvent.keyDown(input, { key: 'End' })
    expect(activeOption(input)).toHaveTextContent('Cherry')
    fireEvent.keyDown(input, { key: 'Home' })
    expect(activeOption(input)).toHaveTextContent('Apple')
  })

  it('leaves Home / End to the text caret while the list is closed', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    // fireEvent returns false when the handler called preventDefault().
    expect(fireEvent.keyDown(input, { key: 'Home' })).toBe(true)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens on Alt+ArrowDown without moving the active option', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('closes on Alt+ArrowUp without selecting', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    const input = openWithKeyboard()
    fireEvent.keyDown(input, { key: 'ArrowUp', altKey: true })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does NOT select as the active option moves (selection is not focus)', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    const input = openWithKeyboard()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('selects the active option on Enter and closes the list', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    const input = openWithKeyboard()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('Banana')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('Banana')
  })

  it('leaves Enter to the form when no option is active', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('highlights the first match as the filter text changes', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'rr' } })
    expect(activeOption(input)).toHaveTextContent('Cherry')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveValue('Cherry')
  })

  it('drops aria-activedescendant when the filter matches nothing', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(input).not.toHaveAttribute('aria-activedescendant')
    expect(fireEvent.keyDown(input, { key: 'Enter' })).toBe(true)
  })

  it('closes on Escape without selecting, discarding the filter text', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} defaultValue="Apple" onValueChange={onValueChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'che' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(fireEvent.keyDown(input, { key: 'Escape' })).toBe(false)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('Apple')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('leaves a closed Combobox’s Escape to the layer above', () => {
    render(<Combobox options={options} />)
    // Not prevented and not stopped, so a Dialog wrapping this still closes.
    expect(fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })).toBe(true)
  })

  it('closes on Tab without swallowing it, so focus moves on', () => {
    render(<Combobox options={options} />)
    const input = openWithKeyboard()
    expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(true)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('keeps options out of the tab order so the list cannot trap focus', () => {
    render(<Combobox options={options} />)
    openWithKeyboard()
    for (const opt of screen.getAllByRole('option')) {
      expect(opt).not.toHaveAttribute('tabindex')
      expect(opt.tagName).not.toBe('BUTTON')
    }
  })

  it('discards the filter and closes when focus leaves the control', () => {
    render(
      <>
        <Combobox options={options} defaultValue="Apple" />
        <button type="button">after</button>
      </>,
    )
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'che' } })
    fireEvent.blur(input, { relatedTarget: screen.getByRole('button', { name: 'after' }) })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('Apple')
  })

  it('still selects on click, keeping focus on the input', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    const input = openWithKeyboard()
    // A real browser would blur the input if the option took focus; the option
    // cancels its own mousedown so focus never moves.
    expect(fireEvent.mouseDown(screen.getByRole('option', { name: 'Cherry' }))).toBe(false)
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onValueChange).toHaveBeenCalledWith('Cherry')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('omits aria-multiselectable on a single-select listbox', () => {
    render(<Combobox options={options} />)
    openWithKeyboard()
    expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-multiselectable')
  })

  it('still honours a consumer onKeyDown, and lets it pre-empt the default', () => {
    const onKeyDown = vi.fn((e: React.KeyboardEvent) => e.preventDefault())
    render(<Combobox options={options} onKeyDown={onKeyDown} />)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    expect(onKeyDown).toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})

// --- disabled -----------------------------------------------------------------

describe('Combobox disabled', () => {
  it('disables the inner input rather than the wrapper div', () => {
    const { container } = render(<Combobox options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(container.querySelector('[data-slot="combobox"]')).not.toHaveAttribute('disabled')
  })

  it('reflects disabled on the wrapper as data-disabled for CSS', () => {
    const { container } = render(<Combobox options={options} disabled />)
    expect(container.querySelector('[data-slot="combobox"]')).toHaveAttribute(
      'data-disabled',
      'true',
    )
  })

  it('omits data-disabled when enabled', () => {
    const { container } = render(<Combobox options={options} />)
    expect(container.querySelector('[data-slot="combobox"]')).not.toHaveAttribute('data-disabled')
  })

  it('never opens the list — by focus, click or keyboard', () => {
    const { container } = render(<Combobox options={options} disabled />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.click(container.querySelector('.ca-combobox-control') as HTMLElement)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

// Regression: focusing the field already opens the list, so the arrow-key
// seeding cannot key off "the list was closed" — a real browser flushes the
// focus-driven open before the first ArrowDown arrives, and the highlight was
// landing on row 0 instead of on the committed value. (Caught in a browser, not
// in jsdom, hence the explicit focus-then-arrow ordering here.)
describe('Combobox seeding after a focus-driven open', () => {
  it('still seeds ArrowDown on the committed value', () => {
    render(<Combobox options={options} defaultValue="Banana" />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(document.getElementById(input.getAttribute('aria-activedescendant') as string))
      .toHaveTextContent('Banana')
  })

  it('still seeds ArrowUp on the last row when nothing is committed', () => {
    render(<Combobox options={options} />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(document.getElementById(input.getAttribute('aria-activedescendant') as string))
      .toHaveTextContent('Cherry')
  })
})
