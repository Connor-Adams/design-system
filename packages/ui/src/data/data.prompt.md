One-line: Cashflow's data-display set — StatCard (money-aware KPI), StatGrid (the KPI row container), Table (compose-yourself primitives), DataTable (column-config wrapper with sorting/loading/empty), Tabs, LetterAvatar (categorical identity chip), and ChartFrame (the card shell + sizing box every chart sits in).

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
{/* long bar: one scrolling row instead of wrapping onto several */}
<Tabs items={manyTabs} value={tab} onValueChange={setTab} overflow="scroll" />
{/* own your panels: panelId -> aria-controls, tabId -> the panel's aria-labelledby */}
<Tabs items={[{value:'all',label:'All',tabId:'tab-all',panelId:'panel-all'}]} value={tab} onValueChange={setTab} />
<div id="panel-all" role="tabpanel" aria-labelledby="tab-all">…</div>
<LetterAvatar text="Whole Foods" size="md" />

<ChartFrame title="Spend by month" subtitle="Last 12 months" actions={<Button variant="ghost" size="sm">Export</Button>}>
  <ResponsiveContainer width="100%" height="100%"><BarChart …/></ResponsiveContainer>
</ChartFrame>

{/* height="auto" grows with the data instead of squashing rows */}
<ChartFrame title="Spend by category" height="auto" rowCount={rows.length} rowHeight={32} minHeight={200} maxHeight={560}>
  …
</ChartFrame>

{/* The palette export — var() strings, so charts track theme AND brand with no JS */}
import { chartTheme, chartColor } from '@connor-adams/designsystem/chart'

<CartesianGrid {...chartTheme.grid} />
<XAxis tick={chartTheme.axis.tick} stroke={chartTheme.axis.stroke} />
<Tooltip contentStyle={chartTheme.tooltip.contentStyle} labelStyle={chartTheme.tooltip.labelStyle} itemStyle={chartTheme.tooltip.itemStyle} cursor={{ fill: chartTheme.tooltip.cursor }} />
<Bar fill={chartColor(i)} />
```

CRITICAL — money semantics on StatCard: pass `metricKind="spend"` for cost metrics (up = bad = red) and `metricKind="gain"` for income/savings (up = good = green). `neutral` keeps the delta muted (counts, transfers). Arrows ▲▼— and color come from this logic — never hardcode the delta color.

DataTable vs Table: reach for `DataTable` whenever the shape is "columns + rows" — it is the same `Table` primitives underneath, so the two never drift. Drop to `Table`/`TableHeader`/`TableCell` only for irregular markup (grouped headers, spanning rows, footers).

CRITICAL — DataTable sorting is *controlled and presentational*: it renders the keyboard-operable sort button and the correct `aria-sort`, then calls `onSortChange` with the next state (asc → desc → cleared). **It never reorders `rows` for you** — sort the data yourself. `getRowKey` is required on purpose; keying by array index corrupts row state as soon as anything sorts, filters or paginates. `columns[].key` must name a real field of the row type unless that column supplies a `render`.

StatGrid props: `columns` (a number, or `'auto'` — the default auto-fit grid) · `minItemWidth` (auto-fit track minimum, number = px, default 180) · `gap` `none|sm|md|lg` (the `--space-*` ladder, default `md`) · `divided` (hairline separators instead of gutters, one outer card). `divided` handles a partial last row correctly — the dividers are the cells' right and bottom edges, so the rule above the final row belongs to the full row above it and always spans the full width. Responsiveness is intrinsic — `columns="auto"` wraps by itself, so don't add breakpoints around it. It accepts **any** children and never touches them; a `StatCard` directly inside a `divided` grid has its own shell flattened automatically, and `<StatCard bare>` does the same thing anywhere else something else already draws the container.

Tabs: controlled navigation semantics — always exactly one selected, `role="tablist"` + `role="tab"` + `aria-selected`, full keyboard pattern (ArrowLeft/ArrowRight wrap, Home, End) with a roving tabindex and **automatic activation** (arrowing selects). Horizontal only. `overflow` is `'wrap'` (default, multi-row) or `'scroll'` (one row, snap, faded edges, selected pill auto-scrolled into view, reduced-motion aware) — reach for `'scroll'` instead of wrapping Tabs in your own `overflow-x-auto` div. Tabs renders the tablist ONLY; panels are yours, wired via per-item `panelId`/`tabId`.

Tabs vs ToggleGroup: Tabs = navigation (one always selected, switches a view). ToggleGroup = form input (`role="group"` + `aria-pressed`, deselectable, `type="multiple"`, has `size` and per-item `icon`). Don't use Tabs for a filter you can clear.

CRITICAL — charts read the token layer, never hex. `chartTheme` / `chartColors` / `chartColor(i)` / `chartLineColor(i)` return CSS `var(--chart-*)` strings, not resolved colors. `var()` resolves in SVG presentation attributes (`fill`, `stroke`, `font-size`) and in inline styles, so one set of props tracks light/dark AND the `data-brand` scope with zero JS theme detection. Never `getComputedStyle`, never `#1f2937`, never `fill="rgb(59, 130, 246)"`. Prefer `chartColors.domain.spend/credit/payment/business/personal` when the series MEANS one of those; use `chartColor(i)` for anonymous series so a chart with more series than ramp steps still gets a color.

ChartFrame is chart-library agnostic — `packages/ui` has no npm dependencies, so it ships no recharts. It gives you the card shell, the title/subtitle/actions header, the `width: 100%` + known-height plot box, and an optional footer; `children` is your chart. It does not compose `Card` yet, though the blockers are gone — `Card` now has `padding`/`variant`/`radius` and `CardHeader` takes `actions`, both landed alongside this. It reads the same tokens so the surfaces already match; recomposing it onto `<Card padding="lg"><CardHeader actions=…>` is outstanding follow-up work.
