A determinate bar for budgets, savings goals, import progress, and playback. Use `tone` to signal state (e.g. `danger` when a category is over budget), `valueText` when a percentage is the wrong readout, and `segments` for a stacked bar.

```jsx
<Progress value={68} label="Groceries budget" showValue />
<Progress value={104} tone="danger" label="Dining" showValue />
<Progress value={28} label="Now playing" valueText="1:23 / 4:56" />
<Progress value={43} label="Statements imported" valueText="3 of 7" />
<Progress
  label="Pauses & resumes"
  valueText="12 paused / 9 resumed"
  segments={[
    { value: 57, tone: 'danger', label: 'Pauses' },
    { value: 43, tone: 'primary', label: 'Resumes' },
  ]}
/>
<Progress indeterminate label="Importing statement…" />
```

Variants: `tone="primary|success|warning|danger"` (or any CSS color / `var(--token)`), `size="sm|default|lg"`, `indeterminate`, `label`, `showValue`, `valueText`, `segments`.

Precedence: `segments` > `indeterminate` > `value`; `valueText` > `showValue`. Segment values are percentages of the track — under 100 they keep their authored widths (a half-full split bar stays half full), and over 100 they are scaled down proportionally so nothing is clipped (the track gets `data-overflow="true"`). A segment's `tone` falls back to the bar's `tone`.

Accessibility: `label` names the bar automatically (`aria-labelledby`); `aria-label`/`aria-labelledby` props land on the bar and win. A string `valueText` is mirrored to `aria-valuetext`. With segments, label every band — labelled bands become individual progressbars inside a labelled `group`; an all-unlabelled stack stays a single progressbar reporting the total.
