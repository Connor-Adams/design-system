# @connor-adams/designsystem

## 3.0.0

### Major Changes

- 379f0b5: Make `Combobox` keyboard-operable, and make its `disabled` prop real.

  `Combobox` shipped with no keyboard operation _at all_ — there was no `onKeyDown`
  anywhere in it, so the only way to choose an option was a mouse click. It also
  had no `role="combobox"`, `aria-expanded`, `aria-controls` or
  `aria-activedescendant`: the input announced as a plain textbox with a `listbox`
  floating next to it that nothing claimed to own. For anyone adopting it as an
  accessibility upgrade over a native `<select>`, it was a downgrade.

  It now implements the ARIA 1.2 combobox pattern with `aria-activedescendant`:

  - **ArrowDown / ArrowUp** open the list and move the active row, wrapping at both
    ends (the same wrap-around `Tabs` uses). Opening is seeded on the committed
    value, else the first / last row.
  - **Home / End** jump to the first / last row _while the list is open_, and are
    left to the text caret while it is closed, so editing the filter still works.
  - **Enter** commits the active row. With nothing active — or with the list closed
    — Enter is left alone so a wrapping form still submits.
  - **Escape** closes and discards the typed filter, leaving the committed value
    untouched. Only claimed while the list is open: closed, it bubbles, so a
    Combobox inside a `Dialog` no longer swallows the Dialog's Escape.
  - **Alt+ArrowDown** opens without moving the active row; **Alt+ArrowUp** closes.
  - **Tab** closes the list and is never `preventDefault`ed, so focus moves on.
  - **Blur** behaves like Escape: the filter is discarded, the value stands.

  `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup="listbox"`,
  `aria-autocomplete="list"` and `aria-activedescendant` now sit on the search
  `<input>`, with ids derived from `React.useId()` so two Comboboxes on a page
  never collide. The listbox stays mounted (`hidden` while closed) so
  `aria-controls` always resolves; it is deliberately _not_
  `aria-multiselectable`, since this is a single-select and `false` is the default.

  **Selection does not follow focus.** Arrowing moves `aria-activedescendant`
  only; `onValueChange` fires on Enter or a click. The APG allows either, and
  `Tabs` in this package takes the other branch — but a tab strip's focus _is_ its
  value, whereas here the active row and the committed value are separate, and
  consumers reconcile, refetch and navigate on `onValueChange`.

  `disabled` is now a real prop. It was never in `ComboboxProps`, so a consumer
  passing it had it spread onto the presentational wrapper `<div>`, where it does
  nothing — a silent no-op. It now reaches the inner `<input>` (which therefore
  leaves the tab order), blocks opening by focus, click and key, and is reflected
  as `data-disabled` on the wrapper, matching `Slider` and `Stepper`.

  The active row is kept scrolled inside the panel's `max-height` by adjusting the
  list's own `scrollTop` — never `scrollIntoView`, which would scroll ancestors
  too.

  **Breaking (twice over), which is why this is `major` and not `minor`:**

  1. **`role="combobox"` changes what role queries find.** A consumer's
     `getByRole('textbox')` — or any `[role=textbox]` / a11y-snapshot assertion —
     stops matching the search input. Nine such queries in this package's own
     `Combobox.test.tsx` broke and were migrated. Migration: query
     `getByRole('combobox')`, or better `getByLabelText` / `getByRole('combobox',
{ name })`, which survives future role changes.
  2. **Options are no longer `<button>`s.** They are non-focusable
     `<div role="option">` elements, because in the `aria-activedescendant` pattern
     focus must stay on the input — and focusable options are exactly what made
     Tab trap inside the open list. `getByRole('option')` and `aria-selected` are
     unchanged; `getByRole('button')` and a `.ca-combobox-option` selector
     assuming `button` semantics (or the now-removed
     `.ca-combobox-option:focus-visible` ring) are not. The keyboard-active row is
     styleable as `[data-highlighted="true"]`; `[data-active="true"]` still means
     _selected_, unchanged.

### Patch Changes

- 4855a36: Fix `Field` labelling group-shaped controls (`Stepper`, `RadioGroup`, `ToggleGroup`).

  `Field` wired every child the same way: inject `id`, point the label's `htmlFor`
  at it. For a container carrying `role="group"` / `role="radiogroup"` that
  associates with nothing — `htmlFor` only resolves to a _labelable_ element — so
  clicking the label focused nothing and the group had no accessible name. It
  failed silently, because the label still rendered as adjacent text and
  `aria-describedby` still announced.

  Those three controls now declare their shape, and `Field` names a group-shaped
  child with `aria-labelledby` pointing at the label (which now always carries an
  id) instead of `htmlFor` pointing at the control. `aria-describedby`,
  `aria-invalid` and `aria-required` continue to land on the group root.
  Labelable children are unchanged.

- 1a5bddc: Fix `StatGrid`'s `divided` mode on a partial last row.

  The interior hairlines are drawn as an outset box-shadow on each cell, which is
  what lets the mode work under `columns="auto"` — the track count is not knowable
  at author time, so there is no `:nth-child` math available. But the shadows were
  on each cell's left and top edge, which means the rule between the last full row
  and a partial one was drawn by the cells _below_ it. With seven cells across
  three columns it therefore spanned only the first column and stopped in mid-air,
  leaving the rest of that boundary blank and the trailing cell unclosed.

  The shadows now sit on each cell's right and bottom edge instead. That makes the
  horizontal rule the property of the row _above_ it, which is always full, so it
  always spans the whole width; and the right edge closes off a lone trailing cell,
  so the empty remainder reads as an empty cell rather than a missing rule. Fully
  divisible grids are unchanged — which is why this went unnoticed, since every
  existing divided demo used a cell count that divided evenly by its column count.

  Adds a `DividedPartialRow` story and a gallery variant with a deliberately uneven
  count so the case stays visible.

## 2.0.0

### Major Changes

- aaf85b3: Route `id`, `name` and labelling/validation `aria-*` to the focusable element in
  Combobox and Slider; expose Stepper as a labelled group.

  A `Field` wrapper (label + control + hint + error) works by cloning its child and
  injecting `id`, `aria-describedby`, `aria-invalid` and `aria-required`, then
  pointing the label's `htmlFor` at that `id`. Combobox and Slider spread `...props`
  onto their outer presentational wrapper, so the injected `id` landed on a `<div>`:
  `htmlFor` pointed at a non-labelable element, `label.control` was `null`, and
  clicking the label focused nothing. It failed _silently_ — the label still read as
  adjacent text and the hint still announced — which is worse than failing loudly.

  Both now split their props through a single shared allow-list
  (`forms/fieldProps.ts`), so they cannot drift: `id`, `name`, `aria-label`,
  `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required` and
  `aria-errormessage` go to the focusable inner element (Combobox's search
  `<input>`, Slider's `input[type=range]`); everything else — `className`, `style`,
  `data-*`, handlers, wrapper-level ARIA such as `aria-orientation` — stays on the
  wrapper, exactly as before. `ref` is unchanged: it already forwarded to those
  inner inputs. Both also accept `name` explicitly now.

  Stepper is inherently multi-element — the −/+ buttons take focus, the readout does
  not — so no single `id` can be labelable. Its root now carries `role="group"`
  (additive; it previously had no role) so an injected `aria-labelledby` /
  `aria-describedby` actually announces. Name it with `aria-labelledby`, not
  `<label htmlFor>`. RadioGroup (`role="radiogroup"`) and ToggleGroup
  (`role="group"`) already worked this way and are unchanged.

  **Breaking:** `id` no longer lands on the Combobox / Slider wrapper element. A
  consumer who passed `id` and then targeted that wrapper — `#myId { width: 320px }`
  in CSS, or `document.querySelector('#myId')` — now resolves to the inner input
  instead, which will size or match the wrong node. This is `major` rather than
  `minor` because the selector target genuinely moves on a 1.x package, even though
  the wrapper was never the documented styling hook (`.ca-combobox` /
  `.ca-slider` and `[data-slot]` are, and still are) and there is no
  non-breaking path: fixing label association requires the `id` to be on the
  labelable element. Migration: style off `className`, `.ca-combobox` /
  `.ca-slider`, or `[data-slot="combobox"]` / `[data-slot="slider"]` instead of the
  `id`.

### Minor Changes

- 00e8a78: Badge: add `size`, `dot` and `pulse` props plus the missing `warning` / `info` variants.

  - **`size?: 'sm' | 'default'`** — the hard-coded `2px 8px` padding moves onto `data-size`. `variant="count"` keeps its own bespoke bold/uppercase scale and `size` selects _within_ it (via `[data-variant='count'][data-size='…']`), so an unsized `count` pill is unchanged.
  - **`dot?: boolean`** — a real leading status dot tinted from the variant, rather than asking consumers to pass one as a child. Covers the pattern that was previously hand-rolled per app (and that `Avatar`'s avatar-only `status` dot and `AccountCard`'s inline-styled dot could later share).
  - **`pulse?: boolean`** — gently expands and fades a halo out of the dot (1.6s, matching the system's existing slow-ambient cadence; implies `dot`). The loop is scoped to the 6px dot, never the label, and is removed entirely under `prefers-reduced-motion`.
  - **`warning` / `info` variants** — Badge was the only signal-bearing component without them; `Alert` and `Toast` both already carry the four-way semantic vocabulary. Uses the existing `--warning-bg` / `--warning-foreground` / `--info-bg` / `--info-foreground` tokens.

  Backwards compatible: every existing call site renders visually unchanged with no new props passed.

- a81bfa2: Add the missing chart layer: a JS chart palette export and `ChartFrame`.

  `--chart-1..5`, `--chart-line-1..6` and the domain aliases have existed in
  `semantic.css` (both themes) and in `brands/rainbot.css` since the brand scope
  landed, but there was no way to reach them from JS. Charting libraries take
  their colors as props rather than classes, so consumers hard-coded hex and the
  charts stopped tracking the theme — in the Rainbot dashboard alone, 51 such
  sites across 22 files (25× `contentStyle={{ backgroundColor: '#1f2937', … }}`,
  26× `tick={{ fill: '#9ca3af', fontSize: 12 }}`, plus raw `fill="rgb(59, 130,
246)"` and `labelLine={{ stroke: '#6b7280' }}`).

  - `chartColors` / `chartTheme` / `chartColor(i)` / `chartLineColor(i)` export
    the categorical ramp, the line ramp, the domain aliases, and axis, grid and
    tooltip styling as CSS `var()` **strings**, never resolved colors. `var()`
    resolves in SVG presentation attributes as well as inline styles, so one set
    of props stays light/dark- and brand-reactive with no JS theme detection, no
    `getComputedStyle`, and no re-render on a theme flip. No new tokens: grid and
    axis lines compose `--border`, tick text `--muted-foreground`, the tooltip the
    `--popover` family, all of which already resolve correctly in both themes and
    under every brand.
  - Published at the new `@connor-adams/designsystem/chart` subpath as well as
    through the barrel. The subpath entry is React- and CSS-free, so a consumer
    who only wants the palette does not pull in the component stylesheet
    side-effect.
  - `ChartFrame` is the frame those charts were missing: the card shell, an
    optional title / subtitle / **actions** header row, a `width: 100%` plot box
    of a known height, and an optional footer. `height` takes a number or
    `'auto'`, where the height is `rowCount × rowHeight` clamped to
    `minHeight`..`maxHeight` — the horizontal-bar case that previously showed up
    as hand-rolled `height: Math.max(200, data.length * 32)`.
  - Deliberately chart-library agnostic: `packages/ui` still has no npm
    dependencies. `children` is whatever the consuming app renders inside.
  - The frame's shell duplicates `.ca-card` off the same tokens rather than
    composing `Card`, because `Card`'s padding is currently fixed at `20px` and
    `CardHeader` has no actions slot. It should be recomposed onto `Card` once
    that component gains a padding scale and a header actions slot.

- 1480360: Make `Card` configurable instead of forcing consumers to hand-roll panels.

  `Card` was the most-used and least-configurable component in the system: one
  appearance, and `padding: 20px` hard-coded in `Card.css` with `className`/`style`
  as the only escape. Downstream that produced 57 hand-rolled card shells in a
  single dashboard (a page panel, a nested setting card, and a chart/section card)
  because none of them could be a `Card`.

  - `Card` gains `variant` (`default` | `nested` | `plain`), `padding`
    (`none` | `sm` | `default` | `lg`) and `radius` (`md` | `lg` | `xl`). All three
    are emitted as `data-variant` / `data-padding` / `data-radius` and resolved in
    `Card.css` off the `--space-*` / `--radius-*` token ladders — no inline style
    arithmetic, no new hard-coded px. `nested` is the inset `--muted` surface for
    cards inside cards (border kept, shadow dropped); `plain` drops border, shadow
    and fill for consumers supplying their own frame.
  - Padding and radius resolve through `--ca-card-padding` / `--ca-card-radius`, so
    a one-off can be re-pointed with a custom property instead of fighting the
    `padding` shorthand.
  - `CardHeader` gains an `actions` slot: a `ReactNode` placed on the trailing edge
    while the title/description keep stacking on the leading edge. The actions are
    rendered _after_ the text in the DOM, so a screen reader still reaches the
    title first; the side-by-side placement is CSS only.
  - `.ca-card-content` finally has a rule. It stays padding-free on purpose — the
    root owns the padding and stacking the two is a known bug class — and the
    intent is now documented in the CSS rather than implied by an absent selector.
  - New exported types: `CardVariant`, `CardPadding`, `CardRadius`,
    `CardHeaderProps`, `CardTitleProps`, `CardDescriptionProps`, `CardContentProps`.

  Backwards compatible. `--space-5` is `1.25rem`, the token spelling of the old
  literal `20px`, so a `<Card>` with no props resolves to byte-identical computed
  styles (padding, radius, border, fill, shadow) and an identical box height; a
  `CardHeader` with no `actions` emits exactly the markup it did before — no
  wrapper element, no extra attribute.

- 3b94f1a: Add DataTable, and make the Table head sticky and its scroll container styleable.

  `data/Table` shipped compose-yourself primitives only, so every consumer with a
  "columns + rows" shape rebuilt the same wrapper by hand — the Rainbot dashboard
  alone carries 14 raw `<table>` elements across 11 files plus its own generic
  column-config component. None of those hand-rolls sort accessibly: the package
  had no `aria-sort` anywhere, and the usual shortcut is a click-only `<th>` that
  keyboard users cannot reach.

  `DataTable` is a thin composition **over** those primitives (not a fork), so the
  borders, hover tint and cell metrics stay in lockstep with hand-composed tables.
  It is generic over the row type: a column with no `render` must key a real field
  of the row, so a typo is a compile error instead of an empty cell. Sorting is
  controlled and deliberately presentational — DataTable renders a real
  keyboard-operable `<button>` in the head cell and puts the correct `aria-sort` on
  the `<th>`, then reports the next state (asc → desc → cleared); the consumer
  still owns the ordering. `getRowKey` is required rather than defaulting to the
  array index, which silently corrupts row state under sorting or pagination.
  `loading` swaps the body for `Skeleton` rows behind `aria-busy`, and `empty`
  fills a column-spanning cell.

  Two `Table` defects fixed alongside, both backwards compatible:

  - `.ca-table-head` was not sticky, so the `maxHeight` prop — whose only purpose
    is to create a scroll region — scrolled the header out of view. It now pins
    with an explicit `var(--card)` background (it had none, so a naive
    `position: sticky` would have let rows bleed through) and an inset box-shadow
    separator, since collapsed borders do not paint on a stuck cell. With no
    scroll region, sticky is a no-op, so existing call sites are unchanged.
  - `.ca-table-container` took no class, leaving the scroll region unstylable. New
    optional `containerClassName` prop; `className` still targets the `<table>`.

- 82018ac: Add the Field component and give Input somewhere to hang an adornment.

  `Field` wraps a label, a control and one hint-or-error line, and wires the
  accessibility that consumers were hand-writing: it generates an id when none is
  given, sets the composed `Label`'s `htmlFor`, links the message through
  `aria-describedby`, sets `aria-invalid` when there is an error and
  `aria-required` when the field is required. An element child is cloned with
  those props; a control that cannot take DOM props can use the render-prop form.
  Error takes precedence over hint — the hint is not rendered while `error` is set,
  so `aria-describedby` never points at stale help text.

  `Input` gains `leadingIcon`, `trailingIcon`, `clearable`, `onClear` and
  `clearLabel`. The clear button is a real focusable `<button>` with an accessible
  name, and is disabled (so out of the tab order) while there is nothing to clear.
  Adornment space is reserved in CSS off `data-leading` / `data-trailing`, never
  measured in JS. A field with no adornment renders exactly as before — a single
  bare `<input>`, no wrapper — and the ref always forwards to the `<input>`.

- 7200879: Harden `Dialog` and add `ConfirmDialog` / `useConfirm`.

  `Dialog` was a scrim with a raw `document` keydown listener. Two open dialogs
  both closed on one Escape, a dialog behind an open `DropdownMenu` closed with
  it, focus was never moved in or restored, the page scrolled behind the modal,
  `position: fixed` was at the mercy of any `transform` ancestor, and
  `role="dialog" aria-modal` sat on the scrim with nothing linking the title.

  - **Shared dismiss stack** (`useDismissLayer`, `pushDismissLayer`): Escape is
    handled by the topmost layer only. `DropdownMenu` now registers here instead
    of binding its own listener, so an open menu inside a dialog takes Escape for
    itself. A new overlay (`Popover`, `Drawer`) joins by calling the hook. The
    listener stays on the bubble phase so a nested widget that is not yet a layer
    can still claim Escape with `stopPropagation()`/`preventDefault()`.
  - **Focus management**: focus moves into the dialog on open (`initialFocus`,
    else the first focusable child, else the card), Tab is trapped and wraps both
    ways, and focus returns to the previously focused element on close.
  - **Body scroll lock** while open, ref-counted so nested dialogs behave.
    `lockScroll={false}` opts out.
  - **Portal** to `document.body` by default; `container` retargets it and
    `portal={false}` restores the old in-tree rendering.
  - **Accessibility**: `role` / `aria-modal` moved to the content card, with
    `aria-labelledby` / `aria-describedby` wired to the rendered `title` and
    `description`. `role="alertdialog"` and other div attributes pass through.
  - **`closeOnEscape` / `closeOnOverlayClick`** make the two dismissal routes
    optional; a scrim click now only closes when it starts and ends on the scrim.

  `ConfirmDialog` is the `window.confirm` replacement built on top: `title`,
  `description`, `confirmLabel`, `cancelLabel`, and a `tone` of `default` or
  `destructive` — destructive focuses **Cancel**, so a reflexive Enter cannot
  delete. An `onConfirm` returning a promise puts the confirm button in a pending
  state and holds the dialog open, non-dismissible, until it settles; a rejection
  is reported through `onError` or re-thrown to the nearest error boundary, never
  swallowed. `useConfirm()` gives the `if (await confirm(...))` shape with no
  provider to install.

  All existing props keep their behavior and defaults. Two changes are visible to
  code that reaches past the public props: the dialog renders under
  `document.body` unless `portal={false}`, and `getByRole('dialog')` now matches
  the content card rather than the scrim.

- f28b428: Close the media/audio gap in the `Icon` glyph registry — 19 additions.

  The package ships a full `media/` component group (`MediaPlayer`,
  `PlaybackControls`, `QueueList`, …) but the registry's media section held only
  six glyphs (`play` `pause` `skip-forward` `skip-back` `volume` `volume-x`), so
  consumers driving an audio UI hand-rolled their own inline SVGs rather than
  reaching for `Icon`. Adds the transport, routing, and source glyphs that set was
  missing: `stop` `fast-forward` `rewind` `play-circle` `pause-circle` `shuffle`
  `repeat-1` `volume-1` `headphones` `speaker` `mic-off` `cast` `airplay` `disc`
  `album` `radio` `podcast` `list-music` `audio-lines`.

  Pure additions — no renames, no re-grouping, no API change; `IconName` and
  `iconNames` widen automatically off `GLYPHS`. Note `repeat` is untouched: it
  stays a subscriptions/recurring glyph in the categories section, and `repeat-1`
  is the separate media loop-one variant. `volume-2` was deliberately not added —
  the existing `volume` glyph already carries lucide's two-wave `volume-2`
  geometry, so the ramp is `volume-x` → `volume-1` → `volume`.

- f1fe24c: Progress: free-form `valueText`, stacked `segments`, and a named progressbar.

  `showValue` hard-coded `{Math.round(pct)}%`, so time, counts, and byte totals had
  to be hand-rolled next to the bar. `valueText` now takes any node and replaces
  the generated percent in the existing value slot (`"1:23 / 4:56"`, `"3 of 7"`,
  `"820 MB / 2 GB"`); a string `valueText` is also mirrored to `aria-valuetext` so
  screen readers announce the real readout instead of a percentage. `showValue`
  keeps working untouched.

  `segments={[{ value, tone?, label? }]}` renders a stacked bar and supersedes
  `value` and `indeterminate`. Values are percentages of the track: under 100 they
  keep their authored widths (a half-full split bar stays half full), and over 100
  every band is scaled down proportionally so the stack fills exactly one track —
  nothing is clipped or dropped — with `data-overflow="true"` on the track. A
  segment's `tone` falls back to the bar's `tone`.

  Accessibility fix: `role="progressbar"` received no accessible name even when
  `label` was set — the label rendered as an unlinked sibling span. `label` is now
  wired to the bar with `aria-labelledby`, and `aria-label` / `aria-labelledby`
  passed as props are forwarded to the bar (they previously landed on the wrapper
  div, where they were inert) and win over `label`. In segmented mode a stack is
  not one progressbar: when any segment has a `label` the track becomes a labelled
  `group` and each labelled segment is its own `progressbar`, while an
  all-unlabelled stack stays a single progressbar reporting the clamped total.

  Also: track heights moved off inline pixels (`4 / 8 / 12`) onto the spacing
  tokens via `data-size` in `Progress.css`, and `prefers-reduced-motion` now
  disables the fill/segment width transitions as well as the indeterminate sweep.

- ee02bbd: Add `StatGrid` — the KPI row container for `StatCard`.

  Until now the package had no layout component at all, so every consumer
  hand-rolled the metric row: the rainbot dashboard alone repeats one tile shell
  28 times across 5 files, and a sixth file has already drifted to a different
  background and radius. `StatGrid` owns that layout.

  `columns` takes a number or `'auto'` (the default intrinsically responsive
  auto-fit grid, sized by `minItemWidth`), `gap` steps the `--space-*` ladder, and
  `divided` swaps the gutters for hairline separators — the dense KPI strip. The
  whole grid lives in CSS, driven by `data-*` and two custom properties, so there
  are no media queries or measurements in JS. It accepts any children and never
  introspects or clones them.

  `StatCard` gains an optional `bare` prop that drops the card shell (border,
  background, elevation) and keeps the padding, for tiles inside a container that
  already draws one. A `StatCard` placed directly in a `divided` grid gets the
  same treatment automatically, so the separators never double up against the
  tile's own border.

- 445dd65: Fix `Tabs` overflow and keyboard navigation.

  `Tabs` set up a roving tabindex (`tabIndex={active ? 0 : -1}`) but shipped no
  `onKeyDown`, so arrow keys did nothing and only the selected tab was reachable
  at all — a WCAG 2.1.1 / ARIA-tabs-pattern failure, and the reason consumers
  abandoned it for hand-rolled `<button>` rows with no tablist semantics. It now
  implements the pattern: ArrowLeft / ArrowRight wrap around the ends, Home and
  End jump to the first and last tab. Activation is **automatic** (moving focus
  selects), which keeps focus and `value` identical so the component stays purely
  controlled with no internal focused-but-unselected state, and matches the
  pointer behaviour where a click selects at once. The tablist stays
  `aria-orientation="horizontal"` and ArrowUp / ArrowDown stay unmapped, per APG —
  the pill layout and the new scroll axis are both horizontal. A consumer
  `onKeyDown` still fires first and can opt out with `preventDefault()`.

  Adds `overflow?: 'wrap' | 'scroll'`, defaulting to `'wrap'` so every existing
  call site keeps its current multi-row behaviour. `'scroll'` keeps the bar on one
  row with horizontal scroll, scroll-snap, and an edge affordance that fades only
  the side that still has tabs off-screen — driven from CSS off
  `data-overflow-start` / `data-overflow-end`, which the component writes straight
  onto the node from live scroll geometry (CSS cannot read `scrollLeft`), with no
  state and so no re-render per scroll event. The selected pill is scrolled into
  view when `value` changes, animated unless `prefers-reduced-motion` is set. The
  scrollbar is hidden: the track is one pill tall, so an OS scrollbar would eat a
  third of it and on Windows never auto-hides. Nothing becomes unreachable —
  arrow keys move the roving focus and pull the scroll along, and `overflow` hides
  nothing from assistive tech, so every tab keeps its `aria-selected` and
  `aria-controls` in the a11y tree.

  Adds optional per-item ARIA wiring for panels the consumer owns: `TabItem.panelId`
  becomes that tab's `aria-controls`, and every trigger now carries a stable `id`
  (overridable with `TabItem.tabId`) so a panel can point back with
  `aria-labelledby`. No `tabpanel` component is introduced; `Tabs` still renders
  only the tablist.

  `ToggleGroup` is untouched — it remains the form-semantics sibling
  (`role="group"` + `aria-pressed`, deselectable, multi-select). `Tabs` stays
  navigation semantics: controlled, always exactly one selected.

- ba043ce: Add `Toaster` — a real toast host — plus `toast()` and `useToast()`, and derive `Toast`'s live-region strength from its variant.

  `Toast` was presentational by design and said so, but the design system never shipped the other half: no auto-dismiss, no enter/exit animation, no positioning or stacking container, no portal. Every consuming app hand-rolled that host, and the hand-rolled version has a failure mode that is silent and hard to spot: when `useToast()` owns its own `useState`, each caller gets a _separate_ queue, so a toast fired from a screen whose container nothing renders is dropped with no error anywhere. That shipped in a consuming dashboard — one screen rendered the container, another fired into its own instance, and every one of its toasts vanished.

  `Toaster` closes the gap and makes that bug unrepresentable:

  - The queue is a single module-level store, so `toast()` is callable from event handlers, API layers and other non-React code, and `useToast()` is a `useSyncExternalStore` read of the same queue. There is deliberately no provider — a provider is what invites the split-state mistake — and two mounted `Toaster`s render one stack rather than duplicates.
  - Portalled fixed stack with six `position` options, `max` visible toasts with the overflow collapsed into a `+N more` count, and a `gap`.
  - Per-toast `duration` with `Infinity`/`0` to persist, and timers that pause while the stack is hovered or holds focus, so a toast cannot vanish mid-read or while its action button is focused.
  - Enter/exit animation in CSS, keyed off `data-position`/`data-state` and disabled under `prefers-reduced-motion`.
  - Reusing a toast `id` updates that toast in place (loading to success) instead of stacking a second one.

  `Toast` also had `role="status"` and `aria-live="polite"` hardcoded, so an `error` toast could not escalate past a polite announcement. Both are now derived from `variant` — `error` announces as `alert`/`assertive`, every other variant stays `status`/`polite` — with explicit `role` and `aria-live` props to override. The viewport itself is a `role="region"` landmark and deliberately not a live region, so adding one toast does not re-announce the whole stack.

- 8cc0973: Add `forms/UploadButton`, and make `finance/ImportDropzone` reusable beyond bank statements.

  `ImportDropzone` was the only file input in the package, so every app that needed
  a plain "pick a file" button rebuilt the hidden-`<input type="file">`-plus-proxy-button
  pattern by hand — the Rainbot dashboard alone carries two independent copies of it.
  `UploadButton` is that pattern, done once: it composes `core/Button` (so `variant`
  and `size` forward through and every interactive state still comes from
  `Button.css`), resets the input's `value` after each selection so re-picking the
  _same_ file fires again, and sets `aria-busy` while `loading`.

  `ImportDropzone` had four real limitations behind its statement-only framing: the
  primary copy and the replace affordance were hard-coded and unslotted, it was
  single-file only, it had no error channel at all (`onError` was explicitly
  `Omit`ted), and its advertised 10MB limit was advisory — nothing enforced it,
  and `accept` was never re-checked on drop, so a dragged `.pdf` was handed
  straight to `onFile`. It now takes `label`/`children`, `replaceLabel`, `multiple`

  - `onFiles`, `maxSize`, `onError`, `disabled`, and a controlled `files` prop
    (`files={[]}` or `files={null}` clears the selection from outside).

  Both components share one set of intake rules — the new pure `forms/fileSelect`
  module (`selectFiles`, `matchesAccept`, `formatFileSize`, all exported) — so a
  drop is validated by exactly the code path a browse uses, rather than the input
  handling existing twice inside the package. `ImportDropzone` composes
  `UploadButton` for its click/keyboard affordance.

  Every existing prop keeps its name, its default and its behaviour, so no call
  site needs changing. Two things do change for existing users:

  - A dropped file that does not satisfy `accept` is now rejected (reported via
    `onError` and announced in a live region) instead of being passed to `onFile`.
    `maxSize` stays opt-in — it is undefined by default, so nothing that used to
    reach `onFile` on size grounds stops doing so.
  - The DOM is now a plain wrapper containing a real `<button>` that fills the
    surface, rather than `role="button"` + `tabIndex={0}` on the wrapper itself.
    That removes the nested-interactive/keyboard gap and gives the control a real
    accessible name, but the wrapper's padding moved onto the inner trigger — a
    consumer overriding `.ca-import-dropzone` padding should target
    `.ca-import-dropzone-trigger` instead.

### Patch Changes

- Updated dependencies [f37c634]
- Updated dependencies [96510b7]
  - @connor-adams/tokens@0.2.0

## 1.0.0

### Major Changes

- 680bab8: Remove `BrandLogo`; brand/merchant marks now ship through `Icon`.

  Brand logos are addressed with a `brand:` name prefix — `<Icon name="brand:spotify" />`, or `<Icon name="brand:visa" brand />` for the official color. The `brand` boolean moved onto `Icon` (no-op on stroke glyphs), and `iconNames` now includes the `brand:`-prefixed names.

  **Breaking:** the `BrandLogo` component and the `brandNames`, `brandColors`, `BrandName`, and `BrandLogoProps` exports are removed. Migrate `<BrandLogo name="spotify" brand />` → `<Icon name="brand:spotify" brand />`. Brand marks now render with `data-slot="icon"` (was `data-slot="brand-logo"`) and the `.ca-icon` class (was `.ca-brand-logo`) — update any CSS/test selectors targeting the old values.

### Minor Changes

- 8c38e2e: Add an override seam for category icons so consumers can supply a stored "icon per category" instead of relying solely on keyword inference. `categoryVisual()` / `categoryIconName()` take an optional `overrides` map (category name → `IconName` or full `CategoryVisual`, matched case/punctuation-insensitively); a bare icon name swaps the glyph and keeps the inferred tint. `CategoryPill` gains `iconName` (render a registry glyph by name) and `overrides` props, and `CategoryBreakdown` gains a per-row `iconName` plus a tile-wide `iconOverrides`. Precedence: `icon` (raw node) › `iconName` › `overrides` › keyword inference.
- 69b6c52: CategoryPill now infers its icon and tint from free-text category/merchant names by keyword instead of an exact-match lookup over 8 fixed keys. Names like "Eating Out", "cc fees", "Vape", "Office Equipment", "Spotify", and "Amazon" now get sensible glyphs (brand names resolve ahead of generic words) rather than falling to a generic default. Exposes `categoryVisual()` and `categoryIconName()` for consumers that need the mapping directly, and exports the `GLYPHS` registry from the icon module.

### Patch Changes

- 0e7fbd5: Fix category-icon coverage gaps and the brand-mark path in `CategoryPill`:

  - The keyword matcher (`categoryVisual`/`categoryIconName`) wrote rules in the singular against word-boundary anchors, so naturally-plural and spaced names silently fell to the default `tag` glyph. Real misses now resolved: **Games** (`game` → `games?`), **Subscriptions** (`subscription` → `subscriptions?`), and **LuLu Lemon** (added a `lulu lemon` spaced alternative beside `lululemon`).
  - `CategoryPill` indexed the stroke-glyph `GLYPHS` registry with an `IconName` that now includes `brand:` marks, which both failed typecheck and would have rendered an empty glyph for a brand category icon. Brand names now render through `Icon` (filled mark in its official color); stroke glyphs keep their inline, tinted rendering.

## 0.11.0

### Minor Changes

- 4783bfc: Fill category-icon gaps: add Icon glyphs `tooth` (dentist), `lipstick` (makeup), and `vape` — previously falling back to stethoscope/sparkles/cloud. Also add the `yeti` BrandLogo. Tooth from Tabler Icons (MIT); lipstick & vape are bespoke stroke glyphs; yeti from Simple Icons (CC0).

## 0.10.0

### Minor Changes

- 6e2ac4c: Add 22 more BrandLogo brands (now ~251) recovered from older Simple Icons releases — including amazon, microsoft, adobe, slack, linkedin, xbox, nintendo, hulu, walmart, canva, openai, twilio, heroku, prime-video, edge, t-mobile, att, grubhub, flipkart, alibaba, gog, telekom. These were dropped from current Simple Icons over trademark requests; paths are still CC0 from the versions that shipped them.

## 0.9.0

### Minor Changes

- 85e7b0a: Expand BrandLogo registry from 34 to ~230 brands — broad coverage across payments/fintech, streaming, food & delivery, travel, retail, gaming, crypto, telecom, auto, and tech/SaaS (all from Simple Icons, CC0). Enumerate via `brandNames`; per-brand hexes in `brandColors`.

## 0.8.0

### Minor Changes

- 8915b55: Add BrandLogo component — filled brand/merchant logos (Spotify, Netflix, Visa, PayPal, Apple Pay, Cash App, and 28 more). Renders in currentColor by default or the official brand color via the `brand` prop; sized via `size`. Names exported as `brandNames`, official hexes as `brandColors`. Paths from Simple Icons (CC0).

## 0.7.0

### Minor Changes

- 531392e: Expand Icon registry (wave 8) — add 13 more glyphs: log-in, receipt-text, book-open-check, heart-handshake, heart-pulse, hand-coins, list-checks, clipboard-check, box, hammer, smartphone, building-2, tags.

## 0.6.0

### Minor Changes

- c1ccc83: Expand Icon registry (wave 7) — add the 13 CategoryIcon glyphs still on lucide: baby, bed, flower-2, gamepad-2, keyboard, mountain, paintbrush, parking-square, party-popper, plug, recycle, stethoscope, trees.

## 0.5.0

### Minor Changes

- 62ede3f: Expand Icon registry (wave 6) — close the lucide-react glyph gap blocking the cashflow frontend migration. Adds app utilities (sparkles, calendar-clock, calendar-range, calendar-plus, git-compare, git-merge, wrench, chevrons-up-down, grip-vertical, command, wand, filter-x, unlock, unlink, user-x), distinct shield/alert glyphs (shield-alert, shield-check, octagon-alert), and a merchant/category palette (pizza, beer, bike, bus, train, pill, sofa, shirt, gem, cake, paw-print, ticket, tv, wine, snowflake).

## 0.4.0

### Minor Changes

- ac552f2: Add Icon component — a registry of lucide-style stroke glyphs (money, categories, actions, status, chevrons) rendered in `currentColor` and sized via the `size` prop. Names exported as `iconNames`.
- ad0ad3f: Expand Icon registry — add ~34 more glyphs (arrows, bar-chart, calculator, percent, target, coffee, shopping-bag, fuel, dumbbell, book-open, music, phone, wifi, building, map-pin, menu, more-horizontal/vertical, star, bookmark, lock, log-out, refresh-cw, copy, external-link, mail, clock, tag, x-circle, help-circle).
- 32ac6f2: Expand Icon registry (wave 3) — add ~31 more glyphs: files (file, file-text, folder, clipboard, printer, save), media (play, pause, skip-forward, skip-back, volume, volume-x), devices (laptop, monitor, camera, image), weather (sun, moon, cloud), social (message-circle, send, thumbs-up, share, link), and goals/misc (trophy, award, scale, globe, power, sliders, flag).
- 96b9d91: Expand Icon registry (wave 4) — add ~29 more glyphs: commerce (package, truck, store, key), layout (grid, list, layout-dashboard, maximize, panel-left), editing (scissors, type, undo, redo, check-square, square, circle), people (users, user-plus, at-sign, video, mic), travel (compass, map, navigation), time (timer, hourglass), and misc (battery, smile, eye-off, thumbs-down, alert-circle).
- 7e5e604: Expand Icon registry (wave 5) — add ~30 more glyphs: finance (bitcoin, circle-dollar-sign, line-chart), comms (inbox, archive, reply, forward, message-square), data (database, server, hard-drive, paperclip), text/format (bold, italic, underline, align-left, hash, code, terminal), life (gauge, lightbulb, rocket, flame, leaf, droplet, umbrella), and status/nav (check-check, plus-circle, minus-circle, minimize).
- 3a56331: Styles now load automatically — `import { Button } from '@connor-adams/designsystem'` pulls in the bundled CSS (tokens included) via a side-effect import on the JS entry. The separate `import '@connor-adams/designsystem/styles.css'` line is no longer required (the export is kept for back-compat). Requires a consumer bundler that processes CSS from `node_modules`.

### Patch Changes

- c1ec281: Fix a total CSS load failure in Next.js consumers. The previous layer setup
  applied cascade layers through `@import "..." layer(base|components)` in
  `styles.css`. Next.js's CSS pipeline silently drops layered `@import`s, so the
  whole stylesheet — tokens and components — failed to load: pages rendered
  completely unstyled (serif fallback, no token variables).

  Layers are now baked into the files instead: the token base element resets live
  in `@layer base` (in `tokens/base.css`) and the bundled component CSS is wrapped
  in `@layer components` at build time (tsup `onSuccess`). `styles.css` uses plain
  `@import`, which both Next.js and Vite inline correctly. Cascade order is
  base < components < unlayered: components beat the base resets (e.g. the
  form-control `font: inherit`) while consumer styles still override components.

  Verified in both the Next web app and Storybook (Vite): CSS loads and a default
  Button computes `font-weight: 600`.

- e73f3ce: Ship component CSS in `@layer components` so consumer styles (Tailwind
  utilities or any unlayered rule) override a component's own styling via
  `className`. The earlier attempt at this was reverted because it layered the
  components but left the token base resets unlayered — so
  `button, input, select, textarea { font: inherit }` outranked the layered
  components and wiped out their `font-weight`/`font-size`. This version declares
  `@layer base, components` and imports the tokens into `layer(base)`, so the
  order is base < components < unlayered: components beat the base resets, and
  consumer styles still override components.
- Updated dependencies [c1ec281]
  - @connor-adams/tokens@0.1.1

## 0.3.1

### Patch Changes

- 8dc5f2d: Ship component CSS in `@layer components` (via the `styles.css` import) so a
  consumer's styles — Tailwind utilities (which sit in `@layer utilities`, after
  `components`) or any unlayered rule — override a component's own styling through
  `className`. Without the layer, the unlayered component classes won the cascade
  against consumer utilities.

## 0.3.0

### Minor Changes

- 30af5a0: Add CategoryBreakdown component — a card with a ranked horizontal-bar breakdown of money by category, composed from existing primitives.

## 0.2.0

### Minor Changes

- 1d5cd7b: Move all component interactive states (hover, focus-visible, active, disabled) from JS-driven inline styles into co-located CSS, keyed off `data-variant`/`data-size`. Every component now uses `React.forwardRef` and merges the consumer `className`. This adds visible keyboard focus rings across the library (WCAG 2.4.7), removes re-render-on-hover, and ships a single bundled `dist/index.css` (re-exported by `styles.css`).

  Also adds a vitest + Testing Library suite (one `*.test.tsx` per component, 350 tests) wired into CI.
