import * as React from 'react'
import './StatCard.css'

/**
 * Cashflow StatCard. The KPI tile: uppercase muted label, large bold value,
 * optional hint, and a signed delta whose color is resolved by the core
 * "is this number good?" logic.
 *
 * metricKind drives the delta tone:
 *   - 'gain'    → up is good (green), down is bad (red)
 *   - 'spend'   → INVERTED: up is bad (red), down is good (green)
 *   - 'neutral' → always muted, regardless of sign
 * Pass delta as a signed string like "+12%" or "-$340".
 *
 * Layout and the delta-chip tones live in `StatCard.css`, keyed off `data-tone`.
 * `bare` drops the card shell (border, background, elevation) and keeps the
 * padding, for when something else already draws the container — a `StatGrid
 * divided` strip, or a Card the tile sits inside.
 */

export type MetricKind = 'gain' | 'spend' | 'neutral'

/**
 * KPI tile: uppercase label, large value, optional hint, and a signed delta
 * colored by Cashflow's money semantics. `metricKind` decides whether "up" is
 * good: `gain` (up=green), `spend` (up=red, inverted), `neutral` (always muted).
 * `bare` drops the card shell for tiles inside another container.
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode
  value: React.ReactNode
  hint?: React.ReactNode
  /** Signed string, e.g. "+12%" or "-$340". */
  delta?: React.ReactNode
  metricKind?: MetricKind
  /** Drop the card shell (border, background, elevation), keep the padding. */
  bare?: boolean
}

type DeltaTone = 'positive' | 'negative' | 'neutral'

function parseSign(delta: React.ReactNode): DeltaTone {
  if (delta == null) return 'neutral'
  const t = String(delta).trim()
  const m = t.match(/([+\-−])\s*[^\d+\-−]*\d/)
  if (m) return m[1] === '+' ? 'positive' : 'negative'
  const n = t.match(/\d+(\.\d+)?/)
  if (!n) return 'neutral'
  const v = Number(n[0])
  if (!Number.isFinite(v) || v === 0) return 'neutral'
  return v > 0 ? 'positive' : 'negative'
}

export function resolveDeltaTone(
  sign: 'positive' | 'negative' | 'neutral',
  kind: MetricKind
): 'positive' | 'negative' | 'neutral' {
  if (kind === 'neutral' || sign === 'neutral') return 'neutral'
  if (kind === 'spend') return sign === 'positive' ? 'negative' : 'positive'
  return sign
}

const ARROW: Record<DeltaTone, string> = { positive: '▲', negative: '▼', neutral: '—' }

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, hint, delta, metricKind = 'gain', bare = false, className, ...props },
  ref,
): React.JSX.Element {
  const sign = parseSign(delta)
  const tone = resolveDeltaTone(sign, metricKind)
  return (
    <div
      ref={ref}
      data-slot="stat-card"
      data-bare={bare ? 'true' : undefined}
      className={className ? `ca-stat-card ${className}` : 'ca-stat-card'}
      {...props}
    >
      <p className="ca-stat-card__label">{label}</p>
      <p className="ca-stat-card__value">{value}</p>
      {hint && <p className="ca-stat-card__hint">{hint}</p>}
      {delta != null && (
        <p className="ca-stat-card__delta-wrap">
          <span data-slot="stat-card-delta" data-tone={tone} className="ca-stat-card__delta">
            <span aria-hidden="true">{ARROW[sign]}</span>
            {delta}
          </span>
        </p>
      )}
    </div>
  )
})
