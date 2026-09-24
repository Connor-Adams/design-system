/**
 * Chart palette + frame theme — the JS door onto the chart token layer.
 *
 * `packages/tokens/src/semantic.css` already defines a categorical ramp
 * (`--chart-1..5`), a line ramp (`--chart-line-1..6`) and Cashflow's
 * domain aliases (`--chart-spend`, `--chart-credit`, …) in BOTH theme blocks,
 * and `brands/rainbot.css` re-points the ones the brand needs, letting the rest
 * fall through to the active theme block — a brand is a delta, not a fork.
 * None of that was reachable from JS, so charting libraries — which take their
 * colors as props, not classes — were fed hard-coded hex and stopped tracking
 * the theme.
 *
 * Every value here is a CSS `var()` reference, never a resolved color. That is
 * the whole design: `var()` resolves in SVG presentation attributes
 * (`fill`, `stroke`, `font-size`, `font-family`) as well as in inline styles,
 * so `<Bar fill={chartColor(0)} />` stays theme- AND brand-reactive with no JS
 * theme detection, no `getComputedStyle`, and no re-render when the theme
 * flips. Resolve nothing here; hand the string to the library and let the
 * cascade do the work.
 *
 * This module has NO imports — no React, no CSS. It is published at the
 * `@connor-adams/designsystem/chart` subpath as well as through the barrel, so
 * a consumer who only wants the palette does not pull in the component
 * stylesheet side-effect. Import from the subpath in that case:
 *
 *   import { chartTheme, chartColor } from '@connor-adams/designsystem/chart'
 *
 * No new tokens were invented: grid and axis lines compose `--border`, tick
 * text `--muted-foreground`, and the tooltip surface the `--popover` family.
 * Those already resolve correctly in both themes and under every brand, so a
 * dedicated `--chart-grid` would have been a fourth name for the same hairline.
 */

/** A CSS `var(--token)` reference. Never a resolved color. */
export type ChartColorToken = string

/** Cashflow's domain-named chart aliases, as defined in the token layer. */
export interface ChartDomainColors {
  spend: ChartColorToken
  credit: ChartColorToken
  payment: ChartColorToken
  business: ChartColorToken
  personal: ChartColorToken
}

export interface ChartColors {
  /** Categorical ramp — bars, pie/donut slices, stacked areas. 5 steps. */
  categorical: readonly ChartColorToken[]
  /** Line ramp — multi-series line/area charts. 6 steps, tuned for strokes. */
  line: readonly ChartColorToken[]
  /** Domain aliases. Prefer these when the series MEANS one of these things. */
  domain: ChartDomainColors
}

export interface ChartAxisTheme {
  /**
   * Tick/label text. Drop-in for a charting library's tick style
   * (e.g. recharts `tick={chartTheme.axis.tick}`), replacing
   * `tick={{ fill: '#9ca3af', fontSize: 12 }}`.
   */
  tick: { fill: string; fontSize: string; fontFamily: string }
  /** Axis line and tick-mark color. */
  stroke: string
}

export interface ChartGridTheme {
  stroke: string
  strokeDasharray: string
}

export interface ChartTooltipTheme {
  /**
   * The tooltip surface. Drop-in for recharts `contentStyle`, replacing
   * `{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }`.
   */
  contentStyle: {
    background: string
    border: string
    borderRadius: string
    boxShadow: string
    color: string
    fontFamily: string
    fontSize: string
    padding: string
  }
  /** The tooltip's label row (recharts `labelStyle`). */
  labelStyle: { color: string; fontWeight: string; marginBottom: string }
  /** The tooltip's value rows (recharts `itemStyle`). */
  itemStyle: { color: string }
  /** Hover band / crosshair behind the tooltip (recharts `cursor={{ fill }}`). */
  cursor: string
  /** Leader line from a slice to its label (recharts `labelLine={{ stroke }}`). */
  labelLine: string
}

export interface ChartTheme {
  colors: ChartColors
  axis: ChartAxisTheme
  grid: ChartGridTheme
  tooltip: ChartTooltipTheme
}

/** The categorical + line ramps and the domain aliases, as `var()` strings. */
export const chartColors: ChartColors = {
  categorical: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'],
  line: [
    'var(--chart-line-1)',
    'var(--chart-line-2)',
    'var(--chart-line-3)',
    'var(--chart-line-4)',
    'var(--chart-line-5)',
    'var(--chart-line-6)',
  ],
  domain: {
    spend: 'var(--chart-spend)',
    credit: 'var(--chart-credit)',
    payment: 'var(--chart-payment)',
    business: 'var(--chart-business)',
    personal: 'var(--chart-personal)',
  },
}

/** Everything a chart needs beyond the series colors: axes, grid, tooltip. */
export const chartTheme: ChartTheme = {
  colors: chartColors,
  axis: {
    tick: {
      fill: 'var(--muted-foreground)',
      // --text-body-sm is 0.75rem — the same 12px the hand-rolled charts used.
      fontSize: 'var(--text-body-sm)',
      fontFamily: 'var(--font-sans)',
    },
    stroke: 'var(--border)',
  },
  grid: {
    // Composed, not a new token: --border is already the hairline in both
    // themes, and a brand that needs a different one re-points --border.
    stroke: 'var(--border)',
    strokeDasharray: '3 3',
  },
  tooltip: {
    contentStyle: {
      background: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow)',
      color: 'var(--popover-foreground)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-body-sm)',
      padding: '8px 10px',
    },
    labelStyle: {
      color: 'var(--foreground)',
      fontWeight: 'var(--weight-semibold)',
      marginBottom: '4px',
    },
    itemStyle: { color: 'var(--popover-foreground)' },
    cursor: 'color-mix(in srgb, var(--muted-foreground) 14%, transparent)',
    labelLine: 'var(--border)',
  },
}

function pick(ramp: readonly ChartColorToken[], index: number): ChartColorToken {
  const n = ramp.length
  const i = ((Math.floor(index) % n) + n) % n
  return ramp[i] as ChartColorToken
}

/**
 * Nth categorical color, wrapping around the ramp. Use this for series indices
 * rather than indexing `chartColors.categorical` — it never returns undefined
 * when a chart has more series than the ramp has steps.
 */
export function chartColor(index: number): ChartColorToken {
  return pick(chartColors.categorical, index)
}

/** Nth line color, wrapping around the 6-step line ramp. */
export function chartLineColor(index: number): ChartColorToken {
  return pick(chartColors.line, index)
}
