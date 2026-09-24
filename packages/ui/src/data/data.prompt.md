One-line: Cashflow's data-display set — StatCard (money-aware KPI), StatGrid (the KPI row container), Table, Tabs, and LetterAvatar (categorical identity chip).

```jsx
<StatCard label="Net spend" value="$4,210" hint="This month" delta="-8%" metricKind="spend" />
<StatCard label="Income" value="$9,800" delta="+3%" metricKind="gain" />

{/* Never hand-roll the KPI row — StatGrid is the container. */}
<StatGrid minItemWidth={180} gap="md">
  <StatCard label="Net spend" value="$4,210" delta="-8%" metricKind="spend" />
  <StatCard label="Income" value="$9,800" delta="+3%" metricKind="gain" />
  <StatCard label="Transactions" value="312" metricKind="neutral" />
</StatGrid>

<StatGrid columns={4} divided>   {/* dense strip: hairlines, no gutters */}
  <StatCard label="Net spend" value="$4,210" />
</StatGrid>

<Table>
  <TableHeader>
    <TableRow><TableHead>Merchant</TableHead><TableHead>Amount</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>Whole Foods</TableCell><TableCell>-$84.20</TableCell></TableRow>
  </TableBody>
</Table>

<Tabs items={[{value:'all',label:'All'},{value:'biz',label:'Business'}]} value={tab} onValueChange={setTab} />
<LetterAvatar text="Whole Foods" size="md" />
```

CRITICAL — money semantics on StatCard: pass `metricKind="spend"` for cost metrics (up = bad = red) and `metricKind="gain"` for income/savings (up = good = green). `neutral` keeps the delta muted (counts, transfers). Arrows ▲▼— and color come from this logic — never hardcode the delta color.

StatGrid props: `columns` (a number, or `'auto'` — the default auto-fit grid) · `minItemWidth` (auto-fit track minimum, number = px, default 180) · `gap` `none|sm|md|lg` (the `--space-*` ladder, default `md`) · `divided` (hairline separators instead of gutters, one outer card). Responsiveness is intrinsic — `columns="auto"` wraps by itself, so don't add breakpoints around it. It accepts **any** children and never touches them; a `StatCard` directly inside a `divided` grid has its own shell flattened automatically, and `<StatCard bare>` does the same thing anywhere else something else already draws the container.
