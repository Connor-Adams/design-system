A segmented control for switching between a few mutually-exclusive views (timeframe, chart type, account filter). For navigation between content panels prefer Tabs; use this for filters and settings.

```jsx
<ToggleGroup
  type="single"
  defaultValue="month"
  items={[
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ]}
  onValueChange={setRange}
/>
```

Variants: `type="single" | "multiple"`, `size="sm | default"`, optional per-item `icon`.

Labelling: each segment is its own focusable button, so the `role="group"` root is not labelable — name it with `aria-labelledby` / `aria-label` rather than a `<label htmlFor>`, which would associate with nothing. Inside a `Field` this is handled for you.
