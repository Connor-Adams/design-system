import * as React from 'react'
import './Progress.css'

/**
 * Cashflow Progress. A determinate bar over a muted track; the fill tone is
 * semantic (primary by default). Pass `value` 0–100, or set `indeterminate`
 * for an unknown-duration sweep. Optional `label` + value readout above.
 *
 * Three ways to drive the bar, in precedence order:
 *   1. `segments` — a stacked multi-segment bar. Supersedes `value` and
 *      `indeterminate`.
 *   2. `indeterminate` — an unknown-duration sweep.
 *   3. `value` — a single determinate fill, 0–100.
 *
 * The readout above the bar is `valueText` when given (any node: "1:23 / 4:56",
 * "3 of 7", "820 MB / 2 GB"), else the generated percent when `showValue`.
 *
 * Accessibility. `label` is wired to the bar with `aria-labelledby`, so the bar
 * is never nameless. `aria-label` / `aria-labelledby` passed as props land on
 * the bar (not the wrapper div, where they would be inert) and win over
 * `label`. A string `valueText` is mirrored to `aria-valuetext` so screen
 * readers announce "1:23 / 4:56" rather than "25 percent". Segmented
 * semantics: a stack is not one progressbar, so if any segment carries a
 * `label` the track becomes a labelled `group` and every labelled segment is
 * its own `progressbar` (unlabelled ones in a mixed stack stay decorative — a
 * nameless progressbar is noise, and the DS has no copy layer to invent
 * "Segment 2"). If no segment is labelled the stack conveys a single aggregate
 * quantity, so the track stays one `progressbar` reporting the clamped total
 * and the segments are decorative.
 *
 * Track heights come from the spacing tokens via `data-size` in `Progress.css`,
 * and the indeterminate sweep plus the width transitions respect
 * prefers-reduced-motion.
 */

const TONES: Record<string, string> = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--destructive)',
}

/** One band of a stacked {@link Progress}. `tone` falls back to the bar's `tone`. */
export interface ProgressSegment {
  value: number
  tone?: 'primary' | 'success' | 'warning' | 'danger' | (string & {})
  label?: string
}

/**
 * Determinate progress bar (0–100) over a muted track, semantic fill tone.
 * Set `indeterminate` for an unknown-duration sweep, or pass `segments` for a
 * stacked bar. Optional `label`, a `showValue` percentage readout, or a
 * free-form `valueText` readout.
 */
export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number
  tone?: 'primary' | 'success' | 'warning' | 'danger' | (string & {})
  size?: 'sm' | 'default' | 'lg'
  indeterminate?: boolean
  label?: React.ReactNode
  showValue?: boolean
  /** Free-form readout replacing the generated percent, e.g. "1:23 / 4:56". */
  valueText?: React.ReactNode
  /**
   * Stacked bands, rendered left to right. Supersedes `value` and
   * `indeterminate`. Values are percentages of the track; if they sum past 100
   * every band is scaled down proportionally so the stack still fills exactly
   * one track (nothing is clipped or dropped) and the track gets
   * `data-overflow="true"`.
   */
  segments?: ProgressSegment[]
}

const clampPct = (n: number): number => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0)

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    tone = 'primary',
    size = 'default',
    indeterminate = false,
    label,
    showValue = false,
    valueText,
    segments,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  ref,
): React.JSX.Element {
  const autoId = React.useId()
  const labelId = `ca-progress-label-${autoId}`

  const fill = TONES[tone] || tone
  const stacked = Boolean(segments && segments.length > 0)

  // Segmented: keep authored widths when they fit, scale proportionally when
  // they overflow, so the stack always occupies exactly one track.
  const raw = (segments ?? []).map((s) => (Number.isFinite(s.value) ? Math.max(0, s.value) : 0))
  const rawTotal = raw.reduce((a, b) => a + b, 0)
  const overflow = stacked && rawTotal > 100
  const scale = overflow ? 100 / rawTotal : 1

  const bands = stacked
    ? (segments ?? []).map((s, i) => {
        const own = raw[i] ?? 0
        return {
          label: s.label,
          pct: Math.round(clampPct(own)),
          width: `${own * scale}%`,
          background: s.tone ? TONES[s.tone] || s.tone : fill,
        }
      })
    : null

  const pct = stacked ? Math.min(100, rawTotal) : clampPct(value)
  const sweeping = !stacked && indeterminate

  const readout =
    valueText !== undefined && valueText !== null
      ? valueText
      : showValue && !sweeping
        ? `${Math.round(pct)}%`
        : null

  // `label` is a ReactNode, so it is linked by id rather than stringified into
  // aria-label. Explicit naming props win.
  const linked = ariaLabelledBy ?? (label != null ? labelId : undefined)
  const nameProps = {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabel ? undefined : linked,
  }
  const hasName = Boolean(ariaLabel || nameProps['aria-labelledby'])
  const perSegmentBars = bands ? bands.some((b) => b.label) : false

  const trackSemantics = perSegmentBars
    ? { role: hasName ? ('group' as const) : undefined, ...nameProps }
    : {
        role: 'progressbar' as const,
        'aria-valuenow': sweeping ? undefined : Math.round(pct),
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        ...(typeof valueText === 'string' ? { 'aria-valuetext': valueText } : {}),
        ...nameProps,
      }

  return (
    <div
      ref={ref}
      data-slot="progress"
      data-size={size}
      className={className ? `ca-progress ${className}` : 'ca-progress'}
      style={style}
      {...props}
    >
      {(label != null || readout != null) && (
        <div className="ca-progress__head">
          {label != null && (
            <span className="ca-progress__label" id={labelId}>
              {label}
            </span>
          )}
          {readout != null && <span className="ca-progress__value">{readout}</span>}
        </div>
      )}
      <div
        className="ca-progress__track"
        data-slot="progress-track"
        data-overflow={overflow ? 'true' : undefined}
        {...trackSemantics}
      >
        {bands ? (
          <span className="ca-progress__segments">
            {bands.map((band, i) =>
              band.label && perSegmentBars ? (
                <span
                  key={i}
                  className="ca-progress__segment"
                  data-slot="progress-segment"
                  role="progressbar"
                  aria-label={band.label}
                  aria-valuenow={band.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ width: band.width, background: band.background }}
                />
              ) : (
                <span
                  key={i}
                  className="ca-progress__segment"
                  data-slot="progress-segment"
                  aria-hidden="true"
                  style={{ width: band.width, background: band.background }}
                />
              ),
            )}
          </span>
        ) : sweeping ? (
          <span className="ca-progress__sweep" style={{ background: fill }} />
        ) : (
          <span className="ca-progress__fill" style={{ width: `${pct}%`, background: fill }} />
        )}
      </div>
    </div>
  )
})
