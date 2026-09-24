import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Field } from './Field'
import { Input } from './Input'
import { Switch } from './Switch'

describe('Field', () => {
  it('renders with the ca-field base class and data-slot', () => {
    const { container } = render(
      <Field label="Merchant">
        <Input />
      </Field>,
    )
    const root = container.querySelector('[data-slot="field"]')
    expect(root).toHaveClass('ca-field')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(
      <Field label="Merchant" className="mt-4">
        <Input />
      </Field>,
    )
    const root = container.querySelector('[data-slot="field"]')
    expect(root).toHaveClass('ca-field')
    expect(root).toHaveClass('mt-4')
  })

  it('generates an id and wires label htmlFor to the control', () => {
    render(
      <Field label="Merchant">
        <Input />
      </Field>,
    )
    // getByLabelText only resolves if htmlFor/id association actually works
    const input = screen.getByLabelText('Merchant')
    expect(input.tagName).toBe('INPUT')
    expect(input.id).toBeTruthy()
  })

  it('honours an explicit id prop', () => {
    render(
      <Field id="merchant" label="Merchant">
        <Input />
      </Field>,
    )
    expect(screen.getByLabelText('Merchant')).toHaveAttribute('id', 'merchant')
  })

  it("keeps the child's own id and labels it", () => {
    render(
      <Field label="Merchant">
        <Input id="child-owned" />
      </Field>,
    )
    expect(screen.getByLabelText('Merchant')).toHaveAttribute('id', 'child-owned')
  })

  it('links a hint through aria-describedby', () => {
    render(
      <Field label="Merchant" hint="As it appears on the statement">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Merchant')
    const hint = screen.getByText('As it appears on the statement')
    expect(hint).toHaveAttribute('id')
    expect(input.getAttribute('aria-describedby')).toContain(hint.id)
  })

  it('renders the error instead of the hint and points aria-describedby at it', () => {
    render(
      <Field label="Merchant" hint="Statement name" error="Merchant is required">
        <Input />
      </Field>,
    )
    const input = screen.getByLabelText('Merchant')
    const error = screen.getByText('Merchant is required')
    expect(screen.queryByText('Statement name')).not.toBeInTheDocument()
    expect(input.getAttribute('aria-describedby')).toBe(error.id)
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('marks the root invalid for styling when there is an error', () => {
    const { container } = render(
      <Field label="Merchant" error="Nope">
        <Input />
      </Field>,
    )
    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute('data-invalid', 'true')
  })

  it('marks required state with aria-required plus a visual marker', () => {
    const { container } = render(
      <Field label="Merchant" required>
        <Input />
      </Field>,
    )
    // the label's text content now carries the visual `*`, hence the regex
    expect(screen.getByLabelText(/^Merchant/)).toHaveAttribute('aria-required', 'true')
    const marker = container.querySelector('[data-slot="field-required"]')
    expect(marker).toBeInTheDocument()
    expect(marker).toHaveAttribute('aria-hidden', 'true')
  })

  it("preserves the child's own aria-describedby alongside the field text", () => {
    render(
      <Field label="Merchant" hint="Statement name">
        <Input aria-describedby="external-note" />
      </Field>,
    )
    const described = screen.getByLabelText('Merchant').getAttribute('aria-describedby') ?? ''
    expect(described).toContain('external-note')
    expect(described.split(' ').length).toBe(2)
  })

  it("does not clobber the child's explicit aria-invalid", () => {
    render(
      <Field label="Merchant">
        <Input aria-invalid="true" />
      </Field>,
    )
    expect(screen.getByLabelText('Merchant')).toHaveAttribute('aria-invalid', 'true')
  })

  it('wires a non-input control (Switch) by id and describedby', () => {
    render(
      <Field label="Auto-reconcile" hint="Match imports automatically">
        <Switch />
      </Field>,
    )
    const sw = screen.getByRole('switch')
    expect(sw.id).toBeTruthy()
    expect(sw.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('supports a render-prop child for controls that cannot take DOM props', () => {
    render(
      <Field label="Merchant" error="Bad">
        {({ id, 'aria-describedby': describedBy, 'aria-invalid': invalid }) => (
          <input id={id} aria-describedby={describedBy} aria-invalid={invalid} />
        )}
      </Field>,
    )
    const input = screen.getByLabelText('Merchant')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('renders without a label', () => {
    render(
      <Field hint="No label here">
        <Input aria-label="Bare" />
      </Field>,
    )
    expect(screen.getByLabelText('Bare')).toBeInTheDocument()
    expect(screen.getByText('No label here')).toBeInTheDocument()
  })

  it('forwards a ref to the underlying container element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Field label="Merchant" ref={ref}>
        <Input />
      </Field>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'field')
  })
})
