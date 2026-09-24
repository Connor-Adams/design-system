import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Badge,
  Button,
  ChartFrame,
  Skeleton,
  chartColor,
  chartColors,
  chartTheme,
} from '@connor-adams/designsystem'

/**
 * ChartFrame is chart-library agnostic — `packages/ui` takes no npm
 * dependencies, so there is no recharts in here. It supplies the card shell,
 * the header row and a plot box of a known height; `children` is whatever the
 * consuming app renders inside.
 *
 * Pair it with the palette export, which is the JS door onto the
 * `--chart-*` tokens:
 *
 * ```tsx
 * // Barrel (convenient), or '@connor-adams/designsystem/chart' when you only
 * // want the palette and not the component stylesheet side-effect.
 * import { chartTheme, chartColor } from '@connor-adams/designsystem/chart'
 *
 * <ChartFrame title="Spend by category" height="auto" rowCount={rows.length}>
 *   <ResponsiveContainer width="100%" height="100%">
 *     <BarChart data={rows} layout="vertical">
 *       <CartesianGrid {...chartTheme.grid} />
 *       <XAxis type="number" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
 *       <YAxis type="category" dataKey="name" tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
 *       <Tooltip
 *         contentStyle={chartTheme.tooltip.contentStyle}
 *         labelStyle={chartTheme.tooltip.labelStyle}
 *         itemStyle={chartTheme.tooltip.itemStyle}
 *         cursor={{ fill: chartTheme.tooltip.cursor }}
 *       />
 *       {series.map((s, i) => <Bar key={s} dataKey={s} fill={chartColor(i)} />)}
 *     </BarChart>
 *   </ResponsiveContainer>
 * </ChartFrame>
 * ```
 *
 * Every value in `chartTheme` is a `var(--token)` string, never a resolved
 * color. `var()` resolves in SVG presentation attributes (`fill`, `stroke`,
 * `font-size`) as well as in inline styles, so the chart tracks both the
 * light/dark theme and the `data-brand` scope with no JS theme detection, no
 * `getComputedStyle`, and no re-render when the theme flips.
 */
const meta: Meta<typeof ChartFrame> = {
  title: 'Data/ChartFrame',
  component: ChartFrame,
  args: {
    title: 'Spend by month',
    subtitle: 'Last 12 months, all accounts',
    height: 280,
    padding: 'default',
  },
  argTypes: {
    height: { control: 'text' },
    padding: { control: 'select', options: ['default', 'compact', 'none'] },
    rowCount: { control: 'number' },
  },
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof ChartFrame>

/** Stand-in for the consuming app's chart. Deliberately plain SVG — ChartFrame
 *  never depends on a charting library, and the bars read the palette export. */
function FakeBars({ count = 8 }: { count?: number }): React.JSX.Element {
  const values = Array.from({ length: count }, (_, i) => 30 + ((i * 37) % 65))
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${count * 40} 100`} preserveAspectRatio="none">
      {values.map((v, i) => (
        <rect
          key={i}
          x={i * 40 + 8}
          y={100 - v}
          width={24}
          height={v}
          // var() resolves in a presentation attribute — this is theme-reactive.
          fill={chartColor(i)}
          rx={2}
        />
      ))}
      <line x1="0" y1="99.5" x2={count * 40} y2="99.5" stroke={chartTheme.axis.stroke} />
    </svg>
  )
}

export const Default: Story = {
  render: (args) => (
    <ChartFrame {...args}>
      <FakeBars />
    </ChartFrame>
  ),
}

export const WithActions: Story = {
  args: {
    title: 'Cash flow',
    subtitle: 'Net of transfers',
    actions: (
      <>
        <Badge variant="secondary">Monthly</Badge>
        <Button variant="ghost" size="sm">
          Export
        </Button>
      </>
    ),
  },
  render: (args) => (
    <ChartFrame {...args}>
      <FakeBars count={12} />
    </ChartFrame>
  ),
}

/** `height="auto"` derives the plot height from `rowCount * rowHeight`, clamped
 *  to `minHeight`..`maxHeight` — the horizontal-bar case, where the chart must
 *  grow with the data instead of squashing rows. */
export const AutoHeightFromRowCount: Story = {
  args: {
    title: 'Spend by category',
    subtitle: '14 categories · height follows the row count',
    height: 'auto',
    rowCount: 14,
    rowHeight: 32,
    minHeight: 200,
    maxHeight: 560,
  },
  render: (args) => (
    <ChartFrame {...args}>
      <FakeBars count={14} />
    </ChartFrame>
  ),
}

export const Compact: Story = {
  args: { padding: 'compact', height: 180, subtitle: undefined },
  render: (args) => (
    <ChartFrame {...args}>
      <FakeBars count={6} />
    </ChartFrame>
  ),
}

/** `padding="none"` lets the plot bleed to the card edge; the header and footer
 *  keep their own inset. */
export const EdgeToEdge: Story = {
  args: { padding: 'none', footer: 'Source: imported ledger' },
  render: (args) => (
    <ChartFrame {...args}>
      <FakeBars count={10} />
    </ChartFrame>
  ),
}

export const Loading: Story = {
  args: { title: 'Spend by month', subtitle: 'Loading…' },
  render: (args) => (
    <ChartFrame {...args}>
      <Skeleton style={{ width: '100%', height: '100%' }} />
    </ChartFrame>
  ),
}

/** The palette export itself. Each swatch is a `var(--chart-*)` reference, so
 *  these follow the theme and brand switch without any JS. */
export const Palette: Story = {
  args: {
    title: 'Chart palette',
    subtitle: 'chartColors — every value is a var(--token) string',
    height: 200,
  },
  render: (args) => (
    <ChartFrame {...args} footer="Categorical ramp (bars, slices) · line ramp (strokes) · domain aliases">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        {[
          ['categorical', chartColors.categorical] as const,
          ['line', chartColors.line] as const,
          ['domain', Object.values(chartColors.domain)] as const,
        ].map(([label, ramp]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 84,
                fontSize: 'var(--text-body-sm)',
                color: 'var(--muted-foreground)',
              }}
            >
              {label}
            </span>
            {ramp.map((c) => (
              <span
                key={c}
                title={c}
                style={{
                  width: 40,
                  height: 32,
                  borderRadius: 'var(--radius-md)',
                  background: c,
                  border: '1px solid var(--border)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </ChartFrame>
  ),
}
