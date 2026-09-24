import type * as React from 'react'

/**
 * Identity and accessibility attributes that belong on the element a form
 * control actually focuses — never on a presentational wrapper.
 *
 * A `Field`-style wrapper (label + control + hint + error) works by cloning its
 * child and injecting these: `id` so the label's `htmlFor` resolves,
 * `aria-describedby` so hint/error text is announced, `aria-invalid` /
 * `aria-required` so validity is exposed. Simple controls (Input, Textarea,
 * NativeSelect, Checkbox, Switch) spread `...props` straight onto a real
 * focusable DOM node, so injection lands correctly for free. Composite controls
 * that render a styled wrapper around a hidden or decorated inner control
 * (Combobox, Slider) must route these through, or the association fails
 * *silently*: the label still reads as adjacent text, but `htmlFor` points at a
 * non-labelable element and clicking the label focuses nothing.
 *
 * This is a deliberate allow-list rather than a `/^aria-/` regex:
 *
 * - A regex would also drag wrapper-level ARIA onto the inner control —
 *   `aria-orientation`, `aria-hidden`, `aria-live`, `aria-busy` describe the
 *   composite, not the input, and moving them changes what the wrapper exposes.
 * - `name` is not an `aria-` attribute but must travel with `id` (form
 *   serialisation targets the control), so a regex needs a special case anyway.
 * - A named list is greppable, shows up in review when it changes, and gives
 *   one place to keep Combobox and Slider from drifting apart.
 */
export interface ControlIdentityProps {
  id?: string
  name?: string
  'aria-label'?: React.AriaAttributes['aria-label']
  'aria-labelledby'?: React.AriaAttributes['aria-labelledby']
  'aria-describedby'?: React.AriaAttributes['aria-describedby']
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  'aria-required'?: React.AriaAttributes['aria-required']
  'aria-errormessage'?: React.AriaAttributes['aria-errormessage']
}

/** The allow-list, in one place so composite controls cannot drift apart. */
export const CONTROL_IDENTITY_PROPS = [
  'id',
  'name',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-invalid',
  'aria-required',
  'aria-errormessage',
] as const satisfies readonly (keyof ControlIdentityProps)[]

/**
 * Split a composite control's props into the identity/accessibility attributes
 * that must reach the focusable inner element (`control`) and everything else,
 * which stays on the styled wrapper (`wrapper`) — `className`, `style`,
 * `data-*`, event handlers, `role`, `tabIndex`, and any wrapper-level ARIA.
 *
 * Absent keys are not forwarded at all (rather than forwarded as `undefined`),
 * so the inner element's own defaults are never shadowed.
 */
export function splitControlProps<P extends ControlIdentityProps>(
  props: P,
): { control: ControlIdentityProps; wrapper: Omit<P, keyof ControlIdentityProps> } {
  const names: readonly string[] = CONTROL_IDENTITY_PROPS
  const control: Record<string, unknown> = {}
  const wrapper: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (names.includes(key)) control[key] = value
    else wrapper[key] = value
  }
  return {
    control: control as ControlIdentityProps,
    wrapper: wrapper as Omit<P, keyof ControlIdentityProps>,
  }
}

/**
 * Which element inside a control is "the" control, from `Field`'s point of view.
 *
 * - `labelable` — one focusable element *is* the control (`Input`, `Textarea`,
 *   `NativeSelect`, `Checkbox`, `Switch`, and the composites above once they
 *   route identity props inward). An `id` on it is meaningful and
 *   `<label htmlFor>` associates natively.
 * - `group` — the root is a container whose focusable children are nested
 *   (`Stepper`, `RadioGroup`, `ToggleGroup`). No single `id` is "the" control,
 *   and `htmlFor` pointing at a container associates with *nothing*: the label
 *   still renders as adjacent text, so the failure is silent. Such a root is
 *   named with `aria-labelledby` pointing back at the label instead.
 *
 * `labelable` is the default precisely because it is the harmless answer — a
 * plain control mislabelled as a group would lose a working association, while
 * a group left unmarked is only as broken as it was before this existed. The
 * table in `fieldContract.test.tsx` is what keeps the markers honest.
 */
export type FieldShape = 'labelable' | 'group'

/**
 * Declare a component group-shaped so `Field` names it with `aria-labelledby`.
 *
 * Deliberately a mutation called *next to* the component's declaration rather
 * than a wrapper around `React.forwardRef(...)`: the docs site's prop table
 * comes from `react-docgen-typescript`, which only recognises a bare
 * `React.forwardRef` initialiser — wrapping it drops the component's props from
 * the gallery. This also keeps the published type of the component untouched.
 */
export function markFieldShape(component: object, shape: FieldShape): void {
  ;(component as { fieldShape?: FieldShape }).fieldShape = shape
}

/**
 * Read a component's declared shape. Anything unmarked is `labelable`, which is
 * the behaviour every control had before groups were distinguished.
 */
export function fieldShapeOf(type: unknown): FieldShape {
  return (type as { fieldShape?: FieldShape } | null | undefined)?.fieldShape === 'group'
    ? 'group'
    : 'labelable'
}
