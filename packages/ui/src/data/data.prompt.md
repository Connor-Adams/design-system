One-line: Cashflow's data-display set — StatCard (money-aware KPI), Table, Tabs, and LetterAvatar (categorical identity chip).

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
{/* long bar: one scrolling row instead of wrapping onto several */}
<Tabs items={manyTabs} value={tab} onValueChange={setTab} overflow="scroll" />
{/* own your panels: panelId -> aria-controls, tabId -> the panel's aria-labelledby */}
<Tabs items={[{value:'all',label:'All',tabId:'tab-all',panelId:'panel-all'}]} value={tab} onValueChange={setTab} />
<div id="panel-all" role="tabpanel" aria-labelledby="tab-all">…</div>
<LetterAvatar text="Whole Foods" size="md" />
```

CRITICAL — money semantics on StatCard: pass `metricKind="spend"` for cost metrics (up = bad = red) and `metricKind="gain"` for income/savings (up = good = green). `neutral` keeps the delta muted (counts, transfers). Arrows ▲▼— and color come from this logic — never hardcode the delta color.

Tabs: controlled navigation semantics — always exactly one selected, `role="tablist"` + `role="tab"` + `aria-selected`, full keyboard pattern (ArrowLeft/ArrowRight wrap, Home, End) with a roving tabindex and **automatic activation** (arrowing selects). Horizontal only. `overflow` is `'wrap'` (default, multi-row) or `'scroll'` (one row, snap, faded edges, selected pill auto-scrolled into view, reduced-motion aware) — reach for `'scroll'` instead of wrapping Tabs in your own `overflow-x-auto` div. Tabs renders the tablist ONLY; panels are yours, wired via per-item `panelId`/`tabId`.

Tabs vs ToggleGroup: Tabs = navigation (one always selected, switches a view). ToggleGroup = form input (`role="group"` + `aria-pressed`, deselectable, `type="multiple"`, has `size` and per-item `icon`). Don't use Tabs for a filter you can clear.
