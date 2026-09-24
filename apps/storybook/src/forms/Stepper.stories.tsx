import type { Meta, StoryObj } from '@storybook/react'
import { Stepper } from '@connor-adams/designsystem'

const meta: Meta<typeof Stepper> = {
  title: 'Forms/Stepper',
  component: Stepper,
  args: {
    defaultValue: 3,
    min: 0,
    max: 20,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Stepper>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
export const Disabled: Story = { args: { disabled: true } }

/**
 * Stepper is a labelled *group*, not one labelable element — the −/+ buttons take
 * focus and the readout does not. Name it with `aria-labelledby` pointing at your
 * label, not with `<label htmlFor>`, which cannot associate with a group.
 */
export const WithLabelledGroup: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span id="months-label" style={{ fontSize: 'var(--text-label)', fontWeight: 600, color: 'var(--muted-foreground)' }}>
        Months back
      </span>
      <Stepper {...args} aria-labelledby="months-label" format={(v) => `${v} mo`} />
    </div>
  ),
}
