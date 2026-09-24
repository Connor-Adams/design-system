import * as React from 'react'
import { createRef } from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ConfirmDialog, useConfirm } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog open={false} title="Delete?" />)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('renders as an alertdialog with the ca-confirm-dialog base class', () => {
    render(<ConfirmDialog open title="Delete transaction?" />)
    const card = screen.getByRole('alertdialog')
    expect(card).toHaveClass('ca-confirm-dialog')
    expect(card).toHaveAttribute('data-slot', 'confirm-dialog')
  })

  it('merges a consumer className onto the card', () => {
    render(<ConfirmDialog open title="Delete?" className="custom-x" />)
    const card = screen.getByRole('alertdialog')
    expect(card).toHaveClass('ca-confirm-dialog')
    expect(card).toHaveClass('custom-x')
  })

  it('labels the dialog with the rendered title and describes it with the description', () => {
    render(<ConfirmDialog open title="Delete transaction?" description="This cannot be undone." />)
    const card = screen.getByRole('alertdialog')
    const labelId = card.getAttribute('aria-labelledby')
    const descId = card.getAttribute('aria-describedby')
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId!)).toHaveTextContent('Delete transaction?')
    expect(document.getElementById(descId!)).toHaveTextContent('This cannot be undone.')
  })

  it('renders default Confirm / Cancel labels and honours overrides', () => {
    const { unmount } = render(<ConfirmDialog open title="Delete?" />)
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    unmount()
    render(<ConfirmDialog open title="Delete?" confirmLabel="Delete it" cancelLabel="Keep it" />)
    expect(screen.getByRole('button', { name: 'Delete it' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument()
  })

  it('reflects tone as a data attribute and defaults to "default"', () => {
    const { unmount } = render(<ConfirmDialog open title="Delete?" />)
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-tone', 'default')
    unmount()
    render(<ConfirmDialog open title="Delete?" tone="destructive" />)
    expect(screen.getByRole('alertdialog')).toHaveAttribute('data-tone', 'destructive')
  })

  it('forwards a ref to the dialog card', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ConfirmDialog open ref={ref} title="Delete?" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'confirm-dialog')
  })

  it('calls onConfirm then onClose for a synchronous confirm', () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(<ConfirmDialog open title="Delete?" onConfirm={onConfirm} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel and onClose when Cancel is pressed', () => {
    const onCancel = vi.fn()
    const onClose = vi.fn()
    render(<ConfirmDialog open title="Delete?" onCancel={onCancel} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('focuses Confirm by default', async () => {
    render(<ConfirmDialog open title="Save changes?" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus())
  })

  it('focuses Cancel for the destructive tone so a reflexive Enter does not delete', async () => {
    render(<ConfirmDialog open tone="destructive" title="Delete account?" confirmLabel="Delete" />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus())
    expect(screen.getByRole('button', { name: 'Delete' })).not.toHaveFocus()
  })

  it('shows a pending state and stays open until an async onConfirm settles', async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((r) => { resolve = r }))
    const onClose = vi.fn()
    render(<ConfirmDialog open title="Delete?" onConfirm={onConfirm} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    const confirmBtn = screen.getByRole('button', { name: /Confirm/ })
    await waitFor(() => expect(confirmBtn).toHaveAttribute('data-pending', 'true'))
    expect(confirmBtn).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    // Still open — onClose has not fired yet.
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    await act(async () => { resolve() })
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it('does not close on Escape or overlay click while a confirm is pending', async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((r) => { resolve = r }))
    const onClose = vi.fn()
    render(<ConfirmDialog open title="Delete?" onConfirm={onConfirm} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Confirm/ })).toHaveAttribute('data-pending', 'true'))

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(document.querySelector('[data-slot="dialog-scrim"]')!)
    expect(onClose).not.toHaveBeenCalled()

    await act(async () => { resolve() })
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it('surfaces a rejected onConfirm through onError, clears pending, and stays open', async () => {
    const boom = new Error('server said no')
    const onConfirm = vi.fn(() => Promise.reject(boom))
    const onError = vi.fn()
    const onClose = vi.fn()
    render(<ConfirmDialog open title="Delete?" onConfirm={onConfirm} onError={onError} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(onError).toHaveBeenCalledWith(boom))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled())
  })

  it('re-throws to an error boundary when no onError is supplied, rather than swallowing', async () => {
    const boom = new Error('unhandled')
    const onConfirm = vi.fn(() => Promise.reject(boom))
    const onClose = vi.fn()
    const caught: unknown[] = []

    class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
      constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { failed: false }
      }
      static getDerivedStateFromError(): { failed: boolean } {
        return { failed: true }
      }
      override componentDidCatch(error: unknown): void {
        caught.push(error)
      }
      override render(): React.ReactNode {
        return this.state.failed ? <p>boundary caught it</p> : this.props.children
      }
    }

    // React logs the caught error; keep the suite output clean.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <Boundary>
        <ConfirmDialog open title="Delete?" onConfirm={onConfirm} onClose={onClose} />
      </Boundary>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(caught).toContain(boom))
    spy.mockRestore()

    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('boundary caught it')).toBeInTheDocument()
  })

  it('also surfaces a synchronous throw from onConfirm', () => {
    const boom = new Error('sync boom')
    const onError = vi.fn()
    const onClose = vi.fn()
    render(<ConfirmDialog open title="Delete?" onConfirm={() => { throw boom }} onError={onError} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onError).toHaveBeenCalledWith(boom)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders extra children in the dialog body', () => {
    render(
      <ConfirmDialog open title="Delete?">
        <span>Whole Foods · −$84.20</span>
      </ConfirmDialog>,
    )
    expect(screen.getByText('Whole Foods · −$84.20')).toBeInTheDocument()
  })
})

describe('useConfirm', () => {
  function Host({ onResult }: { onResult: (v: boolean) => void }): React.JSX.Element {
    const { confirm, dialog } = useConfirm({ tone: 'destructive' })
    return (
      <>
        <button type="button" onClick={async () => onResult(await confirm({ title: 'Delete it?' }))}>
          Ask
        </button>
        {dialog}
      </>
    )
  }

  it('resolves true when confirmed and false when cancelled — no provider needed', async () => {
    const onResult = vi.fn()
    render(<Host onResult={onResult} />)

    expect(screen.queryByRole('alertdialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())
    expect(screen.getByText('Delete it?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())

    fireEvent.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false))
  })

  it('resolves false when dismissed with Escape', async () => {
    const onResult = vi.fn()
    render(<Host onResult={onResult} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeInTheDocument())
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false))
  })

  it('carries hook-level defaults into each call', async () => {
    render(<Host onResult={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }))
    await waitFor(() => expect(screen.getByRole('alertdialog')).toHaveAttribute('data-tone', 'destructive'))
  })
})
