import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { UploadButton } from './UploadButton'

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

describe('UploadButton', () => {
  it('applies the ca-upload-button base class on top of the Button base', () => {
    render(<UploadButton>Upload</UploadButton>)
    const btn = screen.getByRole('button', { name: 'Upload' })
    expect(btn).toHaveClass('ca-upload-button')
    expect(btn).toHaveClass('ca-btn')
  })

  it('merges a consumer className with the base class', () => {
    render(<UploadButton className="mt-4">Upload</UploadButton>)
    const btn = screen.getByRole('button', { name: 'Upload' })
    expect(btn).toHaveClass('ca-upload-button')
    expect(btn).toHaveClass('mt-4')
  })

  it('forwards variant and size through to the composed Button', () => {
    render(
      <UploadButton variant="primary" size="lg">
        Upload
      </UploadButton>,
    )
    const btn = screen.getByRole('button', { name: 'Upload' })
    expect(btn).toHaveAttribute('data-variant', 'primary')
    expect(btn).toHaveAttribute('data-size', 'lg')
  })

  it('carries data-slot="upload-button"', () => {
    render(<UploadButton>Upload</UploadButton>)
    expect(screen.getByRole('button', { name: 'Upload' })).toHaveAttribute('data-slot', 'upload-button')
  })

  it('forwards a ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<UploadButton ref={ref}>Upload</UploadButton>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toHaveTextContent('Upload')
  })

  it('renders a hidden file input mirroring accept and multiple', () => {
    const { container } = render(<UploadButton accept=".csv,.ofx" multiple />)
    const input = fileInput(container)
    expect(input).toHaveAttribute('accept', '.csv,.ofx')
    expect(input).toHaveAttribute('multiple')
  })

  it('opens the file picker when the button is clicked', () => {
    const { container } = render(<UploadButton>Upload</UploadButton>)
    const click = vi.fn()
    fileInput(container).click = click
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('reports the selected files through onFiles', () => {
    const onFiles = vi.fn()
    const { container } = render(<UploadButton multiple onFiles={onFiles} />)
    pick(fileInput(container), [mk('a.csv'), mk('b.csv')])
    expect(onFiles).toHaveBeenCalledTimes(1)
    expect(onFiles.mock.calls[0]![0].map((f: File) => f.name)).toEqual(['a.csv', 'b.csv'])
  })

  it('takes only the first file when multiple is not set', () => {
    const onFiles = vi.fn()
    const { container } = render(<UploadButton onFiles={onFiles} />)
    pick(fileInput(container), [mk('a.csv'), mk('b.csv')])
    expect(onFiles.mock.calls[0]![0]).toHaveLength(1)
  })

  it('resets the input value so re-picking the same file fires again', () => {
    const onFiles = vi.fn()
    const { container } = render(<UploadButton onFiles={onFiles} />)
    const input = fileInput(container)
    const assigned: string[] = []
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: () => '',
      set: (v: string) => assigned.push(v),
    })
    const same = mk('same.csv')
    pick(input, [same])
    pick(input, [same])
    expect(assigned).toContain('')
    expect(onFiles).toHaveBeenCalledTimes(2)
  })

  it('routes rejected files to onError and never to onFiles', () => {
    const onFiles = vi.fn()
    const onError = vi.fn()
    const { container } = render(<UploadButton accept=".csv" onFiles={onFiles} onError={onError} />)
    pick(fileInput(container), [mk('nope.pdf', 'application/pdf')])
    expect(onFiles).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]![0][0].code).toBe('accept')
  })

  it('enforces maxSize', () => {
    const onError = vi.fn()
    const { container } = render(<UploadButton maxSize={1_000} onError={onError} />)
    pick(fileInput(container), [mk('big.csv', 'text/csv', 4_000)])
    expect(onError.mock.calls[0]![0][0].code).toBe('max-size')
  })

  it('marks itself busy and disabled while loading', () => {
    render(<UploadButton loading>Upload</UploadButton>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
  })

  it('is not busy when idle', () => {
    render(<UploadButton>Upload</UploadButton>)
    expect(screen.getByRole('button', { name: 'Upload' })).not.toHaveAttribute('aria-busy')
  })

  it('shows loadingLabel in place of the children while loading', () => {
    render(
      <UploadButton loading loadingLabel="Uploading…">
        Upload
      </UploadButton>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('Uploading…')
  })

  it('does not open the picker when disabled', () => {
    const { container } = render(<UploadButton disabled>Upload</UploadButton>)
    const click = vi.fn()
    fileInput(container).click = click
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    expect(click).not.toHaveBeenCalled()
  })

  it('renders a leading icon node', () => {
    render(<UploadButton icon={<span data-testid="ico" />}>Upload</UploadButton>)
    expect(screen.getByTestId('ico')).toBeInTheDocument()
  })
})
