import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  DataTable,
  EmptyState,
  Badge,
  LetterAvatar,
  type DataTableColumn,
  type DataTableSort,
} from '@connor-adams/designsystem'

interface Txn {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
}

const txns: Txn[] = [
  { id: 't1', date: 'Jun 15', merchant: 'Whole Foods Market', category: 'Groceries', amount: -94.32 },
  { id: 't2', date: 'Jun 14', merchant: 'Acme Corp Payroll', category: 'Income', amount: 4250 },
  { id: 't3', date: 'Jun 13', merchant: 'Netflix Subscription', category: 'Subscriptions', amount: -18.99 },
  { id: 't4', date: 'Jun 12', merchant: 'Shell', category: 'Transport', amount: -62.4 },
  { id: 't5', date: 'Jun 11', merchant: 'Apple', category: 'Shopping', amount: -1299 },
]

const money = (n: number): string =>
  `${n < 0 ? '−' : '+'}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const columns: DataTableColumn<Txn>[] = [
  { key: 'date', header: 'Date', width: 90, sortable: true },
  {
    key: 'merchant',
    header: 'Merchant',
    sortable: true,
    render: (t) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <LetterAvatar text={t.merchant} size="sm" />
        {t.merchant}
      </span>
    ),
  },
  { key: 'category', header: 'Category', render: (t) => <Badge variant="secondary">{t.category}</Badge> },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    width: 130,
    sortable: true,
    render: (t) => (
      <span style={{ fontWeight: 600, color: t.amount < 0 ? 'var(--negative)' : 'var(--positive)' }}>
        {money(t.amount)}
      </span>
    ),
  },
]

const meta: Meta<typeof DataTable> = {
  title: 'Data/DataTable',
  component: DataTable,
}
export default meta

type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  render: () => <DataTable columns={columns} rows={txns} getRowKey={(t: Txn) => t.id} />,
}

/**
 * Sorting is controlled — DataTable emits the next state and the correct
 * `aria-sort`; the consumer owns the ordering.
 */
function SortableDemo(): React.JSX.Element {
  const [sort, setSort] = React.useState<DataTableSort | null>({ key: 'amount', direction: 'desc' })
  const rows = React.useMemo(() => {
    if (!sort) return txns
    const dir = sort.direction === 'asc' ? 1 : -1
    return [...txns].sort((a, b) => {
      const x = a[sort.key as keyof Txn]
      const y = b[sort.key as keyof Txn]
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir
      return String(x).localeCompare(String(y)) * dir
    })
  }, [sort])
  return <DataTable columns={columns} rows={rows} getRowKey={(t: Txn) => t.id} sort={sort} onSortChange={setSort} />
}

export const Sortable: Story = { render: () => <SortableDemo /> }

export const Loading: Story = {
  render: () => <DataTable columns={columns} rows={[]} getRowKey={(t: Txn) => t.id} loading loadingRows={5} />,
}

export const Empty: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={[]}
      getRowKey={(t: Txn) => t.id}
      empty={<EmptyState title="No transactions" description="Import a statement to get started." />}
    />
  ),
}

/** `maxHeight` makes a scroll region; the head pins to its top. */
export const StickyHeaderScroll: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={[...txns, ...txns.map((t) => ({ ...t, id: `${t.id}-b` })), ...txns.map((t) => ({ ...t, id: `${t.id}-c` }))]}
      getRowKey={(t: Txn) => t.id}
      maxHeight="240px"
    />
  ),
}
