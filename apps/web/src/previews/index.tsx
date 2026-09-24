'use client'
import * as React from 'react'
import {
  // core
  Accordion,
  Avatar,
  Badge,
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Icon, iconNames,
  Kbd,
  Link,
  Progress,
  Separator,
  Spinner,
  Text,
  // data
  LetterAvatar,
  StatCard,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Tabs,
  // feedback
  Alert,
  EmptyState,
  Skeleton, SkeletonText,
  // finance
  AccountCard,
  AmountText,
  BudgetMeter,
  CategoryBreakdown,
  CategoryPill,
  ImportDropzone,
  MoneyInput,
  PeriodSelector,
  Sparkline,
  // forms
  Checkbox,
  Combobox,
  Input,
  Label,
  NativeSelect,
  RadioGroup,
  Slider,
  Stepper,
  Switch,
  Textarea,
  ToggleGroup,
  // navigation
  Breadcrumb,
  Pagination,
  // overlays
  Dialog,
  DropdownMenu,
  Toast,
  Tooltip,
} from '@connor-adams/designsystem'

// ---------------------------------------------------------------------------
// Controlled wrappers — defined as named function components so hooks are valid
// (module is already 'use client')
// ---------------------------------------------------------------------------

function TabsPreview(): React.JSX.Element {
  const [value, setValue] = React.useState('month')
  return (
    <Tabs
      items={[
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'quarter', label: 'Quarter' },
        { value: 'year', label: 'Year' },
      ]}
      value={value}
      onValueChange={setValue}
    />
  )
}

function PeriodSelectorPreview(): React.JSX.Element {
  const [value, setValue] = React.useState('this-month')
  return <PeriodSelector value={value} onValueChange={setValue} />
}

function PaginationPreview(): React.JSX.Element {
  const [page, setPage] = React.useState(3)
  return <Pagination page={page} pageCount={10} onPageChange={setPage} siblingCount={1} />
}

// ---------------------------------------------------------------------------
// Variant type
// ---------------------------------------------------------------------------

export type Variant = { label: string; node: React.ReactNode }

// ---------------------------------------------------------------------------
// slug → ordered labeled variants per component
// ---------------------------------------------------------------------------
export const previews: Record<string, Variant[]> = {
  // --- core -----------------------------------------------------------------
  accordion: [
    { label: 'Example', node: (
      <Accordion
        items={[
          { value: 'billing', title: 'Billing & Payments', content: 'Manage your payment methods, view past invoices, and update billing information.' },
          { value: 'security', title: 'Security Settings', content: 'Configure two-factor authentication, review active sessions, and set password policies.' },
          { value: 'notifications', title: 'Notifications', content: 'Choose which events trigger email or push notifications for your account.' },
        ]}
        type="single"
        collapsible
        defaultValue="billing"
      />
    )},
  ],

  avatar: [
    { label: 'Sizes & status', node: (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name="Connor Adams" size="sm" />
        <Avatar name="Connor Adams" size="md" status="online" />
        <Avatar name="Connor Adams" size="lg" ring status="away" />
      </div>
    )},
  ],

  badge: [
    { label: 'Variants', node: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Paid</Badge>
        <Badge variant="warning">Due soon</Badge>
        <Badge variant="info">Heads up</Badge>
        <Badge variant="destructive">Overdue</Badge>
        <Badge variant="outline">Pending</Badge>
        <Badge variant="count">12</Badge>
      </div>
    )},
    { label: 'Sizes', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge size="default">Default</Badge>
          <Badge size="default" variant="secondary">Secondary</Badge>
          <Badge size="default" variant="success">Paid</Badge>
          <Badge size="default" variant="warning">Due soon</Badge>
          <Badge size="default" variant="info">Heads up</Badge>
          <Badge size="default" variant="destructive">Overdue</Badge>
          <Badge size="default" variant="outline">Pending</Badge>
          <Badge size="default" variant="count">12</Badge>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge size="sm">Default</Badge>
          <Badge size="sm" variant="secondary">Secondary</Badge>
          <Badge size="sm" variant="success">Paid</Badge>
          <Badge size="sm" variant="warning">Due soon</Badge>
          <Badge size="sm" variant="info">Heads up</Badge>
          <Badge size="sm" variant="destructive">Overdue</Badge>
          <Badge size="sm" variant="outline">Pending</Badge>
          <Badge size="sm" variant="count">12</Badge>
        </div>
      </div>
    )},
    { label: 'Status dot', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge dot>Default</Badge>
          <Badge variant="secondary" dot>Secondary</Badge>
          <Badge variant="success" dot>Connected</Badge>
          <Badge variant="warning" dot>Degraded</Badge>
          <Badge variant="info" dot>Streaming</Badge>
          <Badge variant="destructive" dot>Down</Badge>
          <Badge variant="outline" dot>Idle</Badge>
          <Badge variant="count" dot>12</Badge>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge size="sm" dot>Default</Badge>
          <Badge size="sm" variant="secondary" dot>Secondary</Badge>
          <Badge size="sm" variant="success" dot>Connected</Badge>
          <Badge size="sm" variant="warning" dot>Degraded</Badge>
          <Badge size="sm" variant="info" dot>Streaming</Badge>
          <Badge size="sm" variant="destructive" dot>Down</Badge>
          <Badge size="sm" variant="outline" dot>Idle</Badge>
          <Badge size="sm" variant="count" dot>12</Badge>
        </div>
      </div>
    )},
    { label: 'Pulse', node: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge variant="success" pulse>Live</Badge>
        <Badge variant="warning" pulse>Syncing</Badge>
        <Badge variant="info" pulse>Streaming</Badge>
        <Badge variant="destructive" pulse>Disconnected</Badge>
        <Badge variant="success" size="sm" pulse>Live</Badge>
      </div>
    )},
  ],

  button: [
    { label: 'Variants', node: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="default">default</Button>
        <Button variant="primary">primary</Button>
        <Button variant="secondary">secondary</Button>
        <Button variant="outline">outline</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="destructive">destructive</Button>
        <Button variant="link">link</Button>
      </div>
    )},
    { label: 'Sizes', node: (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    )},
    { label: 'Disabled', node: <Button disabled>Disabled</Button> },
  ],

  card: [
    { label: 'Example', node: (
      <Card style={{ maxWidth: 360 }}>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Your spending overview for June 2025.</CardDescription>
        </CardHeader>
        <CardContent>
          <p style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: 'var(--text-body)' }}>
            Total expenses: $3,240.00
          </p>
        </CardContent>
      </Card>
    )},
  ],

  icon: [
    { label: 'Color & size', node: (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ color: 'var(--positive)' }}><Icon name="trending-up" size={28} /></span>
        <span style={{ color: 'var(--destructive)' }}><Icon name="trending-down" size={28} /></span>
        <span style={{ color: 'var(--muted-foreground)' }}><Icon name="settings" size={28} /></span>
        <Icon name="wallet" size={16} />
        <Icon name="wallet" size={24} />
        <Icon name="wallet" size={32} />
      </div>
    )},
    { label: 'Brand marks', node: (
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <Icon name="brand:spotify" size={34} brand />
        <Icon name="brand:netflix" size={34} brand />
        <Icon name="brand:visa" size={34} brand />
        <Icon name="brand:paypal" size={34} brand />
        <Icon name="brand:cash-app" size={34} brand />
        <Icon name="brand:starbucks" size={34} brand />
      </div>
    )},
    { label: 'Media & audio', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--foreground)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Icon name="skip-back" size={24} />
          <Icon name="rewind" size={24} />
          <Icon name="play" size={24} />
          <Icon name="pause" size={24} />
          <Icon name="stop" size={24} />
          <Icon name="fast-forward" size={24} />
          <Icon name="skip-forward" size={24} />
          <Icon name="play-circle" size={24} />
          <Icon name="pause-circle" size={24} />
          <Icon name="shuffle" size={24} />
          <Icon name="repeat-1" size={24} />
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Icon name="volume-x" size={24} />
          <Icon name="volume-1" size={24} />
          <Icon name="volume" size={24} />
          <Icon name="mic" size={24} />
          <Icon name="mic-off" size={24} />
          <Icon name="headphones" size={24} />
          <Icon name="speaker" size={24} />
          <Icon name="cast" size={24} />
          <Icon name="airplay" size={24} />
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Icon name="music" size={24} />
          <Icon name="disc" size={24} />
          <Icon name="album" size={24} />
          <Icon name="radio" size={24} />
          <Icon name="podcast" size={24} />
          <Icon name="list-music" size={24} />
          <Icon name="audio-lines" size={24} />
        </div>
      </div>
    )},
    { label: 'Registry', node: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16, color: 'var(--foreground)' }}>
        {iconNames.map((name) => <Icon key={name} name={name} size={22} />)}
      </div>
    )},
  ],

  kbd: [
    { label: 'Example', node: (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Kbd>⌘K</Kbd>
        <Kbd>⌘⇧P</Kbd>
        <Kbd>Esc</Kbd>
      </div>
    )},
  ],

  link: [
    { label: 'Variants', node: (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href="#">View transactions</Link>
        <Link href="#" muted>Learn more</Link>
        <Link href="#" subtle>See details</Link>
      </div>
    )},
  ],

  progress: [
    { label: 'Tones', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
        <Progress value={60} />
        <Progress value={74} tone="warning" label="Dining" showValue />
        <Progress value={100} tone="success" />
      </div>
    )},
  ],

  separator: [
    { label: 'Example', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
        <Separator />
        <Separator label="or continue with" />
      </div>
    )},
  ],

  spinner: [
    { label: 'Sizes', node: (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Spinner size="sm" tone="muted" />
        <Spinner size="default" tone="primary" />
        <Spinner size="lg" />
      </div>
    )},
    { label: 'Gradient trail', node: (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Spinner size="lg" tone="gradient-current" />
        <Spinner size="lg" tone="gradient-primary" />
        <Spinner size="lg" tone="gradient-muted" />
      </div>
    )},
    { label: 'Hero', node: (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Spinner size="sm" tone="hero" />
        <Spinner size="default" tone="hero" />
        <Spinner size="lg" tone="hero" />
      </div>
    )},
  ],

  text: [
    { label: 'Variants', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text variant="headline">Monthly Budget Overview</Text>
        <Text variant="body" tone="muted">Last updated 2 hours ago</Text>
        <Text variant="body" tone="positive" weight="semibold">+$340.00</Text>
        <Text variant="body" tone="negative" weight="semibold">-$85.20</Text>
      </div>
    )},
  ],

  // --- data -----------------------------------------------------------------
  'letter-avatar': [
    { label: 'Sizes', node: (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <LetterAvatar text="TD Bank" size="sm" />
        <LetterAvatar text="Acme Corp" size="md" />
        <LetterAvatar text="Scotiabank" size="lg" />
        <LetterAvatar text="Royal Bank" size="xl" />
      </div>
    )},
  ],

  'stat-card': [
    { label: 'Example', node: (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="Total Spending" value="$3,240.00" delta="+$340" metricKind="spend" />
        <StatCard label="Total Income" value="$8,500.00" delta="+$650" metricKind="gain" hint="vs. last month" />
      </div>
    )},
  ],

  table: [
    { label: 'Example', node: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Jun 15</TableCell>
            <TableCell>Whole Foods Market</TableCell>
            <TableCell>Groceries</TableCell>
            <TableCell>−$94.32</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jun 14</TableCell>
            <TableCell>Acme Corp Payroll</TableCell>
            <TableCell>Income</TableCell>
            <TableCell>+$4,250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jun 13</TableCell>
            <TableCell>Netflix Subscription</TableCell>
            <TableCell>Subscriptions</TableCell>
            <TableCell>−$18.99</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )},
  ],

  tabs: [{ label: 'Interactive', node: <TabsPreview /> }],

  // --- feedback -------------------------------------------------------------
  alert: [
    { label: 'Variants', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 420 }}>
        <Alert variant="info" title="Heads up">
          Your bank connection will expire in 3 days. Reconnect to keep syncing.
        </Alert>
        <Alert variant="success" title="Import complete">
          147 transactions imported successfully.
        </Alert>
      </div>
    )},
  ],

  'empty-state': [
    { label: 'Example', node: (
      <EmptyState
        title="No transactions yet"
        description="Connect a bank account to start importing your transactions."
      />
    )},
  ],

  skeleton: [
    { label: 'Example', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <Skeleton h={24} w="60%" />
        <SkeletonText lines={3} />
      </div>
    )},
  ],

  // --- finance --------------------------------------------------------------
  'account-card': [
    { label: 'Example', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380 }}>
        <AccountCard
          name="TD Everyday Chequing"
          institution="TD"
          mask="4321"
          balance={4820.5}
          currency="CAD"
          locale="en-CA"
          kind="chequing"
          status="synced"
        />
        <AccountCard
          name="Scotiabank Visa"
          institution="Scotia"
          mask="7788"
          balance={-1480.25}
          kind="credit"
          status="synced"
        />
      </div>
    )},
  ],

  'amount-text': [
    { label: 'Example', node: (
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <AmountText value={4250} currency="CAD" locale="en-CA" direction="in" colored showSign />
        <AmountText value={-94.32} currency="CAD" locale="en-CA" direction="out" colored showSign />
      </div>
    )},
  ],

  'budget-meter': [
    { label: 'Example', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
        <BudgetMeter label="Groceries" spent={320} limit={500} currency="CAD" locale="en-CA" />
        <BudgetMeter label="Dining Out" spent={445} limit={500} currency="CAD" locale="en-CA" />
        <BudgetMeter label="Entertainment" spent={620} limit={400} currency="CAD" locale="en-CA" />
      </div>
    )},
  ],

  'category-breakdown': [
    { label: 'Spend, with trend', node: (
      <div style={{ width: '100%', maxWidth: 460 }}>
        <CategoryBreakdown
          title="Net spend by category"
          subtitle="This month · transfers excluded"
          trend={[12, 9, 14, 11, 18, 16, 22]}
          currency="CAD"
          locale="en-CA"
          rows={[
            { category: 'groceries', amount: -842 },
            { category: 'dining', amount: -586 },
            { category: 'transport', amount: -418 },
            { category: 'subscriptions', amount: -214 },
            { category: 'utilities', amount: -176 },
          ]}
        />
      </div>
    )},
    { label: 'Selectable rows', node: (
      <div style={{ width: '100%', maxWidth: 460 }}>
        <CategoryBreakdown
          title="Net spend by category"
          subtitle="Tap a row to filter"
          currency="CAD"
          locale="en-CA"
          onSelect={() => {}}
          rows={[
            { category: 'groceries', amount: -842 },
            { category: 'dining', amount: -586 },
            { category: 'transport', amount: -418 },
          ]}
        />
      </div>
    )},
  ],

  'category-pill': [
    { label: 'Example', node: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <CategoryPill category="groceries" />
        <CategoryPill category="income" />
        <CategoryPill category="dining" />
        <CategoryPill category="transport" />
        <CategoryPill category="subscriptions" />
      </div>
    )},
  ],

  'import-dropzone': [
    { label: 'Example', node: (
      <ImportDropzone accept=".csv,.ofx,.qfx" hint="CSV, OFX or QFX · up to 10MB" />
    )},
  ],

  'money-input': [
    { label: 'Example', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 240 }}>
        <MoneyInput currency="CAD" locale="en-CA" defaultValue={1250} direction="in" />
        <MoneyInput currency="CAD" locale="en-CA" defaultValue={94.32} direction="out" />
      </div>
    )},
  ],

  'period-selector': [{ label: 'Interactive', node: <PeriodSelectorPreview /> }],

  sparkline: [
    { label: 'Example', node: (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Sparkline data={[3, 7, 4, 9, 6, 11, 8]} width={96} height={28} area dot strokeWidth={2} />
        <Sparkline data={[11, 9, 8, 6, 5, 3, 2]} width={96} height={28} area dot strokeWidth={2} tone="negative" />
      </div>
    )},
  ],

  // --- forms ----------------------------------------------------------------
  checkbox: [
    { label: 'States', node: (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Checkbox />
        <Checkbox defaultChecked />
        <Checkbox indeterminate />
        <Checkbox disabled />
      </div>
    )},
  ],

  combobox: [
    { label: 'Example', node: (
      <Combobox
        options={[
          { value: 'checking', label: 'Checking', hint: '••4521' },
          { value: 'savings', label: 'Savings', hint: '••8830' },
          { value: 'credit', label: 'Credit Card', hint: '••1234' },
          { value: 'investment', label: 'Investment', hint: '••9977' },
        ]}
        placeholder="Search accounts…"
        defaultValue="savings"
      />
    )},
  ],

  input: [
    { label: 'States', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280 }}>
        <Input placeholder="Enter a value…" />
        <Input defaultValue="Hello, world" />
        <Input invalid defaultValue="bad input" />
      </div>
    )},
  ],

  label: [
    { label: 'Example', node: (
      <Label htmlFor="acct-preview">
        Account name
        <Input id="acct-preview" placeholder="e.g. My Checking" />
      </Label>
    )},
  ],

  'native-select': [
    { label: 'Example', node: (
      <NativeSelect
        options={[
          { value: 'food', label: 'Food & Dining' },
          { value: 'transport', label: 'Transportation' },
          { value: 'housing', label: 'Housing' },
          { value: 'entertainment', label: 'Entertainment' },
          { value: 'health', label: 'Health & Wellness' },
        ]}
      />
    )},
  ],

  'radio-group': [
    { label: 'Example', node: (
      <RadioGroup
        options={[
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
        defaultValue="monthly"
      />
    )},
  ],

  slider: [
    { label: 'Example', node: (
      <div style={{ maxWidth: 280 }}>
        <Slider min={0} max={100} defaultValue={40} showValue />
      </div>
    )},
  ],

  stepper: [
    { label: 'Example', node: <Stepper defaultValue={3} min={0} max={20} /> },
  ],

  switch: [
    { label: 'States', node: (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Switch />
        <Switch defaultChecked />
        <Switch size="sm" defaultChecked />
        <Switch disabled />
      </div>
    )},
  ],

  textarea: [
    { label: 'Example', node: (
      <Textarea
        placeholder="Add a note…"
        defaultValue="Transfer to savings for upcoming vacation fund."
        style={{ maxWidth: 320 }}
      />
    )},
  ],

  'toggle-group': [
    { label: 'Example', node: (
      <ToggleGroup
        items={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
          { value: 'chart', label: 'Chart' },
        ]}
        defaultValue="list"
      />
    )},
  ],

  // --- navigation -----------------------------------------------------------
  breadcrumb: [
    { label: 'Example', node: (
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Accounts', href: '/accounts' },
          { label: 'Transactions' },
        ]}
      />
    )},
  ],

  pagination: [{ label: 'Interactive', node: <PaginationPreview /> }],

  // --- overlays -------------------------------------------------------------
  dialog: [
    { label: 'Example', node: (
      // `transform` establishes a containing block so the Dialog's position:fixed
      // scrim is contained to this preview cell instead of covering the whole page.
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', borderRadius: 'var(--radius-md)', transform: 'translateZ(0)' }}>
        <Dialog
          open
          title="Confirm action"
          description="This action cannot be undone. Are you sure you want to continue?"
        />
      </div>
    )},
  ],

  'dropdown-menu': [
    { label: 'Example', node: (
      <DropdownMenu
        trigger={
          <button
            type="button"
            style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--card)', cursor: 'pointer' }}
          >
            Options ▾
          </button>
        }
        items={[
          { label: 'Edit', shortcut: '⌘E', onSelect: () => {} },
          { label: 'Duplicate', shortcut: '⌘D', onSelect: () => {} },
          { separator: true },
          { label: 'Share', onSelect: () => {} },
          { separator: true },
          { label: 'Delete', danger: true, onSelect: () => {} },
        ]}
        align="start"
      />
    )},
  ],

  toast: [
    { label: 'Variants', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Toast variant="success" title="Transaction imported">
          142 transactions were added to your account.
        </Toast>
        <Toast variant="warning" title="Budget exceeded">
          You have exceeded your monthly dining budget by $24.
        </Toast>
      </div>
    )},
  ],

  tooltip: [
    { label: 'Example', node: (
      <Tooltip content="Helpful information" side="top">
        <button
          type="button"
          style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--card)', cursor: 'pointer' }}
        >
          Hover me
        </button>
      </Tooltip>
    )},
  ],
}
