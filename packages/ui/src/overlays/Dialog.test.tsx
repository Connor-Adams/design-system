import * as React from 'react'
import { createRef } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Dialog } from './Dialog'
import { DropdownMenu } from './DropdownMenu'

const scrim = (): HTMLElement => document.querySelector<HTMLElement>('[data-slot="dialog-scrim"]')!
const content = (): HTMLElement => document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    render(<Dialog open={false}>Body</Dialog>)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders the dialog with the ca-dialog base class on the content card', () => {
    render(
      <Dialog open title="Confirm">
        Body
      </Dialog>,
    )
    expect(content()).not.toBeNull()
    expect(content()).toHaveClass('ca-dialog')
  })

  it('merges a consumer className onto the content card', () => {
    render(
      <Dialog open className="custom-x">
        Body
      </Dialog>,
    )
    expect(content()).toHaveClass('ca-dialog')
    expect(content()).toHaveClass('custom-x')
  })

  it('keeps static styling in CSS so a className can override it (no inline style attr)', () => {
    render(
      <Dialog open className="custom-x">
        Body
      </Dialog>,
    )
    // No static inline style competing with the class — the consumer className wins.
    expect(content()).not.toHaveAttribute('style')
    expect(scrim()).not.toHaveAttribute('style')
  })

  it('still honours a consumer style prop via the ...style spread', () => {
    render(
      <Dialog open style={{ zIndex: 99 }}>
        Body
      </Dialog>,
    )
    expect(content()).toHaveStyle({ zIndex: '99' })
  })

  it('reflects size as a data attribute', () => {
    render(
      <Dialog open size="lg">
        Body
      </Dialog>,
    )
    expect(content()).toHaveAttribute('data-size', 'lg')
  })

  it('defaults size to "default"', () => {
    render(<Dialog open>Body</Dialog>)
    expect(content()).toHaveAttribute('data-size', 'default')
  })

  it('forwards a ref to the content card element', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Dialog open ref={ref}>
        Body
      </Dialog>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'dialog-content')
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        Body
      </Dialog>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the scrim is clicked', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        Body
      </Dialog>,
    )
    fireEvent.click(scrim())
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when the content card is clicked', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        Body
      </Dialog>,
    )
    fireEvent.click(content())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders title, description, and footer', () => {
    render(
      <Dialog open title="The Title" description="The Desc" footer={<button>OK</button>}>
        Body
      </Dialog>,
    )
    expect(screen.getByText('The Title')).toBeInTheDocument()
    expect(screen.getByText('The Desc')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })

  // --- a11y wiring ----------------------------------------------------------

  it('puts role="dialog" aria-modal on the content card, not the scrim', () => {
    render(<Dialog open title="T">Body</Dialog>)
    const card = screen.getByRole('dialog')
    expect(card).toHaveAttribute('data-slot', 'dialog-content')
    expect(card).toHaveAttribute('aria-modal', 'true')
    expect(scrim()).not.toHaveAttribute('role')
    expect(scrim()).not.toHaveAttribute('aria-modal')
  })

  it('links the rendered title with aria-labelledby and the description with aria-describedby', () => {
    render(
      <Dialog open title="Delete transaction?" description="This cannot be undone.">
        Body
      </Dialog>,
    )
    const card = screen.getByRole('dialog')
    const labelId = card.getAttribute('aria-labelledby')
    const descId = card.getAttribute('aria-describedby')
    expect(document.getElementById(labelId!)).toHaveTextContent('Delete transaction?')
    expect(document.getElementById(descId!)).toHaveTextContent('This cannot be undone.')
  })

  it('omits aria-labelledby / aria-describedby when there is no title or description', () => {
    render(<Dialog open>Body</Dialog>)
    const card = screen.getByRole('dialog')
    expect(card).not.toHaveAttribute('aria-labelledby')
    expect(card).not.toHaveAttribute('aria-describedby')
  })

  it('accepts an explicit role (e.g. alertdialog) and arbitrary div attributes', () => {
    render(
      <Dialog open role="alertdialog" id="danger-zone" aria-label="Danger">
        Body
      </Dialog>,
    )
    expect(screen.getByRole('alertdialog')).toHaveAttribute('id', 'danger-zone')
  })

  // --- portal ---------------------------------------------------------------

  it('portals to document.body by default', () => {
    const { container } = render(<Dialog open>Body</Dialog>)
    expect(container.querySelector('[data-slot="dialog-scrim"]')).toBeNull()
    expect(scrim().parentElement).toBe(document.body)
  })

  it('renders in place when portal={false}', () => {
    const { container } = render(
      <Dialog open portal={false}>
        Body
      </Dialog>,
    )
    expect(container.querySelector('[data-slot="dialog-scrim"]')).not.toBeNull()
  })

  it('portals into an explicit container element', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(
      <Dialog open container={host}>
        Body
      </Dialog>,
    )
    expect(host.querySelector('[data-slot="dialog-scrim"]')).not.toBeNull()
    host.remove()
  })

  // --- close policy ---------------------------------------------------------

  it('does not close on Escape when closeOnEscape={false}', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} closeOnEscape={false}>
        Body
      </Dialog>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close on scrim click when closeOnOverlayClick={false}', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} closeOnOverlayClick={false}>
        Body
      </Dialog>,
    )
    fireEvent.click(scrim())
    expect(onClose).not.toHaveBeenCalled()
  })

  // --- dismiss stack --------------------------------------------------------

  it('gives Escape to the topmost dialog only', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <>
        <Dialog open onClose={outer}>
          Outer
        </Dialog>
        <Dialog open onClose={inner}>
          Inner
        </Dialog>
      </>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).not.toHaveBeenCalled()
  })

  it('a non-dismissible modal dialog swallows Escape instead of leaking it to the dialog below', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    render(
      <>
        <Dialog open onClose={outer}>
          Outer
        </Dialog>
        <Dialog open onClose={inner} closeOnEscape={false}>
          Inner
        </Dialog>
      </>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(inner).not.toHaveBeenCalled()
    expect(outer).not.toHaveBeenCalled()
  })

  it('lets an open DropdownMenu inside a Dialog take Escape without closing the Dialog', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} portal={false}>
        <DropdownMenu trigger={<button type="button">Options</button>} items={[{ label: 'Edit' }]} />
      </Dialog>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(onClose).not.toHaveBeenCalled()

    // A second Escape, now that the menu is gone, reaches the Dialog.
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // --- focus management -----------------------------------------------------

  it('moves focus into the dialog on open', async () => {
    render(
      <Dialog open title="T" footer={<button type="button">OK</button>}>
        Body
      </Dialog>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus())
  })

  it('focuses the content card itself when there is nothing focusable inside', async () => {
    render(<Dialog open>Body</Dialog>)
    await waitFor(() => expect(content()).toHaveFocus())
    expect(content()).toHaveAttribute('tabindex', '-1')
  })

  it('honours an initialFocus ref', async () => {
    function Host(): React.JSX.Element {
      const ref = React.useRef<HTMLButtonElement>(null)
      return (
        <Dialog
          open
          initialFocus={ref}
          footer={
            <>
              <button type="button">First</button>
              <button type="button" ref={ref}>
                Second
              </button>
            </>
          }
        >
          Body
        </Dialog>
      )
    }
    render(<Host />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus())
  })

  it('traps Tab inside the dialog, wrapping both ways', async () => {
    render(
      <Dialog
        open
        footer={
          <>
            <button type="button">One</button>
            <button type="button">Two</button>
          </>
        }
      >
        Body
      </Dialog>,
    )
    const one = screen.getByRole('button', { name: 'One' })
    const two = screen.getByRole('button', { name: 'Two' })
    await waitFor(() => expect(one).toHaveFocus())

    two.focus()
    fireEvent.keyDown(two, { key: 'Tab' })
    expect(one).toHaveFocus()

    fireEvent.keyDown(one, { key: 'Tab', shiftKey: true })
    expect(two).toHaveFocus()
  })

  it('restores focus to the previously focused element on close', async () => {
    function Host(): React.JSX.Element {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Dialog open={open} onClose={() => setOpen(false)} footer={<button type="button">OK</button>}>
            Body
          </Dialog>
        </>
      )
    }
    render(<Host />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    trigger.focus()
    fireEvent.click(trigger)
    await waitFor(() => expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus())

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  // --- scroll lock ----------------------------------------------------------

  it('locks body scroll while open and restores it on close', () => {
    const { unmount } = render(<Dialog open>Body</Dialog>)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('keeps the lock while a second dialog is still open (ref-counted)', () => {
    const first = render(<Dialog open>Outer</Dialog>)
    const second = render(<Dialog open>Inner</Dialog>)
    expect(document.body.style.overflow).toBe('hidden')
    second.unmount()
    expect(document.body.style.overflow).toBe('hidden')
    first.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock body scroll when lockScroll={false}', () => {
    const { unmount } = render(
      <Dialog open lockScroll={false}>
        Body
      </Dialog>,
    )
    expect(document.body.style.overflow).toBe('')
    unmount()
  })
})
