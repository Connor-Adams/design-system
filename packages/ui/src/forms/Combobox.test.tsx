import { createRef } from 'react'
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
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ban' } })
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument()
  })

  it('fires onValueChange when an option is chosen', () => {
    const onValueChange = vi.fn()
    render(<Combobox options={options} onValueChange={onValueChange} />)
    fireEvent.focus(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onValueChange).toHaveBeenCalledWith('Cherry')
  })

  it('marks the selected option active via data-active / aria-selected', () => {
    render(<Combobox options={options} value="Banana" onValueChange={() => {}} />)
    fireEvent.focus(screen.getByRole('textbox'))
    const opt = screen.getByRole('option', { name: 'Banana' })
    expect(opt).toHaveAttribute('aria-selected', 'true')
    expect(opt).toHaveAttribute('data-active', 'true')
  })

  it('shows emptyText when nothing matches', () => {
    render(<Combobox options={options} emptyText="Nope" />)
    const input = screen.getByRole('textbox')
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
    expect(labelled).toBe(screen.getByRole('textbox'))
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
    const control = screen.getByRole('textbox')
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
    const input = screen.getByRole('textbox')
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
    const input = screen.getByRole('textbox')
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
    expect(screen.getByRole('textbox')).not.toHaveClass('mt-4')
  })
})
