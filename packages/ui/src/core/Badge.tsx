import * as React from 'react'
import './Badge.css'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'count'

export type BadgeSize = 'sm' | 'default'

/**
 * Cashflow Badge / Tag. A small pill for status and counts. `default` wears
 * the oxblood brand fill; `secondary` is a neutral muted chip; `outline` is a
 * hairline; `success` / `warning` / `info` / `destructive` are the semantic
 * signal tints (the same four-way vocabulary Alert and Toast carry); `count`
 * is the uppercase counter pill.
 *
 * Variant, size and dot styling all live in `Badge.css`, keyed off
 * `data-variant` / `data-size` — never inline styles, never JS hover state.
 *
 * `size` and `variant="count"` are deliberately layered, not exclusive:
 * `count` keeps its own bespoke type scale (bold, uppercase, roomier padding)
 * and `size` selects *within* that scale. Two-attribute selectors
 * (`[data-variant='count'][data-size='…']`) out-specify the plain size rules,
 * so `<Badge variant="count">` with no `size` renders byte-identically to
 * before this prop existed.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  /**
   * Type/padding scale. `default` is the historical 2px/8px pill; `sm` is the
   * denser chip for table cells and dense stat rows.
   */
  size?: BadgeSize
  /**
   * Render a leading status dot, tinted from the variant. The dot is
   * `aria-hidden` — the label carries the meaning, so a label is required
   * (or an explicit `aria-label` if you render a dot with no text).
   */
  dot?: boolean
  /**
   * Gently pulse the status dot to draw attention to a live/changing state.
   * Implies `dot`. Frozen under `prefers-reduced-motion`.
   */
  pulse?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = 'default',
    size = 'default',
    dot = false,
    pulse = false,
    className,
    children,
    ...props
  },
  ref,
): React.JSX.Element {
  // `pulse` is an intensifier on the dot, not a separate affordance — asking to
  // pulse without a dot to pulse is a no-op, so render the dot for them.
  const showDot = dot || pulse

  return (
    <span
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={className ? `ca-badge ${className}` : 'ca-badge'}
      {...props}
    >
      {showDot && (
        <span
          data-slot="badge-dot"
          data-pulse={pulse ? 'true' : undefined}
          className="ca-badge__dot"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
})
