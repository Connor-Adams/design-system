import { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable, type DataTableColumn, type DataTableSort } from './DataTable'

interface Txn {
  id: string
  merchant: string
  amount: number
}

const rows: Txn[] = [
  { id: 't1', merchant: 'Whole Foods', amount: -84.2 },
  { id: 't2', merchant: 'Acme Payroll', amount: 4900 },
]

const columns: DataTableColumn<Txn>[] = [
  { key: 'merchant', header: 'Merchant', sortable: true },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    width: 120,
    sortable: true,
    render: (row) => `$${row.amount.toFixed(2)}`,
  },
]

function renderTable(extra: Partial<React.ComponentProps<typeof DataTable<Txn>>> = {}) {
  return render(<DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} {...extra} />)
}

describe('DataTable', () => {
  it('renders headers and cells from the column config', () => {
    renderTable()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Merchant')).toBeInTheDocument()
    expect(screen.getByText('Whole Foods')).toBeInTheDocument()
    expect(screen.getByText('$4900.00')).toBeInTheDocument()
  })

  it('reads a cell value off the row when no render is supplied', () => {
    renderTable()
    expect(screen.getByText('Acme Payroll')).toBeInTheDocument()
  })

  it('applies the ca-data-table base class alongside ca-table', () => {
    renderTable()
    const table = screen.getByRole('table')
    expect(table).toHaveClass('ca-data-table')
    expect(table).toHaveClass('ca-table')
  })

  it('merges a consumer className with the base class', () => {
    renderTable({ className: 'custom' })
    const table = screen.getByRole('table')
    expect(table).toHaveClass('ca-data-table')
    expect(table).toHaveClass('custom')
  })

  it('forwards a ref to the underlying table element', () => {
    const ref = createRef<HTMLTableElement>()
    renderTable({ ref })
    expect(ref.current).toBeInstanceOf(HTMLTableElement)
  })

  it('sets data-slot and spreads extra props onto the table', () => {
    renderTable({ 'aria-label': 'Transactions' } as Partial<React.ComponentProps<typeof DataTable<Txn>>>)
    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('data-slot', 'data-table')
    expect(table).toHaveAttribute('aria-label', 'Transactions')
  })

  it('reflects alignment and width on the column cells', () => {
    const { container } = renderTable()
    const amountHead = screen.getByRole('columnheader', { name: /amount/i })
    expect(amountHead).toHaveAttribute('data-align', 'right')
    expect(amountHead).toHaveStyle({ width: '120px' })
    const cells = container.querySelectorAll('td[data-align="right"]')
    expect(cells).toHaveLength(2)
  })

  it('emits aria-sort="none" on sortable columns and the direction on the sorted one', () => {
    renderTable({ sort: { key: 'amount', direction: 'desc' } })
    expect(screen.getByRole('columnheader', { name: /merchant/i })).toHaveAttribute('aria-sort', 'none')
    expect(screen.getByRole('columnheader', { name: /amount/i })).toHaveAttribute('aria-sort', 'descending')
  })

  it('omits aria-sort entirely when no column is sortable', () => {
    renderTable({ columns: [{ key: 'merchant', header: 'Merchant' }] })
    expect(screen.getByRole('columnheader', { name: /merchant/i })).not.toHaveAttribute('aria-sort')
  })

  it('renders a keyboard-operable button as the sort control, not a click-only th', () => {
    renderTable()
    const btn = screen.getByRole('button', { name: /merchant/i })
    expect(btn).toHaveAttribute('type', 'button')
    btn.focus()
    expect(btn).toHaveFocus()
  })

  it('cycles sort asc -> desc -> cleared through onSortChange', () => {
    const onSortChange = vi.fn<(s: DataTableSort | null) => void>()
    const { rerender } = render(
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} onSortChange={onSortChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /merchant/i }))
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'merchant', direction: 'asc' })

    rerender(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        sort={{ key: 'merchant', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /merchant/i }))
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'merchant', direction: 'desc' })

    rerender(
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        sort={{ key: 'merchant', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /merchant/i }))
    expect(onSortChange).toHaveBeenLastCalledWith(null)
  })

  it('does not reorder rows itself — sorting is controlled by the consumer', () => {
    const { container } = renderTable({ sort: { key: 'merchant', direction: 'desc' } })
    const firstCell = container.querySelectorAll('tbody td')[0]
    expect(firstCell).toHaveTextContent('Whole Foods')
  })

  it('renders the empty slot when there are no rows', () => {
    renderTable({ rows: [], empty: <span>Nothing here</span> })
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.queryByText('Whole Foods')).not.toBeInTheDocument()
  })

  it('spans the empty cell across every column', () => {
    const { container } = renderTable({ rows: [] })
    const cell = container.querySelector('[data-slot="data-table-empty"]')
    expect(cell).toHaveAttribute('colspan', '2')
  })

  it('renders skeleton rows while loading and ignores rows/empty', () => {
    const { container } = renderTable({ loading: true, loadingRows: 3 })
    expect(container.querySelectorAll('[data-slot="data-table-loading-row"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6)
    expect(screen.queryByText('Whole Foods')).not.toBeInTheDocument()
  })

  it('marks the body busy while loading', () => {
    const { container } = renderTable({ loading: true })
    expect(container.querySelector('[data-slot="table-body"]')).toHaveAttribute('aria-busy', 'true')
  })

  it('keys rows by getRowKey rather than array index', () => {
    const getRowKey = vi.fn((r: Txn) => r.id)
    renderTable({ getRowKey })
    expect(getRowKey).toHaveBeenCalledTimes(2)
    expect(getRowKey).toHaveBeenCalledWith(rows[0], 0)
  })

  it('passes containerClassName through to the scroll container', () => {
    const { container } = renderTable({ containerClassName: 'tall' })
    const wrap = container.querySelector('[data-slot="table-container"]')
    expect(wrap).toHaveClass('ca-table-container')
    expect(wrap).toHaveClass('tall')
  })
})
