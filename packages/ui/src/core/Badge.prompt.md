One-line: Small pill for status, category, and counts — `default` is oxblood brand fill, `secondary` the neutral workhorse, and `dot`/`pulse` turn it into a live status indicator.

```jsx
<Badge>Active</Badge>
<Badge variant="secondary" size="sm">CAD</Badge>
<Badge variant="success">Reconciled</Badge>
<Badge variant="warning">Due soon</Badge>
<Badge variant="info">Heads up</Badge>
<Badge variant="count">12</Badge>

{/* live status: the dot is tinted from the variant, pulse implies dot */}
<Badge variant="success" dot>Connected</Badge>
<Badge variant="success" pulse>Live</Badge>
```

Variants: `default` (oxblood) · `secondary` (muted) · `destructive` · `outline` · `success` · `warning` · `info` · `count` (uppercase bold counter). The four semantic signal tints match Alert's and Toast's vocabulary. Keep oxblood badges rare — prefer `secondary` for most metadata.

Sizes: `default` (2px/8px) · `sm` (denser, for table cells and stat rows). `variant="count"` keeps its own bespoke bold/uppercase scale and `size` selects *within* it, so `<Badge variant="count">` is unchanged from before `size` existed.

`dot` renders a real leading dot tinted from the variant — don't pass your own dot as a child. `pulse` gently expands and fades a halo out of it (1.6s, dot only, removed under `prefers-reduced-motion`); use it only for genuinely live state, never as decoration. The dot is `aria-hidden`, so a dot-only Badge needs an explicit `aria-label`.
