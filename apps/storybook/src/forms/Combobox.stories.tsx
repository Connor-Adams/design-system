import type { Meta, StoryObj } from '@storybook/react'
import { Combobox, Label } from '@connor-adams/designsystem'

const ACCOUNT_OPTIONS = [
  { value: 'checking', label: 'Checking', hint: '••4521' },
  { value: 'savings', label: 'Savings', hint: '••8830' },
  { value: 'credit', label: 'Credit Card', hint: '••1234' },
  { value: 'investment', label: 'Investment', hint: '••9977' },
]

const meta: Meta<typeof Combobox> = {
  title: 'Forms/Combobox',
  component: Combobox,
  args: {
    options: ACCOUNT_OPTIONS,
    placeholder: 'Search accounts…',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Combobox>

export const Default: Story = {}
export const WithDefaultValue: Story = { args: { defaultValue: 'savings' } }
export const Small: Story = { args: { size: 'sm' } }

/**
 * `id` and the labelling `aria-*` attributes are routed to the inner search
 * `<input>`, so `<label htmlFor>` really associates — click the label and the
 * search field takes focus.
 */
export const WithAssociatedLabel: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Label htmlFor="account">Account</Label>
      <Combobox {...args} id="account" name="account" aria-describedby="account-hint" />
      <span id="account-hint" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--muted-foreground)' }}>
        Type to filter; the hint is announced with the field.
      </span>
    </div>
  ),
}
