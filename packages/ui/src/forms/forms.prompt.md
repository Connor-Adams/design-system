One-line: Cashflow form controls — Input (with optional adornments), Textarea, NativeSelect, a Label that sits above its field, and Field, which wires label + control + hint/error accessibility for you.

```jsx
<Field label="Merchant" hint="As it appears on the statement.">
  <Input placeholder="Whole Foods" />
</Field>

<Field label="Amount" required error="Enter an amount.">
  <MoneyInput />
</Field>

<Input leadingIcon={<SearchIcon />} clearable clearLabel="Clear search" placeholder="Search…" />

<Label>
  Currency
  <NativeSelect options={['CAD', 'USD', 'EUR']} />
</Label>
```

All fields: 36px tall, `--input` border, oxblood 3px focus ring, translucent fill. Labels are semibold muted captions stacked above the control. Set `invalid` for the destructive red border + ring.

`Field` props: `label`, `hint`, `error`, `required`, `id`, and any control as the child — it generates an id, sets `htmlFor`, links `aria-describedby`, sets `aria-invalid` on error and `aria-required` when required. **Error beats hint**: while `error` is set the hint is not rendered. A child that cannot take DOM props can use the render-prop form: `{({ id, ...aria }) => <MyControl {...aria} id={id} />}`.

`Input` adornments: `leadingIcon` / `trailingIcon` (nodes — no icon dependency here) and `clearable` + `onClear` + `clearLabel` for the search-field shape. Space is reserved in CSS off `data-leading` / `data-trailing`; with no adornment the DOM is still a single bare `<input>`, and the ref always forwards to that `<input>`, never to the wrapper.
