import * as React from 'react'
import './ChartFrame.css'

/**
 * Cashflow ChartFrame. The card shell every chart sits in: the same raised
 * surface as `Card`, an optional title / subtitle / actions header row, a
 * responsive plot box of a known height, and an optional footer for a legend
 * or source note.
 *
 * **Chart-library agnostic on purpose.** `packages/ui` takes no npm
 * dependencies, so there is no recharts (or anything else) in here. ChartFrame
 * supplies the frame, the header and the sizing box; `children` is whatever
 * the consuming app renders inside — a `<ResponsiveContainer>`, a raw `<svg>`,
 * a `<Sparkline>`, or a loading `<Skeleton>`.
 *
 * The shell is its own, not composed from `Card`, but only because `Card` on
 * this branch is a fixed `20px` of padding with a header that is a vertical
 * grid and has no actions slot — a chart header with a right-aligned control
 * row and a selectable padding scale cannot be expressed through it. A
 * `padding` / `variant` / header-`actions` API is landing on `Card` in
 * parallel; once it does, `.ca-chart-frame` and `.ca-chart-frame__header`
 * should be swapped for `<Card>` + `<CardHeader actions={…}>`. That swap is
 * kept cheap on purpose: the shell reads exactly the tokens `.ca-card` reads
 * (`--card`, `--border`, `--radius-lg`, `--shadow`) so the surfaces are already
 * pixel-identical, and the part that is genuinely ChartFrame's own — the plot
 * sizing box — is a separate element that the swap does not touch.
 *
 * Height has two modes:
 *   - `height={280}` (default) — a fixed pixel plot height.
 *   - `height="auto"` — derived from `rowCount * rowHeight`, then clamped to
 *     `minHeight`..`maxHeight`. This is the horizontal-bar case, where the
 *     chart must grow with the data instead of squashing rows.
 *
 * Layout lives in `ChartFrame.css`, keyed off `data-padding`; only the
 * resolved height crosses into the DOM, as the `--ca-chart-frame-height`
 * custom property.
 */

export type ChartFrameHeight = number | 'auto'
export type ChartFramePadding = 'default' | 'compact' | 'none'

/** Inputs to the height calculation. Exported so `resolveChartHeight` is usable alone. */
export interface ChartHeightSpec {
  height?: ChartFrameHeight
  rowCount?: number
  rowHeight?: number
  minHeight?: number
  maxHeight?: number
}

/**
 * Card shell + optional header + a fixed-or-row-driven plot box for a chart of
 * any library. `title` is a ReactNode header (not the HTML `title` tooltip).
 * Use `height="auto"` with `rowCount` for charts that grow with their data.
 */
export interface ChartFrameProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    ChartHeightSpec {
  /** Header heading. Omit (with subtitle and actions) to drop the header row. */
  title?: React.ReactNode
  /** Secondary line under the title. */
  subtitle?: React.ReactNode
  /** Right-aligned header controls — a period selector, a menu, a legend toggle. */
  actions?: React.ReactNode
  /** Legend or source note rendered under the plot. */
  footer?: React.ReactNode
  /** Plot height in px, or `'auto'` to derive it from `rowCount`. Default 280. */
  height?: ChartFrameHeight
  /** Rows in the chart. Drives the height when `height="auto"`. Default 0. */
  rowCount?: number
  /** Px per row in `'auto'` mode. Default 32. */
  rowHeight?: number
  /** Floor for the resolved height. Default 200. */
  minHeight?: number
  /** Ceiling for the resolved height. Default 560. */
  maxHeight?: number
  /** Shell padding scale. `'none'` lets the plot bleed to the card edge. */
  padding?: ChartFramePadding
}

const DEFAULT_HEIGHT = 280
const DEFAULT_ROW_HEIGHT = 32
const DEFAULT_MIN_HEIGHT = 200
const DEFAULT_MAX_HEIGHT = 560

/**
 * Resolves a {@link ChartHeightSpec} to a pixel height. `'auto'` multiplies
 * `rowCount` by `rowHeight`; every result is clamped to `minHeight`..`maxHeight`,
 * floored to a whole pixel, and never negative.
 */
export function resolveChartHeight({
  height = DEFAULT_HEIGHT,
  rowCount = 0,
  rowHeight = DEFAULT_ROW_HEIGHT,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: ChartHeightSpec): number {
  const raw = height === 'auto' ? rowCount * rowHeight : height
  const lo = Math.max(0, minHeight)
  const hi = Math.max(lo, maxHeight)
  return Math.floor(Math.min(hi, Math.max(lo, Number.isFinite(raw) ? raw : lo)))
}

export const ChartFrame = React.forwardRef<HTMLDivElement, ChartFrameProps>(function ChartFrame(
  {
    title,
    subtitle,
    actions,
    footer,
    height = DEFAULT_HEIGHT,
    rowCount = 0,
    rowHeight = DEFAULT_ROW_HEIGHT,
    minHeight = DEFAULT_MIN_HEIGHT,
    maxHeight = DEFAULT_MAX_HEIGHT,
    padding = 'default',
    className,
    children,
    ...props
  },
  ref,
): React.JSX.Element {
  const resolved = resolveChartHeight({ height, rowCount, rowHeight, minHeight, maxHeight })
  const hasHeader = title != null || subtitle != null || actions != null

  return (
    <div
      ref={ref}
      data-slot="chart-frame"
      data-padding={padding}
      className={className ? `ca-chart-frame ${className}` : 'ca-chart-frame'}
      {...props}
    >
      {hasHeader && (
        <div data-slot="chart-frame-header" className="ca-chart-frame__header">
          {(title != null || subtitle != null) && (
            <div className="ca-chart-frame__heading">
              {title != null && (
                <div data-slot="chart-frame-title" className="ca-chart-frame__title">
                  {title}
                </div>
              )}
              {subtitle != null && (
                <div data-slot="chart-frame-subtitle" className="ca-chart-frame__subtitle">
                  {subtitle}
                </div>
              )}
            </div>
          )}
          {actions != null && (
            <div data-slot="chart-frame-actions" className="ca-chart-frame__actions">
              {actions}
            </div>
          )}
        </div>
      )}
      <div
        data-slot="chart-frame-plot"
        data-height-mode={height === 'auto' ? 'auto' : 'fixed'}
        data-height={resolved}
        className="ca-chart-frame__plot"
        style={{ ['--ca-chart-frame-height' as string]: `${resolved}px` } as React.CSSProperties}
      >
        {children}
      </div>
      {footer != null && (
        <div data-slot="chart-frame-footer" className="ca-chart-frame__footer">
          {footer}
        </div>
      )}
    </div>
  )
})
