import { CONTROL_IDENTITY_PROPS, splitControlProps } from './fieldProps'

describe('splitControlProps', () => {
  it('moves every allow-listed identity/aria attribute to the control', () => {
    const { control, wrapper } = splitControlProps({
      id: 'amount',
      name: 'amount',
      'aria-label': 'Amount',
      'aria-labelledby': 'amount-label',
      'aria-describedby': 'amount-hint',
      'aria-invalid': true,
      'aria-required': true,
      'aria-errormessage': 'amount-error',
    })
    expect(Object.keys(control).sort()).toEqual([...CONTROL_IDENTITY_PROPS].sort())
    expect(wrapper).toEqual({})
  })

  it('leaves className, style, data-* and handlers on the wrapper', () => {
    const onClick = () => {}
    const { control, wrapper } = splitControlProps({
      id: 'x',
      className: 'mt-4',
      style: { width: 10 },
      'data-testid': 'w',
      'aria-orientation': 'horizontal',
      onClick,
    } as Record<string, unknown>)
    expect(control).toEqual({ id: 'x' })
    expect(wrapper).toEqual({
      className: 'mt-4',
      style: { width: 10 },
      'data-testid': 'w',
      // wrapper-level ARIA describes the composite, not the inner control — a
      // /^aria-/ regex would have wrongly hoisted this onto the input.
      'aria-orientation': 'horizontal',
      onClick,
    })
  })

  it('does not forward keys that were never passed', () => {
    const { control } = splitControlProps({ id: 'x' })
    expect('name' in control).toBe(false)
    expect('aria-describedby' in control).toBe(false)
  })

  it('forwards an explicitly undefined value rather than inventing one', () => {
    const { control, wrapper } = splitControlProps({ id: undefined })
    expect('id' in control).toBe(true)
    expect(control.id).toBeUndefined()
    expect('id' in wrapper).toBe(false)
  })

  it('does not mutate the input object', () => {
    const props = { id: 'x', className: 'y' }
    splitControlProps(props)
    expect(props).toEqual({ id: 'x', className: 'y' })
  })
})
