import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  type CardPadding,
  type CardVariant,
} from '@connor-adams/designsystem'

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
  args: {},
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'nested', 'plain'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'default', 'lg'] },
    radius: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
  },
}
export default meta

type Story = StoryObj<typeof Card>

const money: React.CSSProperties = {
  margin: 0,
  color: 'var(--muted-foreground)',
  fontSize: 'var(--text-body)',
}

const VARIANTS: CardVariant[] = ['default', 'nested', 'plain']
const PADDINGS: CardPadding[] = ['none', 'sm', 'default', 'lg']

/** No props — must look exactly as it always has (20px padding, radius-lg, shadow). */
export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
        <CardDescription>Your spending overview for June 2025.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={money}>Total expenses: $3,240.00</p>
      </CardContent>
    </Card>
  ),
}

export const Minimal: Story = {
  render: () => (
    <Card style={{ maxWidth: 280 }}>
      <CardContent>Simple card content.</CardContent>
    </Card>
  ),
}

/** The header's trailing `actions` slot — title/description still stack on the leading edge. */
export const HeaderActions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 460 }}>
      <Card>
        <CardHeader actions={<Button size="sm" variant="secondary">Export</Button>}>
          <CardTitle>Spending by category</CardTitle>
          <CardDescription>June 2025 · CAD</CardDescription>
        </CardHeader>
        <CardContent>
          <p style={money}>$3,240.00 across 8 categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          actions={
            <>
              <Button size="sm" variant="ghost">
                Month
              </Button>
              <Button size="sm" variant="secondary">
                Year
              </Button>
            </>
          }
        >
          <CardTitle>Cash flow</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={money}>Title-only header, two actions.</p>
        </CardContent>
      </Card>
    </div>
  ),
}

/** Every variant × every padding step. */
export const VariantsAndPadding: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {VARIANTS.map((variant) => (
        <div key={variant}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 'var(--text-label)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              fontWeight: 600,
              color: 'var(--muted-foreground)',
            }}
          >
            {variant}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {PADDINGS.map((padding) => (
              <Card key={padding} variant={variant} padding={padding} style={{ minWidth: 150 }}>
                <CardTitle>{padding}</CardTitle>
                <CardContent>
                  <p style={money}>padding=&quot;{padding}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

/** Radius is orthogonal to variant — a bordered panel ships at both lg and xl downstream. */
export const Radius: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {(['md', 'lg', 'xl'] as const).map((radius) => (
        <Card key={radius} radius={radius} style={{ minWidth: 150 }}>
          <CardTitle>radius={radius}</CardTitle>
        </Card>
      ))}
    </div>
  ),
}

/** The reason `nested` exists: a settings card inside a page panel, no stacked shadow. */
export const NestedComposition: Story = {
  render: () => (
    <Card padding="lg" radius="xl" style={{ maxWidth: 460 }}>
      <CardHeader actions={<Button size="sm" variant="ghost">Edit</Button>}>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Two connected, one needs attention.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: 'grid', gap: 12 }}>
        <Card variant="nested" padding="sm" radius="xl">
          <CardTitle style={{ fontSize: 'var(--text-body)' }}>Chequing · 4021</CardTitle>
          <CardDescription>Synced 6 minutes ago</CardDescription>
        </Card>
        <Card variant="nested" padding="sm" radius="xl">
          <CardTitle style={{ fontSize: 'var(--text-body)' }}>Visa · 8842</CardTitle>
          <CardDescription>Re-authentication required</CardDescription>
        </Card>
      </CardContent>
    </Card>
  ),
}

/** `plain` keeps the padding/typography contract but drops the frame. */
export const Plain: Story = {
  render: () => (
    <div
      style={{
        border: '1px dashed var(--input)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: 400,
      }}
    >
      <Card variant="plain">
        <CardHeader actions={<Button size="sm" variant="ghost">Refresh</Button>}>
          <CardTitle>Consumer-supplied frame</CardTitle>
          <CardDescription>No border, no shadow, no fill.</CardDescription>
        </CardHeader>
        <CardContent>
          <p style={money}>The dashed outline is the consumer&apos;s, not the card&apos;s.</p>
        </CardContent>
      </Card>
    </div>
  ),
}
