A searchable single-select for long option lists (assign a category, pick a payee, choose an account). For a handful of fixed options use NativeSelect.

```jsx
<Combobox
  options={[
    { value: 'groceries', label: 'Groceries' },
    { value: 'dining', label: 'Dining' },
    { value: 'transport', label: 'Transport' },
  ]}
  defaultValue="groceries"
  placeholder="Assign category…"
  onValueChange={setCategory}
/>
```

Label it by pointing `htmlFor` at the id you pass — `id`, `name`, and the labelling/validation `aria-*` attributes (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-errormessage`) are routed to the inner search `<input>`, so the association is real and clicking the label focuses the field. `className`, `style`, `data-*` and handlers stay on the wrapper.

```jsx
<Label htmlFor="account">Account</Label>
<Combobox id="account" name="account" aria-describedby="account-hint" options={accounts} />
<Text id="account-hint" variant="body-sm" tone="muted">Type to filter.</Text>
```

Variants: `size="sm|default"`, `placeholder`, `emptyText`. Options accept a `hint` for a right-aligned note.
