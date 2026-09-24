import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders a textbox with the ca-input base class', () => {
    render(<Input aria-label="Name" />)
    expect(screen.getByLabelText('Name')).toHaveClass('ca-input')
  })

  it('merges a consumer className with the base class', () => {
    render(<Input aria-label="Name" className="mt-4" />)
    const el = screen.getByLabelText('Name')
    expect(el).toHaveClass('ca-input')
    expect(el).toHaveClass('mt-4')
  })

  it('reflects invalid as aria-invalid', () => {
    render(<Input aria-label="Name" invalid />)
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('carries the input data-slot', () => {
    render(<Input aria-label="Name" />)
    expect(screen.getByLabelText('Name')).toHaveAttribute('data-slot', 'input')
  })

  it('forwards a ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input aria-label="Name" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('spreads value/onChange wiring onto the native control', () => {
    render(<Input aria-label="Name" value="hi" onChange={() => {}} />)
    expect(screen.getByLabelText('Name')).toHaveValue('hi')
  })

  it('renders a bare input with no wrapper when no adornment is passed', () => {
    const { container } = render(<Input aria-label="Name" />)
    expect(container.firstElementChild?.tagName).toBe('INPUT')
  })

  it('renders a leading icon and reserves its space via data-leading', () => {
    render(<Input aria-label="Search" leadingIcon={<svg data-testid="lead" />} />)
    expect(screen.getByTestId('lead')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toHaveAttribute('data-leading', 'true')
  })

  it('renders a trailing icon and reserves its space via data-trailing', () => {
    render(<Input aria-label="Search" trailingIcon={<svg data-testid="trail" />} />)
    expect(screen.getByTestId('trail')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toHaveAttribute('data-trailing', '1')
  })

  it('reserves two trailing slots when a trailing icon and clear button coexist', () => {
    render(
      <Input
        aria-label="Search"
        trailingIcon={<svg data-testid="trail" />}
        clearable
        value="abc"
        onChange={() => {}}
      />,
    )
    expect(screen.getByLabelText('Search')).toHaveAttribute('data-trailing', '2')
  })

  it('wraps the input when adorned but keeps the ref on the input itself', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <Input aria-label="Search" ref={ref} leadingIcon={<svg />} />,
    )
    expect(container.firstElementChild).toHaveAttribute('data-slot', 'input-wrap')
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('data-slot', 'input')
  })

  it('exposes a real focusable clear button with an accessible name when clearable and non-empty', () => {
    render(<Input aria-label="Search" clearable value="pizza" onChange={() => {}} />)
    const btn = screen.getByRole('button', { name: 'Clear' })
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toBeEnabled()
  })

  it('keeps the clear button out of the tab order when there is nothing to clear', () => {
    const { container } = render(<Input aria-label="Search" clearable value="" onChange={() => {}} />)
    // hidden from the a11y tree entirely, so it is queried structurally
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    const btn = container.querySelector('[data-slot="input-clear"]')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('data-visible', 'false')
    expect(btn).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts a custom clear label', () => {
    render(<Input aria-label="Search" clearable clearLabel="Clear search" value="x" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  })

  it('calls onClear when the clear button is pressed', () => {
    const onClear = vi.fn()
    render(<Input aria-label="Search" clearable value="pizza" onChange={() => {}} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('tracks emptiness for an uncontrolled clearable input and resets its value', () => {
    const { container } = render(<Input aria-label="Search" clearable defaultValue="" />)
    const input = screen.getByLabelText('Search')
    const btn = container.querySelector('[data-slot="input-clear"]') as HTMLButtonElement
    expect(btn).toBeDisabled()
    fireEvent.change(input, { target: { value: 'pasta' } })
    expect(screen.getByRole('button', { name: 'Clear' })).toBe(btn)
    expect(btn).toBeEnabled()
    fireEvent.click(btn)
    expect(input).toHaveValue('')
    expect(btn).toBeDisabled()
  })

  it('returns focus to the input after clearing', () => {
    render(<Input aria-label="Search" clearable defaultValue="pasta" />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByLabelText('Search')).toHaveFocus()
  })
})
