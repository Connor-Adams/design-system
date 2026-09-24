import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { ImportDropzone } from './ImportDropzone'

const mk = (name: string, type = 'text/csv', bytes = 10): File =>
  new File([new Uint8Array(bytes)], name, { type })

const fileInput = (container: HTMLElement): HTMLInputElement => {
  const el = container.querySelector<HTMLInputElement>('input[type="file"]')
  if (!el) throw new Error('no file input rendered')
  return el
}

const pick = (input: HTMLInputElement, files: File[]): void => {
  Object.defineProperty(input, 'files', { value: files, writable: true, configurable: true })
  fireEvent.change(input)
}

const drop = (el: HTMLElement, files: File[]): void => {
  fireEvent.drop(el, { dataTransfer: { files } })
}

describe('ImportDropzone', () => {
  // ---- backwards-compatibility guarantees (pre-existing behaviour) ----------
  it('applies the ca-import-dropzone base class', () => {
    render(<ImportDropzone data-testid="dz" />)
    expect(screen.getByTestId('dz')).toHaveClass('ca-import-dropzone')
  })

  it('merges a consumer className with the base class', () => {
    render(<ImportDropzone className="w-full" data-testid="dz" />)
    const el = screen.getByTestId('dz')
    expect(el).toHaveClass('ca-import-dropzone')
    expect(el).toHaveClass('w-full')
  })

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ImportDropzone ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('exposes the dropzone as a button role', () => {
    render(<ImportDropzone />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders the hint text', () => {
    render(<ImportDropzone hint="My custom hint" />)
    expect(screen.getByText('My custom hint')).toBeInTheDocument()
  })

  it('keeps the default statement copy and default accept list', () => {
    const { container } = render(<ImportDropzone />)
    expect(screen.getByRole('button')).toHaveTextContent('Drop a statement, or browse')
    expect(fileInput(container)).toHaveAttribute('accept', '.csv,.ofx,.qfx')
  })

  it('still calls the singular onFile with the picked file', () => {
    const onFile = vi.fn()
    const { container } = render(<ImportDropzone onFile={onFile} />)
    pick(fileInput(container), [mk('statement.csv')])
    expect(onFile).toHaveBeenCalledTimes(1)
    expect(onFile.mock.calls[0]![0].name).toBe('statement.csv')
  })

  it('shows the file name and the replace affordance after a selection', () => {
    const { container } = render(<ImportDropzone />)
    pick(fileInput(container), [mk('statement.csv')])
    expect(screen.getByText('statement.csv')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('click to replace')
  })

  // ---- new: slotted copy ---------------------------------------------------
  it('slots the primary copy via label', () => {
    render(<ImportDropzone label="Drop a receipt" />)
    expect(screen.getByText('Drop a receipt')).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toHaveTextContent('Drop a statement')
  })

  it('slots the primary copy via children', () => {
    render(<ImportDropzone>Drop a photo</ImportDropzone>)
    expect(screen.getByText('Drop a photo')).toBeInTheDocument()
  })

  it('slots the replace affordance via replaceLabel', () => {
    const { container } = render(<ImportDropzone replaceLabel="tap to swap" />)
    pick(fileInput(container), [mk('a.csv')])
    expect(screen.getByRole('button')).toHaveTextContent('tap to swap')
  })

  // ---- new: multiple ------------------------------------------------------
  it('mirrors multiple onto the input and reports every file via onFiles', () => {
    const onFiles = vi.fn()
    const { container } = render(<ImportDropzone multiple onFiles={onFiles} />)
    expect(fileInput(container)).toHaveAttribute('multiple')
    pick(fileInput(container), [mk('a.csv'), mk('b.csv')])
    expect(onFiles.mock.calls[0]![0].map((f: File) => f.name)).toEqual(['a.csv', 'b.csv'])
    expect(screen.getByText('2 files selected')).toBeInTheDocument()
  })

  it('stays single-file by default', () => {
    const onFiles = vi.fn()
    const { container } = render(<ImportDropzone onFiles={onFiles} />)
    expect(fileInput(container)).not.toHaveAttribute('multiple')
    pick(fileInput(container), [mk('a.csv'), mk('b.csv')])
    expect(onFiles.mock.calls[0]![0]).toHaveLength(1)
  })

  // ---- new: drop-time validation + error channel ---------------------------
  it('accepts a dropped file that matches accept', () => {
    const onFile = vi.fn()
    render(<ImportDropzone onFile={onFile} data-testid="dz" />)
    drop(screen.getByTestId('dz'), [mk('statement.csv')])
    expect(onFile).toHaveBeenCalledTimes(1)
  })

  it('rejects a dropped file that does not match accept', () => {
    const onFile = vi.fn()
    const onError = vi.fn()
    render(<ImportDropzone onFile={onFile} onError={onError} data-testid="dz" />)
    drop(screen.getByTestId('dz'), [mk('scan.pdf', 'application/pdf')])
    expect(onFile).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0][0].code).toBe('accept')
  })

  it('enforces maxSize on both intake paths', () => {
    const onError = vi.fn()
    const { container } = render(
      <ImportDropzone maxSize={1_000} onError={onError} data-testid="dz" />,
    )
    drop(screen.getByTestId('dz'), [mk('big.csv', 'text/csv', 4_000)])
    pick(fileInput(container), [mk('big2.csv', 'text/csv', 4_000)])
    expect(onError).toHaveBeenCalledTimes(2)
    expect(onError.mock.calls[0]![0][0].code).toBe('max-size')
  })

  it('does not enforce a size limit when maxSize is omitted', () => {
    const onFile = vi.fn()
    const onError = vi.fn()
    render(<ImportDropzone onFile={onFile} onError={onError} data-testid="dz" />)
    drop(screen.getByTestId('dz'), [mk('huge.csv', 'text/csv', 50_000)])
    expect(onFile).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  it('announces the rejection in a polite live region', () => {
    render(<ImportDropzone data-testid="dz" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toBeEmptyDOMElement()
    drop(screen.getByTestId('dz'), [mk('scan.pdf', 'application/pdf')])
    expect(screen.getByRole('status')).toHaveTextContent('scan.pdf')
  })

  it('clears the announcement once a valid file arrives', () => {
    const { container } = render(<ImportDropzone data-testid="dz" />)
    drop(screen.getByTestId('dz'), [mk('scan.pdf', 'application/pdf')])
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement()
    pick(fileInput(container), [mk('ok.csv')])
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  // ---- new: drag state + controlled mode -----------------------------------
  it('reflects drag-over state with data-drag', () => {
    render(<ImportDropzone data-testid="dz" />)
    const el = screen.getByTestId('dz')
    fireEvent.dragOver(el)
    expect(el).toHaveAttribute('data-drag', 'true')
    fireEvent.dragLeave(el)
    expect(el).not.toHaveAttribute('data-drag')
  })

  it('renders the controlled selection and ignores internal state', () => {
    const { container, rerender } = render(<ImportDropzone files={[mk('from-parent.csv')]} />)
    expect(screen.getByText('from-parent.csv')).toBeInTheDocument()
    pick(fileInput(container), [mk('ignored.csv')])
    expect(screen.getByText('from-parent.csv')).toBeInTheDocument()
    expect(screen.queryByText('ignored.csv')).not.toBeInTheDocument()
    rerender(<ImportDropzone files={[]} />)
    expect(screen.getByRole('button')).toHaveTextContent('Drop a statement, or browse')
  })

  it('clears the selection when files is set back to null', () => {
    const { rerender } = render(<ImportDropzone files={[mk('a.csv')]} />)
    expect(screen.getByText('a.csv')).toBeInTheDocument()
    rerender(<ImportDropzone files={null} />)
    expect(screen.queryByText('a.csv')).not.toBeInTheDocument()
  })

  it('ignores drops and disables the trigger when disabled', () => {
    const onFile = vi.fn()
    render(<ImportDropzone disabled onFile={onFile} data-testid="dz" />)
    expect(screen.getByRole('button')).toBeDisabled()
    drop(screen.getByTestId('dz'), [mk('a.csv')])
    expect(onFile).not.toHaveBeenCalled()
    expect(screen.getByTestId('dz')).toHaveAttribute('data-disabled', 'true')
  })
})
