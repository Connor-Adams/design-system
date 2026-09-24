A single-value range control for budgets, thresholds, and filters (e.g. "alert when a transaction exceeds $X").

```jsx
<Slider
  min={0} max={500} step={10}
  defaultValue={120}
  showValue
  format={(v) => `$${v}`}
  onValueChange={setThreshold}
/>
```

Label it by pointing `htmlFor` at the id you pass — `id`, `name`, and the labelling/validation `aria-*` attributes (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-errormessage`) are routed to the inner `input[type=range]`, so the association is real and clicking the label focuses the control. `className`, `style`, `data-*` and handlers stay on the wrapper. Always give it a name — `aria-label` at minimum.

```jsx
<Label htmlFor="threshold">Large-transaction alert</Label>
<Slider id="threshold" name="threshold" aria-describedby="threshold-hint" max={500} showValue format={(v) => `$${v}`} />
<Text id="threshold-hint" variant="body-sm" tone="muted">Alert above this amount.</Text>
```

Variants: `min`/`max`/`step`, `showValue`, `format`, `disabled`.
