import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StatCard, StatGrid } from '@connor-adams/designsystem'

const TILES = [
  { label: 'Net spend', value: '$4,210', hint: 'This month', delta: '-8%', metricKind: 'spend' as const },
  { label: 'Income', value: '$9,800', hint: 'vs last month', delta: '+3%', metricKind: 'gain' as const },
  { label: 'Net savings', value: '$2,180', hint: 'After expenses', delta: '+12%', metricKind: 'gain' as const },
  { label: 'Transactions', value: '312', hint: 'In current filters', delta: '+24', metricKind: 'neutral' as const },
  { label: 'Accounts', value: '7', hint: 'Linked', delta: '+1', metricKind: 'neutral' as const },
  { label: 'Categories', value: '24', hint: 'In use', delta: '0', metricKind: 'neutral' as const },
  { label: 'Flagged', value: '1', hint: 'Needs review', delta: '-2', metricKind: 'neutral' as const },
]

function tiles(n: number, bare = false): React.JSX.Element[] {
  return TILES.slice(0, n).map((t) => <StatCard key={t.label} bare={bare} {...t} />)
}

const meta: Meta<typeof StatGrid> = {
  title: 'Data/StatGrid',
  component: StatGrid,
  args: {
    columns: 'auto',
    minItemWidth: 180,
    gap: 'md',
    divided: false,
  },
  argTypes: {
    columns: { control: 'text' },
    gap: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    minItemWidth: { control: 'number' },
    divided: { control: 'boolean' },
  },
  render: (args) => <StatGrid {...args}>{tiles(4, Boolean(args.divided))}</StatGrid>,
}
export default meta

type Story = StoryObj<typeof StatGrid>

/** Auto-fit: tracks at least `minItemWidth` wide, wrapping on their own. */
export const Default: Story = {}

/** A pinned track count — the classic four-across KPI row. */
export const FixedColumns: Story = {
  args: { columns: 4 },
}

/** Wider minimum track, so fewer tiles fit per row before wrapping. */
export const WideTracks: Story = {
  args: { minItemWidth: 280 },
}

/** Hairline separators instead of gutters — the dense KPI strip. */
export const Divided: Story = {
  args: { divided: true, columns: 4 },
}

/** Divided + auto-fit: the rules land correctly on whatever column count fits. */
export const DividedAutoFit: Story = {
  args: { divided: true, minItemWidth: 160 },
}

/**
 * Divided with a PARTIAL last row — seven cells across three columns.
 *
 * This is the case that regresses if the cell dividers are ever drawn on the
 * left/top edges instead of right/bottom. The rule above the final row must
 * span the full width (it belongs to the full row above it), and the lone
 * trailing cell must be closed off on its right, so the empty remainder reads
 * as an empty cell rather than a rule that stops in mid-air. Every other
 * divided story uses a cell count that divides evenly by its column count,
 * which is exactly why this went unnoticed — keep this one uneven.
 */
export const DividedPartialRow: Story = {
  args: { divided: true, columns: 3 },
  render: (args) => <StatGrid {...args}>{tiles(7, true)}</StatGrid>,
}

/** Any children, not only StatCard — the grid never introspects them. */
export const ArbitraryChildren: Story = {
  render: (args) => (
    <StatGrid {...args} columns={3}>
      {['Uptime 99.98%', 'p99 142 ms', '0 errors'].map((t) => (
        <div
          key={t}
          style={{
            padding: 'var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--muted-foreground)',
          }}
        >
          {t}
        </div>
      ))}
    </StatGrid>
  ),
}
