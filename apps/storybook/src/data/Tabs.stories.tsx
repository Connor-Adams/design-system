import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from '@connor-adams/designsystem'

const PERIOD_ITEMS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

/** A deliberately long bar — the case that used to wrap onto several rows. */
const MANY_ITEMS = [
  'Summary',
  'Commands',
  'Sounds',
  'Users',
  'Guilds',
  'Queue',
  'Time Trends',
  'History',
  'Sessions',
  'Performance',
  'Errors',
  'Retention',
  'Search',
  'User Sessions',
  'User Tracks',
  'Engagement',
  'Interactions',
  'Playback States',
  'Web Analytics',
  'Guild Events',
  'API Latency',
].map((label) => ({ value: label.toLowerCase().replace(/ /g, '-'), label }))

const meta: Meta<typeof Tabs> = {
  title: 'Data/Tabs',
  component: Tabs,
  args: {
    items: PERIOD_ITEMS,
    value: 'month',
  },
}
export default meta

type Story = StoryObj<typeof Tabs>

export const Default: Story = {}

export const AccountView: Story = {
  render: () => {
    const [value, setValue] = React.useState('transactions')
    return (
      <Tabs
        items={[
          { value: 'transactions', label: 'Transactions' },
          { value: 'budgets', label: 'Budgets' },
          { value: 'analytics', label: 'Analytics' },
        ]}
        value={value}
        onValueChange={setValue}
      />
    )
  },
}

/** Default overflow. 21 tabs in a 480px box wrap onto several rows. */
export const OverflowWrap: Story = {
  render: () => {
    const [value, setValue] = React.useState('summary')
    return (
      <div style={{ width: 480 }}>
        <Tabs items={MANY_ITEMS} value={value} onValueChange={setValue} />
      </div>
    )
  },
}

/**
 * `overflow="scroll"` — one row, horizontal scroll, edges fade out while there
 * is more off-screen, and the selected pill is scrolled into view. Arrow through
 * it: focus (and selection) walks the row and drags the scroll along.
 */
export const OverflowScroll: Story = {
  render: () => {
    const [value, setValue] = React.useState('summary')
    return (
      <div style={{ width: 480 }}>
        <Tabs items={MANY_ITEMS} value={value} onValueChange={setValue} overflow="scroll" />
      </div>
    )
  },
}

/** Jump straight to a far-off tab — it scrolls itself into view. */
export const ScrollsSelectionIntoView: Story = {
  render: () => {
    const [value, setValue] = React.useState('summary')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 480 }}>
        <Tabs items={MANY_ITEMS} value={value} onValueChange={setValue} overflow="scroll" />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setValue('summary')}>
            Select first
          </button>
          <button type="button" onClick={() => setValue('api-latency')}>
            Select last
          </button>
        </div>
      </div>
    )
  },
}

/**
 * Panels stay the consumer's. `panelId` wires each tab's `aria-controls`, and
 * `tabId` pins the trigger's `id` so the panel can point back with
 * `aria-labelledby`.
 */
export const WithPanels: Story = {
  render: () => {
    const [value, setValue] = React.useState('all')
    const items = [
      { value: 'all', label: 'All', tabId: 'tab-all', panelId: 'panel-all' },
      { value: 'business', label: 'Business', tabId: 'tab-business', panelId: 'panel-business' },
      { value: 'personal', label: 'Personal', tabId: 'tab-personal', panelId: 'panel-personal' },
    ]
    const active = items.find((item) => item.value === value)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Tabs items={items} value={value} onValueChange={setValue} />
        <div id={active?.panelId} role="tabpanel" aria-labelledby={active?.tabId} tabIndex={0}>
          Showing <strong>{value}</strong> transactions.
        </div>
      </div>
    )
  },
}
