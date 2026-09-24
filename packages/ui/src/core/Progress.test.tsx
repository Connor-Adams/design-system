import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Progress } from './Progress'

describe('Progress', () => {
  it('renders a progressbar with the clamped value', () => {
    render(<Progress value={42} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
  })

  it('clamps values above 100', () => {
    render(<Progress value={150} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('omits aria-valuenow when indeterminate', () => {
    render(<Progress indeterminate />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  it('applies the ca-progress base class', () => {
    const { container } = render(<Progress value={10} />)
    expect(container.querySelector('[data-slot="progress"]')).toHaveClass('ca-progress')
  })

  it('merges a consumer className with the base class', () => {
    const { container } = render(<Progress value={10} className="w-1/2" />)
    const el = container.querySelector('[data-slot="progress"]')!
    expect(el).toHaveClass('ca-progress')
    expect(el).toHaveClass('w-1/2')
  })

  it('keeps the root free of a static inline style attribute', () => {
    const { container } = render(<Progress value={10} />)
    expect(container.querySelector('[data-slot="progress"]')!.getAttribute('style')).toBeNull()
  })

  it('reflects size as a data attribute', () => {
    const { container } = render(<Progress value={10} size="lg" />)
    expect(container.querySelector('[data-slot="progress"]')).toHaveAttribute('data-size', 'lg')
  })

  it('shows the percentage readout when requested', () => {
    render(<Progress value={75} showValue />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('forwards a ref to the root div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={10} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveAttribute('data-slot', 'progress')
  })
  it('renders valueText in the value slot instead of the generated percent', () => {
    render(<Progress value={25} valueText="1:23 / 4:56" />)
    expect(screen.getByText('1:23 / 4:56')).toBeInTheDocument()
    expect(screen.queryByText('25%')).not.toBeInTheDocument()
  })

  it('lets valueText win over showValue', () => {
    render(<Progress value={25} showValue valueText="3 of 7" />)
    expect(screen.getByText('3 of 7')).toBeInTheDocument()
    expect(screen.queryByText('25%')).not.toBeInTheDocument()
  })

  it('exposes a string valueText as aria-valuetext', () => {
    render(<Progress value={25} valueText="1:23 / 4:56" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '1:23 / 4:56')
  })

  it('names the progressbar from label via aria-labelledby', () => {
    render(<Progress value={40} label="Savings goal" />)
    expect(screen.getByRole('progressbar', { name: 'Savings goal' })).toBeInTheDocument()
  })

  it('lets an explicit aria-label name the progressbar', () => {
    render(<Progress value={40} aria-label="Import progress" />)
    expect(screen.getByRole('progressbar', { name: 'Import progress' })).toBeInTheDocument()
  })

  it('lets an explicit aria-label beat the rendered label', () => {
    render(<Progress value={40} label="Savings goal" aria-label="Override" />)
    expect(screen.getByRole('progressbar', { name: 'Override' })).toBeInTheDocument()
  })

  it('names the indeterminate progressbar too', () => {
    render(<Progress indeterminate label="Importing statement" />)
    expect(screen.getByRole('progressbar', { name: 'Importing statement' })).toBeInTheDocument()
  })

  it('keeps aria-hidden on the root so the whole widget can be hidden', () => {
    const { container } = render(<Progress value={40} aria-hidden />)
    expect(container.querySelector('[data-slot="progress"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('drives the track height from data-size, not an inline style', () => {
    const { container } = render(<Progress value={10} size="lg" />)
    const track = container.querySelector('[data-slot="progress-track"]')!
    expect(track.getAttribute('style')).toBeNull()
  })

  describe('segments', () => {
    it('renders one segment per entry and supersedes value', () => {
      const { container } = render(
        <Progress
          value={99}
          label="Pauses & resumes"
          segments={[
            { value: 30, tone: 'danger', label: 'Pauses' },
            { value: 20, tone: 'primary', label: 'Resumes' },
          ]}
        />,
      )
      expect(container.querySelectorAll('[data-slot="progress-segment"]')).toHaveLength(2)
      expect(container.querySelector('.ca-progress__fill')).toBeNull()
    })

    it('wraps segments in a group named by the label', () => {
      render(
        <Progress
          label="Pauses & resumes"
          segments={[{ value: 30, label: 'Pauses' }, { value: 20, label: 'Resumes' }]}
        />,
      )
      expect(screen.getByRole('group', { name: 'Pauses & resumes' })).toBeInTheDocument()
    })

    it('exposes each labelled segment as its own progressbar', () => {
      render(
        <Progress
          label="Pauses & resumes"
          segments={[{ value: 30, label: 'Pauses' }, { value: 20, label: 'Resumes' }]}
        />,
      )
      expect(screen.getByRole('progressbar', { name: 'Pauses' })).toHaveAttribute('aria-valuenow', '30')
      expect(screen.getByRole('progressbar', { name: 'Resumes' })).toHaveAttribute('aria-valuenow', '20')
    })

    it('collapses an all-unlabelled stack to one aggregate progressbar', () => {
      const { container } = render(<Progress label="Split" segments={[{ value: 30 }, { value: 20 }]} />)
      const bars = screen.getAllByRole('progressbar', { name: 'Split' })
      expect(bars).toHaveLength(1)
      expect(bars[0]).toHaveAttribute('aria-valuenow', '50')
      const segs = container.querySelectorAll('[data-slot="progress-segment"]')
      expect(segs).toHaveLength(2)
      expect(segs[0]).toHaveAttribute('aria-hidden', 'true')
    })

    it('keeps an unlabelled segment decorative in a mixed stack', () => {
      const { container } = render(
        <Progress label="Split" segments={[{ value: 30, label: 'Named' }, { value: 20 }]} />,
      )
      expect(screen.getAllByRole('progressbar')).toHaveLength(1)
      const segs = container.querySelectorAll('[data-slot="progress-segment"]')
      expect(segs[1]).toHaveAttribute('aria-hidden', 'true')
    })

    it('keeps widths as authored when the segments sum to 100 or less', () => {
      const { container } = render(<Progress segments={[{ value: 30 }, { value: 20 }]} />)
      const segs = container.querySelectorAll<HTMLElement>('[data-slot="progress-segment"]')
      expect(segs[0].style.width).toBe('30%')
      expect(segs[1].style.width).toBe('20%')
    })

    it('scales segments proportionally down to 100 when they overflow', () => {
      const { container } = render(<Progress segments={[{ value: 75 }, { value: 75 }]} />)
      const segs = container.querySelectorAll<HTMLElement>('[data-slot="progress-segment"]')
      expect(segs[0].style.width).toBe('50%')
      expect(segs[1].style.width).toBe('50%')
      expect(container.querySelector('[data-slot="progress-track"]')).toHaveAttribute('data-overflow', 'true')
    })

    it('reports the clamped total for showValue in segmented mode', () => {
      render(<Progress showValue segments={[{ value: 30 }, { value: 20 }]} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('ignores indeterminate when segments are supplied', () => {
      const { container } = render(<Progress indeterminate segments={[{ value: 40, label: 'a' }]} />)
      expect(container.querySelector('.ca-progress__sweep')).toBeNull()
    })

    it('falls back to the single bar for an empty segments array', () => {
      const { container } = render(<Progress value={40} segments={[]} />)
      expect(container.querySelector('.ca-progress__fill')).not.toBeNull()
    })
  })
})
