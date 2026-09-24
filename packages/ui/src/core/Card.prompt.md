One-line: The default raised surface — white card, hairline border, light shadow, rounded-lg. Everything sits in one. Configurable enough that you should never hand-roll a panel/section div.

```jsx
<Card>
  <CardHeader>
    <CardTitle>Net worth</CardTitle>
    <CardDescription>Across all accounts</CardDescription>
  </CardHeader>
  <CardContent>$128,400</CardContent>
</Card>

{/* page panel with a trailing action, holding two inset cards */}
<Card padding="lg" radius="xl">
  <CardHeader actions={<Button size="sm" variant="secondary">Export</Button>}>
    <CardTitle>Accounts</CardTitle>
    <CardDescription>Two connected</CardDescription>
  </CardHeader>
  <CardContent>
    <Card variant="nested" padding="sm" radius="xl">
      <CardTitle>Chequing · 4021</CardTitle>
    </Card>
  </CardContent>
</Card>
```

Props: `variant` `default` (raised) · `nested` (inset `--muted` fill, no shadow — for cards inside cards) · `plain` (no border/shadow/fill, consumer supplies the frame). `padding` `none` · `sm` (`--space-4`) · `default` (`--space-5`, 20px) · `lg` (`--space-6`). `radius` `md` · `lg` · `xl` — orthogonal to variant, so a bordered panel can ship at either. All three land as `data-variant` / `data-padding` / `data-radius` and resolve in `Card.css`; for a one-off, re-point `--ca-card-padding` / `--ca-card-radius` rather than fighting the `padding` shorthand.

Sub-parts: `CardHeader` (stacked grid; optional `actions` ReactNode on the trailing edge — rendered after the text in the DOM so the title is read first) · `CardTitle` (semibold, tight tracking) · `CardDescription` (muted body) · `CardContent` (layout passthrough — never give it padding, the root already owns it). Keep elevation light — a single soft `--shadow`, never stacked shadows; that is why `nested` drops it.
