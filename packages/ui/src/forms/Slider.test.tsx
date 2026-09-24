import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders a slider with the ca-slider base class', () => {
    const { container } = render(<Slider aria-label="Vol" />)
    expect(container.querySelector('[data-slot="slider"]')).toHaveClass('ca-slider')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<Slider className="mt-4" />)
    const el = container.querySelector('[data-slot="slider"]')
    expect(el).toHaveClass('ca-slider')
    expect(el).toHaveClass('mt-4')
  })

  it('carries the slider data-slot', () => {
    const { container } = render(<Slider />)
    expect(container.querySelector('[data-slot="slider"]')).toBeInTheDocument()
  })

  it('renders a range input reflecting the value', () => {
    render(<Slider aria-label="Vol" value={42} onValueChange={() => {}} />)
    expect(screen.getByRole('slider')).toHaveValue('42')
  })

  it('shows the formatted value when showValue is set', () => {
    render(<Slider aria-label="Vol" value={50} showValue format={(v) => `$${v}`} onValueChange={() => {}} />)
    expect(screen.getByText('$50')).toBeInTheDocument()
  })

  it('fires onValueChange when the range input changes (uncontrolled)', () => {
    const onValueChange = vi.fn()
    render(<Slider aria-label="Vol" onValueChange={onValueChange} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
    expect(onValueChange).toHaveBeenCalledWith(30)
  })

  it('forwards a ref to the underlying range input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Slider aria-label="Vol" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('type', 'range')
  })

  // --- identity / label association -------------------------------------------
  // `Field`-style wrappers inject id + aria-* expecting them to land on the
  // element that takes focus. jsdom does not implement the browser's
  // "click a label, focus its control" behaviour (verified: activeElement stays
  // BODY), so association is asserted through `HTMLLabelElement.control` — the
  // very DOM link a browser uses to implement that click — plus a real focus().

  it('routes id to the focusable range input, not the wrapper', () => {
    const { container } = render(
      <>
        <label htmlFor="threshold">Threshold</label>
        <Slider id="threshold" />
      </>,
    )
    const labelled = screen.getByLabelText('Threshold')
    expect(labelled).toBe(screen.getByRole('slider'))
    expect(container.querySelector('[data-slot="slider"]')).not.toHaveAttribute('id')
  })

  it('associates a <label htmlFor> with the focusable control', () => {
    render(
      <>
        <label htmlFor="threshold">Threshold</label>
        <Slider id="threshold" />
      </>,
    )
    const label = screen.getByText('Threshold') as HTMLLabelElement
    const control = screen.getByRole('slider')
    expect(label.control).toBe(control)
    control.focus()
    expect(document.activeElement).toBe(control)
  })

  it('routes aria-* description/validation props to the range input', () => {
    const { container } = render(
      <Slider aria-label="Vol" aria-describedby="hint-1" aria-invalid aria-required aria-errormessage="err-1" />,
    )
    const input = screen.getByRole('slider')
    expect(input).toHaveAttribute('aria-describedby', 'hint-1')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-errormessage', 'err-1')
    const wrapper = container.querySelector('[data-slot="slider"]')
    expect(wrapper).not.toHaveAttribute('aria-describedby')
    expect(wrapper).not.toHaveAttribute('aria-invalid')
  })

  it('routes aria-label and name to the range input', () => {
    render(<Slider aria-label="Volume" name="volume" />)
    const input = screen.getByRole('slider')
    expect(input).toHaveAttribute('name', 'volume')
    expect(screen.getByLabelText('Volume')).toBe(input)
  })

  it('keeps className, style and data-* on the wrapper', () => {
    const { container } = render(
      <Slider aria-label="Vol" className="mt-4" style={{ width: 300 }} data-testid="sl" id="x" defaultValue={50} />,
    )
    const wrapper = container.querySelector('[data-slot="slider"]') as HTMLElement
    expect(wrapper).toHaveClass('ca-slider', 'mt-4')
    expect(wrapper.style.width).toBe('300px')
    // the consumer style must not clobber the dynamic fill custom property
    expect(wrapper.style.getPropertyValue('--ca-slider-pct')).toBe('50%')
    expect(wrapper).toHaveAttribute('data-testid', 'sl')
    expect(screen.getByRole('slider')).not.toHaveClass('mt-4')
  })
})
