import * as React from 'react'
import './StatGrid.css'

/**
 * Cashflow StatGrid. The container for a KPI row — the layout every dashboard
 * was hand-rolling around `StatCard`.
 *
 * `columns="auto"` (the default) is an intrinsically responsive auto-fit grid:
 * tracks are at least `minItemWidth` wide and wrap on their own, no media
 * queries. Pass a number for a fixed track count instead. `divided` swaps the
 * gutters for hairline separators — the dense KPI-strip look.
 *
 * It is a plain container: any children are accepted and rendered untouched
 * (no cloning, no introspection). The whole grid lives in `StatGrid.css`,
 * driven by `data-columns` / `data-gap` / `data-divided` and the
 * `--ca-stat-grid-*` custom properties this component sets inline.
 */

/** Gutter step, mapped to the `--space-*` ladder in `StatGrid.css`. */
export type StatGridGap = 'none' | 'sm' | 'md' | 'lg'

/**
 * KPI row container. `columns="auto"` auto-fits tracks of at least
 * `minItemWidth`; a number pins the track count. `gap` steps the gutter on the
 * spacing ladder; `divided` replaces gutters with hairline separators and
 * flattens any `StatCard` shells inside so the rules don't double up.
 */
export interface StatGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Track count, or `'auto'` for a responsive auto-fit grid. Default `'auto'`. */
  columns?: number | 'auto'
  /** Minimum auto-fit track width — a number is px. Only used when `columns="auto"`. Default `180`. */
  minItemWidth?: number | string
  /** Gutter step. Ignored when `divided` (separators replace the gutter). Default `'md'`. */
  gap?: StatGridGap
  /** Hairline separators between cells instead of gutters. */
  divided?: boolean
}

function toLength(v: number | string): string {
  return typeof v === 'number' ? `${v}px` : v
}

export const StatGrid = React.forwardRef<HTMLDivElement, StatGridProps>(function StatGrid(
  { columns = 'auto', minItemWidth = 180, gap = 'md', divided = false, className, style, children, ...props },
  ref,
): React.JSX.Element {
  return (
    <div
      ref={ref}
      data-slot="stat-grid"
      data-columns={String(columns)}
      data-gap={gap}
      data-divided={divided ? 'true' : undefined}
      className={className ? `ca-stat-grid ${className}` : 'ca-stat-grid'}
      style={{
        ['--ca-stat-grid-min' as string]: toLength(minItemWidth),
        ...(columns === 'auto' ? null : { ['--ca-stat-grid-columns' as string]: String(columns) }),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
})
