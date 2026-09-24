import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('renders with the ca-stepper base class', () => {
    const { container } = render(<Stepper />)
    expect(container.querySelector('[data-slot="stepper"]')).toHaveClass('ca-stepper')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<Stepper className="mt-4" />)
    const el = container.querySelector('[data-slot="stepper"]')
    expect(el).toHaveClass('ca-stepper')
    expect(el).toHaveClass('mt-4')
  })

  it('reflects size as a data attribute', () => {
    const { container } = render(<Stepper size="sm" />)
    expect(container.querySelector('[data-slot="stepper"]')).toHaveAttribute('data-size', 'sm')
  })

  it('shows the current value, formatted', () => {
    render(<Stepper value={3} format={(v) => `${v} days`} onValueChange={() => {}} />)
    expect(screen.getByText('3 days')).toBeInTheDocument()
  })

  it('increments and decrements (uncontrolled)', () => {
    const onValueChange = vi.fn()
    render(<Stepper defaultValue={5} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }))
    expect(onValueChange).toHaveBeenLastCalledWith(6)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }))
    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })

  it('clamps to min/max', () => {
    const onValueChange = vi.fn()
    render(<Stepper value={0} min={0} max={2} onValueChange={onValueChange} />)
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
  })

  it('forwards a ref to the underlying container element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Stepper ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'stepper')
  })

  // --- labelled group ----------------------------------------------------------
  // Stepper is inherently multi-element: the two buttons take focus, the readout
  // does not, and no single child is "the" control — so a bare `id` cannot be
  // made labelable. The honest answer is a labelled group: the root carries
  // role="group", which is what makes an injected aria-labelledby /
  // aria-describedby announce.

  it('exposes the root as a group so aria-labelledby names the whole control', () => {
    render(
      <>
        <span id="split-label">Split count</span>
        <Stepper aria-labelledby="split-label" defaultValue={2} />
      </>,
    )
    expect(screen.getByRole('group', { name: 'Split count' })).toHaveAttribute('data-slot', 'stepper')
  })

  it('accepts aria-label on the group', () => {
    render(<Stepper aria-label="Months back" defaultValue={3} />)
    expect(screen.getByRole('group', { name: 'Months back' })).toBeInTheDocument()
  })
})
