import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'

function renderTable(extra?: React.ComponentProps<typeof Table>) {
  return render(
    <Table {...extra}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Acme</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  )
}

describe('Table', () => {
  it('renders a table with content', () => {
    renderTable()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('applies the ca-table base class to the table element', () => {
    renderTable()
    expect(screen.getByRole('table')).toHaveClass('ca-table')
  })

  it('merges a consumer className with the base class', () => {
    renderTable({ className: 'text-sm' })
    const t = screen.getByRole('table')
    expect(t).toHaveClass('ca-table')
    expect(t).toHaveClass('text-sm')
  })

  // maxHeight's whole purpose is a scroll region, so the head must pin to its
  // top — and it needs an explicit background, or rows scroll through it.
  it('pins the head cell with an explicit background so rows cannot bleed through', () => {
    renderTable({ maxHeight: '120px' })
    const style = getComputedStyle(screen.getByRole('columnheader'))
    expect(style.position).toBe('sticky')
    expect(style.top).toBe('0px')
    expect(style.background).toBeTruthy()
  })

  it('keeps the bare container class when no containerClassName is given', () => {
    const { container } = renderTable()
    expect(container.querySelector('[data-slot="table-container"]')).toHaveClass('ca-table-container')
  })

  it('merges containerClassName onto the scroll container, not the table', () => {
    const { container } = renderTable({ containerClassName: 'h-96' })
    const wrap = container.querySelector('[data-slot="table-container"]')
    expect(wrap).toHaveClass('ca-table-container')
    expect(wrap).toHaveClass('h-96')
    expect(screen.getByRole('table')).not.toHaveClass('h-96')
  })

  it('forwards a ref to the underlying table element', () => {
    const ref = createRef<HTMLTableElement>()
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    expect(ref.current).toBeInstanceOf(HTMLTableElement)
  })

  it('forwards a ref on TableRow and reflects selected state', () => {
    const ref = createRef<HTMLTableRowElement>()
    const { container } = render(
      <table>
        <tbody>
          <TableRow ref={ref} selected>
            <td>x</td>
          </TableRow>
        </tbody>
      </table>,
    )
    expect(ref.current).toBeInstanceOf(HTMLTableRowElement)
    expect(container.querySelector('[data-slot="table-row"]')).toHaveAttribute('data-state', 'selected')
  })

  it('applies the ca-table-row base class', () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRow>
            <td>x</td>
          </TableRow>
        </tbody>
      </table>,
    )
    expect(container.querySelector('[data-slot="table-row"]')).toHaveClass('ca-table-row')
  })

  it('forwards refs on TableHead and TableCell', () => {
    const headRef = createRef<HTMLTableCellElement>()
    const cellRef = createRef<HTMLTableCellElement>()
    render(
      <table>
        <thead>
          <tr>
            <TableHead ref={headRef}>H</TableHead>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TableCell ref={cellRef}>C</TableCell>
          </tr>
        </tbody>
      </table>,
    )
    expect(headRef.current?.tagName).toBe('TH')
    expect(cellRef.current?.tagName).toBe('TD')
  })
})
