import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toaster, toast, useToast } from '@connor-adams/designsystem'

const meta: Meta<typeof Toaster> = {
  title: 'Overlays/Toaster',
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          'Mount `<Toaster />` once, then call `toast()` from anywhere. The queue is a single module-level store, so there is no provider to mis-wire and no way for a caller to fire into a queue nothing renders.',
      },
    },
  },
  args: {
    position: 'bottom-right',
    max: 3,
    gap: 10,
    duration: 5000,
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
    },
    max: { control: { type: 'number', min: 0, max: 8 } },
    gap: { control: { type: 'number', min: 0, max: 32 } },
    duration: { control: { type: 'number', min: 0, step: 500 } },
    container: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Toaster>

const triggerStyle: React.CSSProperties = {
  padding: '6px 14px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  font: 'inherit',
  cursor: 'pointer',
}

function Row({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
}

export const Default: Story = {
  render: (args) => (
    <>
      <Row>
        <button type="button" style={triggerStyle} onClick={() => toast('Changes saved')}>
          Default
        </button>
        <button
          type="button"
          style={triggerStyle}
          onClick={() => toast.success('Statement imported', { description: '312 transactions added from Amex Cobalt.' })}
        >
          Success
        </button>
        <button
          type="button"
          style={triggerStyle}
          onClick={() => toast.error('Sync failed', { description: 'Couldn’t reach TD. We’ll retry shortly.' })}
        >
          Error (assertive)
        </button>
        <button
          type="button"
          style={triggerStyle}
          onClick={() => toast.warning('Budget exceeded', { description: 'Dining is $24 over for July.' })}
        >
          Warning
        </button>
        <button type="button" style={triggerStyle} onClick={() => toast.info('Sync in progress')}>
          Info
        </button>
        <button type="button" style={triggerStyle} onClick={() => toast.dismiss()}>
          Dismiss all
        </button>
      </Row>
      <Toaster {...args} />
    </>
  ),
}

export const Persistent: Story = {
  name: 'Persistent + action',
  render: (args) => (
    <>
      <Row>
        <button
          type="button"
          style={triggerStyle}
          onClick={() =>
            toast({
              variant: 'warning',
              title: 'Transaction deleted',
              description: 'Whole Foods Market · −$84.20',
              duration: Infinity,
              action: (
                <button type="button" style={triggerStyle} onClick={() => toast.success('Restored')}>
                  Undo
                </button>
              ),
            })
          }
        >
          Delete a transaction
        </button>
      </Row>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-body-sm)', maxWidth: 460 }}>
        <code>duration: Infinity</code> keeps the toast until dismissed. Timers also pause while the stack is
        hovered or holds focus, so tabbing to Undo will not make the toast vanish under you.
      </p>
      <Toaster {...args} />
    </>
  ),
}

export const Overflow: Story = {
  name: 'Overflow collapsing',
  args: { max: 2 },
  render: (args) => (
    <>
      <Row>
        <button
          type="button"
          style={triggerStyle}
          onClick={() => {
            toast.info('Fetching accounts')
            toast.info('Fetching balances')
            toast.info('Fetching transactions')
            toast.info('Categorising')
            toast.success('Sync complete')
          }}
        >
          Fire five at once
        </button>
      </Row>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-body-sm)', maxWidth: 460 }}>
        Only the newest <code>max</code> toasts render; the rest collapse into a <code>+N more</code> count.
      </p>
      <Toaster {...args} />
    </>
  ),
}

export const UpdateInPlace: Story = {
  name: 'Update in place by id',
  render: (args) => (
    <>
      <Row>
        <button
          type="button"
          style={triggerStyle}
          onClick={() => {
            toast({ id: 'import', variant: 'info', title: 'Importing…', duration: Infinity })
            window.setTimeout(
              () => toast({ id: 'import', variant: 'success', title: 'Imported', description: '312 transactions added.', duration: 4000 }),
              1200,
            )
          }}
        >
          Import a statement
        </button>
      </Row>
      <Toaster {...args} />
    </>
  ),
}

function QueueProbe(): React.JSX.Element {
  const { toasts, toast: fire, dismiss } = useToast()
  return (
    <>
      <Row>
        <button type="button" style={triggerStyle} onClick={() => fire.success('Fired from a component')}>
          Fire via useToast()
        </button>
        <button type="button" style={triggerStyle} onClick={() => dismiss()}>
          Dismiss all
        </button>
      </Row>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-body-sm)' }}>
        Queue length: <strong>{toasts.length}</strong> — the same store the module-level <code>toast()</code> writes to.
      </p>
    </>
  )
}

export const WithUseToast: Story = {
  name: 'useToast()',
  render: (args) => (
    <>
      <QueueProbe />
      <Toaster {...args} />
    </>
  ),
}
