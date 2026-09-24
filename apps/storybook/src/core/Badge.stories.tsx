import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@connor-adams/designsystem'

const meta: Meta<typeof Badge> = {
  title: 'Core/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'success',
        'warning',
        'info',
        'count',
      ],
    },
    size: { control: 'inline-radio', options: ['sm', 'default'] },
    dot: { control: 'boolean' },
    pulse: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Badge>

const VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'success',
  'warning',
  'info',
  'count',
] as const

const row: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
}
const cap: CSSProperties = {
  margin: '0 0 6px',
  fontSize: 'var(--text-label)',
  textTransform: 'uppercase',
  letterSpacing: '.04em',
  fontWeight: 600,
  color: 'var(--muted-foreground)',
}

export const Default: Story = {}
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } }
export const Success: Story = { args: { variant: 'success', children: 'Paid' } }
export const Warning: Story = { args: { variant: 'warning', children: 'Due soon' } }
export const Info: Story = { args: { variant: 'info', children: 'Heads up' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Overdue' } }
export const Outline: Story = { args: { variant: 'outline', children: 'Pending' } }
export const Count: Story = { args: { variant: 'count', children: '12' } }

export const Small: Story = { args: { size: 'sm', variant: 'secondary', children: 'CAD' } }
export const WithDot: Story = { args: { variant: 'success', dot: true, children: 'Connected' } }
export const Pulsing: Story = { args: { variant: 'success', pulse: true, children: 'Live' } }

/** Every variant at both sizes — the size × variant matrix. */
export const SizeMatrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {(['default', 'sm'] as const).map((size) => (
        <div key={size}>
          <p style={cap}>size = {size}</p>
          <div style={row}>
            {VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant} size={size}>
                {variant === 'count' ? '12' : variant}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

/** `dot` tints from the variant; `pulse` animates it (and implies `dot`). */
export const StatusDots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <p style={cap}>dot</p>
        <div style={row}>
          {VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant} dot>
              {variant === 'count' ? '12' : variant}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p style={cap}>dot · size = sm</p>
        <div style={row}>
          {VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant} size="sm" dot>
              {variant === 'count' ? '12' : variant}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p style={cap}>pulse (frozen under prefers-reduced-motion)</p>
        <div style={row}>
          <Badge variant="success" pulse>
            Live
          </Badge>
          <Badge variant="warning" pulse>
            Syncing
          </Badge>
          <Badge variant="info" pulse>
            Streaming
          </Badge>
          <Badge variant="destructive" pulse>
            Disconnected
          </Badge>
          <Badge variant="success" size="sm" pulse>
            Live
          </Badge>
        </div>
      </div>
    </div>
  ),
}
