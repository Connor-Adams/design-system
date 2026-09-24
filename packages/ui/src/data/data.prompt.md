One-line: Cashflow's data-display set — StatCard (money-aware KPI), Table (compose-yourself primitives), DataTable (column-config wrapper with sorting/loading/empty), Tabs, and LetterAvatar (categorical identity chip).

```jsx
<StatCard label="Net spend" value="$4,210" hint="This month" delta="-8%" metricKind="spend" />
<StatCard label="Income" value="$9,800" delta="+3%" metricKind="gain" />

<Table>
  <TableHeader>
    <TableRow><TableHead>Merchant</TableHead><TableHead>Amount</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>Whole Foods</TableCell><TableCell>-$84.20</TableCell></TableRow>
  </TableBody>
</Table>

<DataTable
  columns={[
    { key: 'merchant', header: 'Merchant', sortable: true },
    { key: 'amount', header: 'Amount', align: 'right', width: 120, sortable: true,
      render: (t) => <AmountText value={t.amount} /> },
  ]}
  rows={txns}
  getRowKey={(t) => t.id}
  sort={sort} onSortChange={setSort}
  loading={isLoading}
  empty={<EmptyState title="No transactions" />}
  maxHeight="320px"
/>

<Tabs items={[{value:'all',label:'All'},{value:'biz',label:'Business'}]} value={tab} onValueChange={setTab} />
<LetterAvatar text="Whole Foods" size="md" />
```

CRITICAL — money semantics on StatCard: pass `metricKind="spend"` for cost metrics (up = bad = red) and `metricKind="gain"` for income/savings (up = good = green). `neutral` keeps the delta muted (counts, transfers). Arrows ▲▼— and color come from this logic — never hardcode the delta color.

DataTable vs Table: reach for `DataTable` whenever the shape is "columns + rows" — it is the same `Table` primitives underneath, so the two never drift. Drop to `Table`/`TableHeader`/`TableCell` only for irregular markup (grouped headers, spanning rows, footers).

CRITICAL — DataTable sorting is *controlled and presentational*: it renders the keyboard-operable sort button and the correct `aria-sort`, then calls `onSortChange` with the next state (asc → desc → cleared). **It never reorders `rows` for you** — sort the data yourself. `getRowKey` is required on purpose; keying by array index corrupts row state as soon as anything sorts, filters or paginates. `columns[].key` must name a real field of the row type unless that column supplies a `render`.
