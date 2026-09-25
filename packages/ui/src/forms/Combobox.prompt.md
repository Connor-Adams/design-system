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

Fully keyboard-operable (ARIA combobox pattern, `aria-activedescendant`): ArrowDown / ArrowUp open the list and move the active row, wrapping at both ends; Home / End jump to the first / last row while it is open; Enter commits the active row; Escape closes and discards the typed filter; Alt+ArrowDown opens without moving, Alt+ArrowUp closes; Tab closes and moves on. **Selection does not follow focus** — arrowing never fires `onValueChange`, only Enter or a click does. Focus stays on the search input; the options are non-focusable, so the list cannot trap Tab. Blur behaves like Escape: the filter text is discarded and the committed value stands.

Label it by pointing `htmlFor` at the id you pass — `id`, `name`, and the labelling/validation `aria-*` attributes (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-errormessage`) are routed to the inner search `<input>`, so the association is real and clicking the label focuses the field. `className`, `style`, `data-*` and handlers stay on the wrapper.

```jsx
<Label htmlFor="account">Account</Label>
<Combobox id="account" name="account" aria-describedby="account-hint" options={accounts} />
<Text id="account-hint" variant="body-sm" tone="muted">Type to filter.</Text>
```

Variants: `size="sm|default"`, `disabled`, `placeholder`, `emptyText`. Options accept a `hint` for a right-aligned note. Style off `.ca-combobox` / `[data-slot="combobox"]`; the wrapper reflects `data-disabled`, each row `data-active` (selected) and `data-highlighted` (keyboard-active).
