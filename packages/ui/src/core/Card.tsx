import * as React from 'react'
import './Card.css'

/**
 * Cashflow Card and its sub-parts. A raised surface: white --card fill,
 * --border hairline, rounded-lg, light --shadow. The default elevation unit
 * for the whole app — keep it light.
 */

/**
 * Surface treatment.
 *
 * - `default` — the raised card: `--card` fill, `--border` hairline, light `--shadow`.
 * - `nested` — an inset card *inside* another card: quiet `--muted` fill, hairline
 *   border, **no shadow** (a shadow nested inside a shadow reads as a mistake).
 * - `plain` — no border, no shadow, no fill. For when the consumer supplies its own
 *   frame and only wants the padding/radius/typography contract.
 */
export type CardVariant = 'default' | 'nested' | 'plain'

/**
 * Padding density, resolved from the `--space-*` ladder — never raw px.
 * `default` is `--space-5` (1.25rem = the historical 20px).
 */
export type CardPadding = 'none' | 'sm' | 'default' | 'lg'

/** Corner radius, resolved from the `--radius-*` ladder. `lg` is the historical default. */
export type CardRadius = 'md' | 'lg' | 'xl'

/**
 * Raised surface — the app's default elevation unit. White `--card` fill,
 * `--border` hairline, `rounded-lg`, light `--shadow`. Compose with the
 * sub-parts; keep elevation light (no heavy drop shadows).
 *
 * `variant`, `padding` and `radius` are all surfaced as `data-*` attributes and
 * resolved in `Card.css` off the token layer, so a brand or a consumer can
 * re-point them without touching the component. The no-prop defaults
 * (`default`/`default`/`lg`) reproduce the original hard-coded appearance
 * exactly. Need a one-off value? Override `--ca-card-padding` rather than
 * fighting the `padding` shorthand.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface treatment. Defaults to the raised bordered card. */
  variant?: CardVariant
  /** Padding density off the `--space-*` ladder. Defaults to `--space-5` (20px). */
  padding?: CardPadding
  /** Corner radius off the `--radius-*` ladder. Defaults to `--radius-lg`. */
  radius?: CardRadius
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'default', radius = 'lg', className, style, children, ...props },
  ref,
): React.JSX.Element {
  return (
    <div
      ref={ref}
      data-slot="card"
      data-variant={variant}
      data-padding={padding}
      data-radius={radius}
      className={className ? `ca-card ${className}` : 'ca-card'}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
})

/**
 * Card heading block. `children` (typically `CardTitle` + `CardDescription`)
 * stack on the leading edge; an optional `actions` node sits on the trailing
 * edge on the same baseline.
 *
 * `actions` is a `ReactNode`, not an icon import — `packages/ui` has no icon
 * dependency. The actions are rendered *after* the text in the DOM so a screen
 * reader still reads the title first; CSS does the side-by-side placement.
 * With no `actions` the children are rendered as direct children and no extra
 * wrapper appears, so every pre-existing header keeps byte-identical markup.
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Trailing-edge content — a button, a period selector, a menu trigger. */
  actions?: React.ReactNode
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { actions, className, style, children, ...props },
  ref,
): React.JSX.Element {
  const hasActions = actions !== null && actions !== undefined && actions !== false
  return (
    <div
      ref={ref}
      data-slot="card-header"
      data-has-actions={hasActions ? 'true' : undefined}
      className={className ? `ca-card-header ${className}` : 'ca-card-header'}
      style={style}
      {...props}
    >
      {hasActions ? (
        <>
          <div data-slot="card-header-text" className="ca-card-header__text">
            {children}
          </div>
          <div data-slot="card-header-actions" className="ca-card-header__actions">
            {actions}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  )
})

/** Card heading text — semibold, tight tracking, headline-sm. */
export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(function CardTitle(
  { className, style, children, ...props },
  ref,
): React.JSX.Element {
  return (
    <div
      ref={ref}
      data-slot="card-title"
      className={className ? `ca-card-title ${className}` : 'ca-card-title'}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
})

/** Supporting line under a `CardTitle` — muted body copy. */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  function CardDescription({ className, style, children, ...props }, ref): React.JSX.Element {
    return (
      <div
        ref={ref}
        data-slot="card-description"
        className={className ? `ca-card-description ${className}` : 'ca-card-description'}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  },
)

/**
 * Card body. A deliberate layout passthrough — the `Card` root already owns the
 * padding, so `CardContent` must never add its own or the two stack up.
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className, style, children, ...props },
  ref,
): React.JSX.Element {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={className ? `ca-card-content ${className}` : 'ca-card-content'}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
})
