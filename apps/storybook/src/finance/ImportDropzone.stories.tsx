import type { Meta, StoryObj } from '@storybook/react'
import { ImportDropzone } from '@connor-adams/designsystem'

const meta: Meta<typeof ImportDropzone> = {
  title: 'Finance/ImportDropzone',
  component: ImportDropzone,
  args: {
    accept: '.csv,.ofx,.qfx',
    hint: 'CSV, OFX or QFX · up to 10MB',
  },
}
export default meta

type Story = StoryObj<typeof ImportDropzone>

export const Default: Story = {}

export const CustomHint: Story = {
  args: {
    hint: 'Export from your bank and drop it here',
  },
}

/** The primary copy is a slot, so the dropzone is not statement-only. */
export const SlottedCopy: Story = {
  args: {
    label: 'Drop a receipt, or browse',
    hint: 'PNG, JPG or PDF',
    accept: 'image/*,.pdf',
    replaceLabel: 'click to change',
  },
}

export const Multiple: Story = {
  args: {
    multiple: true,
    label: 'Drop statements, or browse',
    hint: 'One file per account is fine',
  },
}

/** `maxSize` is enforced on drop as well as on browse; rejections hit `onError`. */
export const WithSizeLimit: Story = {
  args: {
    maxSize: 10 * 1e6,
    hint: 'CSV, OFX or QFX · up to 10MB, enforced',
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
