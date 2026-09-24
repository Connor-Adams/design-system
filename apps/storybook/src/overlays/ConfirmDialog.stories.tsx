import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, ConfirmDialog, useConfirm } from '@connor-adams/designsystem'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Overlays/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: true,
    title: 'Delete transaction?',
    description: 'This removes it from all reports. You can’t undo this.',
    // Stories render permanently open; locking the docs page scroll for each
    // one would trap the reader.
    lockScroll: false,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    children: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  args: {
    title: 'Save changes?',
    description: 'Your edits will be applied to this account immediately.',
    confirmLabel: 'Save',
  },
}

/** Destructive tone opens with Cancel focused, so a reflexive Enter is safe. */
export const Destructive: Story = {
  args: {
    tone: 'destructive',
    confirmLabel: 'Delete',
    children: <span>Whole Foods Market · −$84.20 · Groceries</span>,
  },
}

/** An `onConfirm` that returns a promise holds the dialog open while it runs. */
export const Pending: Story = {
  args: {
    tone: 'destructive',
    confirmLabel: 'Delete',
    pending: true,
  },
}

export const WithDetail: Story = {
  args: {
    title: 'Merge 3 categories?',
    description: 'Transactions move to “Groceries”. The other categories are removed.',
    confirmLabel: 'Merge',
    size: 'default',
    children: (
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted-foreground)' }}>
        <li>Food &amp; Drink — 214 transactions</li>
        <li>Supermarket — 88 transactions</li>
        <li>Market — 12 transactions</li>
      </ul>
    ),
  },
}

/**
 * `useConfirm()` gives the `if (await confirm(...))` shape that replaces
 * `window.confirm` one-for-one. No provider: render `dialog` once.
 */
export const ImperativeUseConfirm: StoryObj = {
  parameters: { controls: { disable: true } },
  render: function ImperativeStory() {
    const { confirm, dialog } = useConfirm({ tone: 'destructive', confirmLabel: 'Delete' })
    const [log, setLog] = React.useState<string>('—')
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button
          variant="destructive"
          onClick={async () => {
            const ok = await confirm({
              title: 'Delete sound?',
              description: 'The clip and its soundboard button are removed.',
            })
            setLog(ok ? 'confirmed' : 'cancelled')
          }}
        >
          Delete sound
        </Button>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-body-sm)' }}>Last answer: {log}</span>
        {dialog}
      </div>
    )
  },
}
