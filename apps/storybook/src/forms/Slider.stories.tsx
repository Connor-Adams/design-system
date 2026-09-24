import type { Meta, StoryObj } from '@storybook/react'
import { Label, Slider } from '@connor-adams/designsystem'

const meta: Meta<typeof Slider> = {
  title: 'Forms/Slider',
  component: Slider,
  args: {
    min: 0,
    max: 100,
    defaultValue: 40,
  },
}
export default meta

type Story = StoryObj<typeof Slider>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 70, showValue: true } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 30 } }

/**
 * `id` and the labelling `aria-*` attributes are routed to the inner
 * `input[type=range]`, so `<label htmlFor>` really associates — click the label
 * and the range input takes focus (and arrow keys move it).
 */
export const WithAssociatedLabel: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 420 }}>
      <Label htmlFor="threshold">Large-transaction alert</Label>
      <Slider {...args} id="threshold" name="threshold" aria-describedby="threshold-hint" showValue format={(v) => `$${v}`} />
      <span id="threshold-hint" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--muted-foreground)' }}>
        Alert when a single transaction exceeds this amount.
      </span>
    </div>
  ),
}
