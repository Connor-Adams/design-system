A compact numeric input for small bounded quantities (split count, reminder days, statement months back).

```jsx
<Stepper defaultValue={3} min={1} max={12} format={(v) => `${v} mo`} onValueChange={setMonths} />
```

Stepper is a labelled **group**, not a single labelable control: the −/+ buttons take focus and the readout does not, so `<label htmlFor>` has nothing to associate with. Name it with `aria-labelledby` (or `aria-label`) instead — the root carries `role="group"`, so that is what gets announced. `id` and `aria-describedby` stay on that root.

```jsx
<Text id="months-label" variant="label" tone="muted">Months back</Text>
<Stepper aria-labelledby="months-label" defaultValue={3} min={1} max={12} format={(v) => `${v} mo`} />
```

Variants: `min`/`max`/`step`, `size="sm|default"`, `format`, `disabled`. For wide ranges use Slider; for free numeric entry use Input.
