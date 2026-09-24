import type { Meta, StoryObj } from '@storybook/react'
import {
  Field,
  Input,
  Textarea,
  NativeSelect,
  Combobox,
  Switch,
  Slider,
  MoneyInput,
  Stepper,
  RadioGroup,
  ToggleGroup,
} from '@connor-adams/designsystem'

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          'Label + control + hint/error. Generates an id, wires htmlFor, aria-describedby, aria-invalid and aria-required. Error takes precedence over hint.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof Field>

export const Default: Story = {
  render: () => (
    <Field label="Merchant">
      <Input placeholder="Whole Foods Market" />
    </Field>
  ),
}

export const WithHint: Story = {
  render: () => (
    <Field label="Merchant" hint="As it appears on the statement.">
      <Input placeholder="Whole Foods Market" />
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field
      label="Merchant"
      hint="As it appears on the statement."
      error="Merchant is required."
    >
      <Input defaultValue="" />
    </Field>
  ),
}

export const Required: Story = {
  render: () => (
    <Field label="Account name" required hint="Shown throughout the app.">
      <Input placeholder="Amex Cobalt" />
    </Field>
  ),
}

export const AnyControl: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 340 }}>
      <Field label="Note" hint="Optional — receipt detail or split reason.">
        <Textarea placeholder="Add a note…" />
      </Field>
      <Field label="Currency">
        <NativeSelect options={['CAD', 'USD', 'EUR', 'GBP']} />
      </Field>
      <Field label="Category" error="Pick a category before saving.">
        <Combobox
          options={[
            { value: 'groceries', label: 'Groceries' },
            { value: 'dining', label: 'Dining' },
            { value: 'transport', label: 'Transport' },
          ]}
          placeholder="Assign category…"
        />
      </Field>
      <Field label="Amount" required>
        <MoneyInput defaultValue="84.20" />
      </Field>
      <Field label="Auto-reconcile" hint="Match imported rows automatically.">
        <Switch defaultChecked />
      </Field>
      <Field label="Alert threshold" hint="Percent of budget.">
        <Slider min={0} max={100} defaultValue={80} showValue />
      </Field>
    </div>
  ),
}

/**
 * Group-shaped controls — several focusable children under one role-bearing root.
 * `htmlFor` cannot associate with a container, so `Field` names these with
 * `aria-labelledby` instead. Inspect the accessibility tree: the group's name is
 * the Field label.
 */
export const GroupShapedControls: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 340 }}>
      <Field label="Months back" hint="How far the report reaches.">
        <Stepper defaultValue={3} min={1} max={12} format={(v) => `${v} mo`} />
      </Field>
      <Field label="Statement cycle" required>
        <RadioGroup orientation="horizontal" options={['Monthly', 'Weekly']} defaultValue="Monthly" />
      </Field>
      <Field label="Range" error="Pick a range.">
        <ToggleGroup
          items={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          defaultValue="month"
        />
      </Field>
    </div>
  ),
}

export const RenderProp: Story = {
  render: () => (
    <Field label="Custom control" error="This control wires itself.">
      {({ id, 'aria-describedby': describedBy, 'aria-invalid': invalid }) => (
        <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} />
      )}
    </Field>
  ),
}
