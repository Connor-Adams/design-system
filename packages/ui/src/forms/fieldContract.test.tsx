import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, act } from '@testing-library/react'
import { MoneyInput } from '../finance/MoneyInput'
import { Checkbox } from './Checkbox'
import { Combobox } from './Combobox'
import { Field } from './Field'
import { fieldShapeOf } from './fieldProps'
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
 *    these expose a role-bearing root named by `aria-labelledby` / `aria-label`,
 *    and `Field` must name them that way instead of with `htmlFor`.
 *
 * These tables are the registry the shape split is enforced from: a new control
 * in `forms/` has to land in one of them (see "the split is declared, not
 * guessed" below), and a GROUP row has to carry the `fieldShape` marker `Field`
 * reads — so a composite added later cannot quietly inherit the labelable path.
 *
 * `Label` is absent from both tables on purpose: it is the labeller, not a
 * control, and is not meant to be focusable.
 */

const LABELABLE: Array<
  [string, React.ElementType, (p: Record<string, unknown>) => React.JSX.Element]
> = [
  ['Checkbox', Checkbox, (p) => <Checkbox {...p} />],
  ['Combobox', Combobox, (p) => <Combobox options={['Apple', 'Pear']} {...p} />],
  ['Input', Input, (p) => <Input {...p} />],
  ['MoneyInput', MoneyInput, (p) => <MoneyInput {...p} />],
  ['NativeSelect', NativeSelect, (p) => <NativeSelect options={['CAD']} {...p} />],
  ['Slider', Slider, (p) => <Slider {...p} />],
  ['Switch', Switch, (p) => <Switch {...p} />],
  ['Textarea', Textarea, (p) => <Textarea {...p} />],
]

const GROUPS: Array<
  [string, string, React.ElementType, (p: Record<string, unknown>) => React.JSX.Element]
> = [
  ['RadioGroup', 'radiogroup', RadioGroup, (p) => <RadioGroup options={['a', 'b']} {...p} />],
  ['Stepper', 'group', Stepper, (p) => <Stepper {...p} />],
  [
    'ToggleGroup',
    'group',
    ToggleGroup,
    (p) => <ToggleGroup items={[{ value: 'a', label: 'A' }]} {...p} />,
  ],
]

/**
 * Every `htmlFor` in the tree must resolve to a *labelable* element.
 *
 * `HTMLLabelElement.control` is the DOM link browsers use to move focus and to
 * compute the accessible name; it is `null` when `for` names an element that
 * cannot be labelled (a `div`, including one wearing `role="group"`). That null
 * is exactly the silent failure this file exists to catch — the label still
 * renders as adjacent text, so nothing looks wrong.
 */
function expectEveryHtmlForToResolveToALabelableElement(container: HTMLElement): void {
  const labels = Array.from(container.querySelectorAll('label[for]')) as HTMLLabelElement[]
  for (const label of labels) {
    expect(document.getElementById(label.htmlFor)).not.toBeNull()
    expect(label.control).not.toBeNull()
  }
}

describe.each(LABELABLE)('Field contract: %s (labelable)', (_name, _Component, renderControl) => {
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

  it('wrapped in a real Field: the label htmlFor reaches the control', () => {
    const { container } = render(<Field label="Field label">{renderControl({})}</Field>)
    const label = container.querySelector('[data-slot="field-label"]') as HTMLLabelElement
    const control = screen.getByLabelText('Field label')
    expect(label.htmlFor).toBe(control.id)
    expect(label.control).toBe(control)
    expectEveryHtmlForToResolveToALabelableElement(container)
  })
})

describe.each(GROUPS)(
  'Field contract: %s (labelled group)',
  (_name, role, _Component, renderControl) => {
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
      expect(screen.getByRole(role, { name: 'Group label' })).toHaveAttribute(
        'aria-describedby',
        'hint',
      )
    })

    it('wrapped in a real Field: the accessible name resolves from the Field label', () => {
      render(<Field label="Group label">{renderControl({})}</Field>)
      expect(screen.getByRole(role, { name: 'Group label' })).toBeInTheDocument()
    })

    it('wrapped in a real Field: no htmlFor points at the non-labelable group root', () => {
      const { container } = render(<Field label="Group label">{renderControl({})}</Field>)
      const group = screen.getByRole(role)
      expect(container.querySelector(`label[for="${group.id}"]`)).toBeNull()
      expectEveryHtmlForToResolveToALabelableElement(container)
    })

    it('wrapped in a real Field: hint text announces on the group root', () => {
      render(
        <Field label="Group label" hint="Pick one">
          {renderControl({})}
        </Field>,
      )
      const group = screen.getByRole(role, { name: 'Group label' })
      const hint = screen.getByText('Pick one')
      expect(group.getAttribute('aria-describedby')).toContain(hint.id)
    })

    it('wrapped in a real Field: error and required land on the group root', () => {
      render(
        <Field label="Group label" required error="Pick one">
          {renderControl({})}
        </Field>,
      )
      const group = screen.getByRole(role, { name: 'Group label' })
      const error = screen.getByText('Pick one')
      expect(group.getAttribute('aria-describedby')).toContain(error.id)
      expect(group).toHaveAttribute('aria-invalid', 'true')
      expect(group).toHaveAttribute('aria-required', 'true')
    })

    it("wrapped in a real Field: the child's own name wins over the Field label", () => {
      render(<Field label="Group label">{renderControl({ 'aria-label': 'Explicit name' })}</Field>)
      expect(screen.getByRole(role, { name: 'Explicit name' })).toBeInTheDocument()
    })
  },
)

describe('the labelable-vs-group split is declared, not guessed', () => {
  it.each(GROUPS)('%s declares fieldShape="group"', (_name, _role, Component) => {
    expect(fieldShapeOf(Component)).toBe('group')
  })

  it.each(LABELABLE)('%s is labelable (the unmarked default)', (_name, Component) => {
    expect(fieldShapeOf(Component)).toBe('labelable')
  })

  /**
   * The guard against a silent regression: a composite control added to
   * `forms/` later fails here until it is categorised, and categorising it as a
   * group fails the marker test above until it declares `fieldShape`. Only then
   * does `Field` route it to `aria-labelledby`.
   */
  it('categorises every form control in forms/', () => {
    const NOT_A_FIELD_CONTROL = new Set([
      'Field', // the wrapper doing the labelling
      'Label', // the labeller, not a control
      // An action button that opens a file dialog — its own visible text names
      // it, and its root is a labelable <button> anyway, so the default path is
      // already correct for it.
      'UploadButton',
    ])
    // vitest runs with cwd = packages/ui (import.meta.url is not a file: URL
    // under the jsdom transform).
    const dir = join(process.cwd(), 'src', 'forms')
    const shipped = readdirSync(dir)
      .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx') && !f.endsWith('.stories.tsx'))
      .map((f) => f.replace(/\.tsx$/, ''))
      .filter((n) => !NOT_A_FIELD_CONTROL.has(n))
    const categorised = new Set([...LABELABLE.map((r) => r[0]), ...GROUPS.map((r) => r[0])])
    expect(shipped.filter((n) => !categorised.has(n))).toEqual([])
  })
})
