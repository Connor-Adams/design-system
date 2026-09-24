A single-choice radio group for mutually-exclusive options (account type, statement period). Exported as `RadioGroup`.

```jsx
<RadioGroup
  options={['Chequing', 'Savings', 'Credit']}
  value={acctType}
  onValueChange={setAcctType}
/>
```

Variants: `orientation="horizontal"` for inline rows, `defaultValue` (uncontrolled), `disabled`. Options accept `{ value, label }` objects.

Labelling: the root carries `role="radiogroup"` and is not a labelable element, so name it with `aria-labelledby` / `aria-label` — a `<label htmlFor>` pointing at it associates with nothing. Inside a `Field` this is handled for you (`Field` names group-shaped controls with `aria-labelledby`).
