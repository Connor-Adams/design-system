import type { Meta, StoryObj } from '@storybook/react'
import { UploadButton } from '@connor-adams/designsystem'

const meta: Meta<typeof UploadButton> = {
  title: 'Forms/UploadButton',
  component: UploadButton,
  args: {
    children: 'Upload',
    accept: '.csv,.ofx,.qfx',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon'],
    },
  },
}
export default meta

type Story = StoryObj<typeof UploadButton>

export const Default: Story = {}

export const Primary: Story = { args: { variant: 'primary', children: 'Import statement' } }

export const Multiple: Story = {
  args: { multiple: true, accept: 'audio/*', children: 'Upload sounds' },
}

export const WithIcon: Story = {
  args: {
    children: 'Attach receipt',
    accept: 'image/*,.pdf',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
}

export const Loading: Story = { args: { loading: true, loadingLabel: 'Uploading…' } }

export const Disabled: Story = { args: { disabled: true } }

export const WithSizeLimit: Story = {
  args: { maxSize: 10 * 1e6, children: 'Upload (max 10MB)' },
}
