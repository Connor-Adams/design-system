One-line: Cashflow's data-display set — StatCard (money-aware KPI), Table, Tabs, LetterAvatar (categorical identity chip), and ChartFrame (the card shell + sizing box every chart sits in).

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

<Tabs items={[{value:'all',label:'All'},{value:'biz',label:'Business'}]} value={tab} onValueChange={setTab} />
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

CRITICAL — charts read the token layer, never hex. `chartTheme` / `chartColors` / `chartColor(i)` / `chartLineColor(i)` return CSS `var(--chart-*)` strings, not resolved colors. `var()` resolves in SVG presentation attributes (`fill`, `stroke`, `font-size`) and in inline styles, so one set of props tracks light/dark AND the `data-brand` scope with zero JS theme detection. Never `getComputedStyle`, never `#1f2937`, never `fill="rgb(59, 130, 246)"`. Prefer `chartColors.domain.spend/credit/payment/business/personal` when the series MEANS one of those; use `chartColor(i)` for anonymous series so a chart with more series than ramp steps still gets a color.

ChartFrame is chart-library agnostic — `packages/ui` has no npm dependencies, so it ships no recharts. It gives you the card shell, the title/subtitle/actions header, the `width: 100%` + known-height plot box, and an optional footer; `children` is your chart. It does not compose `Card` yet — Card's padding is a fixed 20px and `CardHeader` has no actions slot — but it reads the same tokens, so the surfaces match; recompose once Card gains `padding` / header `actions`.
