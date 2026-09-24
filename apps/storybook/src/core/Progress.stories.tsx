import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from '@connor-adams/designsystem'

const meta: Meta<typeof Progress> = {
  title: 'Core/Progress',
  component: Progress,
  args: {
    value: 60,
    tone: 'primary',
    size: 'default',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Progress>

export const Default: Story = {}
export const WithLabel: Story = { args: { label: 'Budget used', showValue: true, value: 74 } }
export const Success: Story = { args: { tone: 'success', value: 100 } }
export const Warning: Story = { args: { tone: 'warning', value: 85, label: 'Dining', showValue: true } }
export const Indeterminate: Story = { args: { indeterminate: true } }

/** `valueText` replaces the generated percent with any node — elapsed time here. */
export const ElapsedTime: Story = {
  args: { value: 28, label: 'Now playing', valueText: '1:23 / 4:56' },
}

/** Counts and byte totals read better than a percentage. */
export const CountReadout: Story = {
  args: { value: 43, tone: 'success', label: 'Statements imported', valueText: '3 of 7' },
}

export const ByteReadout: Story = {
  args: { value: 41, size: 'lg', label: 'Upload', valueText: '820 MB / 2 GB' },
}

/** Stacked bands. Each labelled segment is its own progressbar inside a labelled group. */
export const Segmented: Story = {
  args: {
    label: 'Pauses & resumes',
    valueText: '12 paused / 9 resumed',
    segments: [
      { value: 57, tone: 'danger', label: 'Pauses' },
      { value: 43, tone: 'primary', label: 'Resumes' },
    ],
  },
}

/** A partial stack: bands keep their authored widths, so the track stays 50% full. */
export const SegmentedPartial: Story = {
  args: {
    size: 'lg',
    label: 'Disk by kind',
    valueText: '50% of 2 GB',
    segments: [
      { value: 30, tone: 'primary', label: 'Media' },
      { value: 20, tone: 'warning', label: 'Statements' },
    ],
  },
}

/** Segments summing past 100 are scaled down proportionally — nothing is clipped. */
export const SegmentedOverflow: Story = {
  args: {
    label: 'Over-allocated',
    segments: [
      { value: 75, tone: 'danger', label: 'Committed' },
      { value: 75, tone: 'warning', label: 'Pending' },
    ],
  },
}
