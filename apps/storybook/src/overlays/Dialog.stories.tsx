import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, Dialog, DropdownMenu } from '@connor-adams/designsystem'

const meta: Meta<typeof Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  args: {
    open: true,
    title: 'Confirm action',
    description: 'This action cannot be undone. Are you sure you want to continue?',
    size: 'default',
    // Stories render permanently open; locking the docs page scroll for each
    // one would trap the reader.
    lockScroll: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
    closeOnEscape: { control: 'boolean' },
    closeOnOverlayClick: { control: 'boolean' },
    children: { control: false },
    footer: { control: false },
    initialFocus: { control: false },
    container: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Dialog>

export const Default: Story = {}

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Delete account',
    description: 'Your account and all associated data will be permanently removed.',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Import transactions',
    description: 'Upload a CSV file to import your transactions.',
    children: <p style={{ margin: 0 }}>Drop your file here or click to browse.</p>,
  },
}

export const WithFooter: Story = {
  args: {
    title: 'Save changes',
    description: 'Your unsaved changes will be lost if you navigate away.',
    footer: (
      <>
        <button type="button" style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
        <button type="button" style={{ padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'var(--primary-foreground)', cursor: 'pointer' }}>Confirm</button>
      </>
    ),
  },
}

/**
 * `closeOnEscape` / `closeOnOverlayClick` turn the two dismissal routes off —
 * for a dialog whose work must be finished or explicitly abandoned. Escape is
 * still swallowed rather than leaking to a layer underneath.
 */
export const NotDismissable: Story = {
  args: {
    title: 'Importing 1,412 transactions',
    description: 'Closing now would leave the import half-applied.',
    closeOnEscape: false,
    closeOnOverlayClick: false,
    footer: <Button variant="ghost" disabled>Please wait…</Button>,
  },
}

/**
 * Focus moves to `initialFocus` on open instead of the first focusable child —
 * this is how `ConfirmDialog` puts a destructive confirm's focus on Cancel.
 */
export const InitialFocus: Story = {
  render: function InitialFocusStory(args) {
    const second = React.useRef<HTMLButtonElement>(null)
    return (
      <Dialog
        {...args}
        initialFocus={second}
        title="Where does focus land?"
        description="The second button is focused on open, not the first."
        footer={
          <>
            <Button variant="ghost">First</Button>
            <Button ref={second} variant="primary">Second (focused)</Button>
          </>
        }
      />
    )
  },
}

/**
 * Escape goes through the shared dismiss stack: the open menu is the topmost
 * layer, so it closes alone and the Dialog underneath stays put. A second
 * Escape then closes the Dialog.
 */
export const NestedDismissOrder: Story = {
  render: function NestedStory(args) {
    const [open, setOpen] = React.useState(true)
    return (
      <>
        {!open && <Button onClick={() => setOpen(true)}>Reopen dialog</Button>}
        <Dialog
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          title="Edit category"
          description="Press Escape once to close the menu, twice to close the dialog."
          footer={<Button variant="ghost" onClick={() => setOpen(false)}>Done</Button>}
        >
          <DropdownMenu
            trigger={<Button variant="secondary" size="sm">Category ▾</Button>}
            items={[
              { label: 'Groceries', onSelect: () => {} },
              { label: 'Dining', onSelect: () => {} },
              { separator: true },
              { label: 'Remove', danger: true, onSelect: () => {} },
            ]}
          />
        </Dialog>
      </>
    )
  },
}

/**
 * `portal={false}` renders the dialog in place in the React tree, so the fixed
 * scrim is contained by a `transform`/`filter` ancestor instead of covering the
 * page. Used by the gallery to show a dialog inside a preview cell.
 */
export const RenderedInPlace: Story = {
  args: {
    portal: false,
    title: 'Contained to its ancestor',
    description: 'The scrim stops at the bounds of the transformed wrapper.',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', transform: 'translateZ(0)' }}>
        <Story />
      </div>
    ),
  ],
}
