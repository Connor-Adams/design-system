import { render, screen, act } from '@testing-library/react'
import { MoneyInput } from '../finance/MoneyInput'
import { Checkbox } from './Checkbox'
import { Combobox } from './Combobox'
import { Input } from './Input'
import { NativeSelect } from './NativeSelect'
import { RadioGroup } from './RadioGroup'
import { Slider } from './Slider'
import { Stepper } from './Stepper'
import { Switch } from './Switch'
import { Textarea } from './Textarea'
import { ToggleGroup } from './ToggleGroup'

/**
 * The `Field` contract, audited across every form control at once.
 *
 * `Field` (label + control + hint + error) clones its child and injects `id`,
 * `aria-describedby`, `aria-invalid` and `aria-required`, then points its
 * label's `htmlFor` at that `id`. That only works if the injected props reach
 * the element that actually takes focus. When they land on a presentational
 * wrapper instead, the failure is *silent* — the label still reads as adjacent
 * text and the hint still announces — which is why this is a table rather than
 * a per-component afterthought.
 *
 * Controls split into two honest shapes:
 *  - LABELABLE — one focusable element is the control, so `id` goes on it and
 *    `<label htmlFor>` associates (and in a browser, clicking the label focuses
 *    it; jsdom does not implement that, so `HTMLLabelElement.control` — the DOM
 *    link browsers use for it — is asserted instead).
 *  - GROUP — inherently multi-element (several focusable children, or a
 *    read-only readout between two buttons). A single `id` is not meaningful, so
 *    these expose a role-bearing root named by `aria-labelledby` / `aria-label`.
 *
 * `Label` is absent from both tables on purpose: it is the labeller, not a
 * control, and is not meant to be focusable.
 */

const LABELABLE: Array<[string, (p: Record<string, unknown>) => React.JSX.Element]> = [
  ['Checkbox', (p) => <Checkbox {...p} />],
  ['Combobox', (p) => <Combobox options={['Apple', 'Pear']} {...p} />],
  ['Input', (p) => <Input {...p} />],
  ['MoneyInput', (p) => <MoneyInput {...p} />],
  ['NativeSelect', (p) => <NativeSelect options={['CAD']} {...p} />],
  ['Slider', (p) => <Slider {...p} />],
  ['Switch', (p) => <Switch {...p} />],
  ['Textarea', (p) => <Textarea {...p} />],
]

const GROUPS: Array<[string, string, (p: Record<string, unknown>) => React.JSX.Element]> = [
  ['RadioGroup', 'radiogroup', (p) => <RadioGroup options={['a', 'b']} {...p} />],
  ['Stepper', 'group', (p) => <Stepper {...p} />],
  ['ToggleGroup', 'group', (p) => <ToggleGroup items={[{ value: 'a', label: 'A' }]} {...p} />],
]

describe.each(LABELABLE)('Field contract: %s (labelable)', (_name, renderControl) => {
  it('puts the injected id on a focusable element a <label htmlFor> can reach', () => {
    render(
      <>
        <label htmlFor="ctl">Field label</label>
        {renderControl({ id: 'ctl' })}
      </>,
    )
    const label = screen.getByText('Field label') as HTMLLabelElement
    const control = screen.getByLabelText('Field label')
    // `label.control` is non-null only for a labelable element — the wrapper
    // <div>s this bug used to hand out fail here.
    expect(label.control).toBe(control)
    // act(): focusing some controls (Combobox, MoneyInput) sets state.
    act(() => control.focus())
    expect(document.activeElement).toBe(control)
  })

  it('announces the injected aria-describedby / aria-invalid on that same element', () => {
    render(
      <>
        <label htmlFor="ctl">Field label</label>
        {renderControl({ id: 'ctl', 'aria-describedby': 'hint', 'aria-invalid': true })}
        <span id="hint">Some hint</span>
      </>,
    )
    const control = screen.getByLabelText('Field label')
    expect(control).toHaveAttribute('aria-describedby', 'hint')
    expect(control).toHaveAttribute('aria-invalid', 'true')
  })
})

describe.each(GROUPS)('Field contract: %s (labelled group)', (_name, role, renderControl) => {
  it('names the role-bearing root via aria-labelledby', () => {
    render(
      <>
        <span id="grp">Group label</span>
        {renderControl({ 'aria-labelledby': 'grp' })}
      </>,
    )
    expect(screen.getByRole(role, { name: 'Group label' })).toBeInTheDocument()
  })

  it('carries aria-describedby on the role-bearing root', () => {
    render(renderControl({ 'aria-label': 'Group label', 'aria-describedby': 'hint' }))
    expect(screen.getByRole(role, { name: 'Group label' })).toHaveAttribute('aria-describedby', 'hint')
  })
})
