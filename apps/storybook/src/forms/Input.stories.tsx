import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '@connor-adams/designsystem'

// Icons arrive as nodes — this package has no icon dependency.
const SearchGlyph = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const LockGlyph = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  args: {
    placeholder: 'Enter a value…',
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Hello, world' } }
export const Invalid: Story = { args: { invalid: true, defaultValue: 'bad input' } }
export const Disabled: Story = { args: { disabled: true, placeholder: 'Disabled' } }

export const LeadingIcon: Story = {
  args: { leadingIcon: SearchGlyph, placeholder: 'Search transactions…' },
}

export const TrailingIcon: Story = {
  args: { trailingIcon: LockGlyph, defaultValue: 'read-only-ish', placeholder: 'Locked field' },
}

/** Search-field shape: leading icon + a real clear button that appears once there is something to clear. */
export const Searchable: Story = {
  args: {
    leadingIcon: SearchGlyph,
    clearable: true,
    clearLabel: 'Clear search',
    placeholder: 'Search sounds…',
    defaultValue: 'kick drum',
  },
}

/** Clearable while empty: the button stays in the layout but is disabled and out of the tab order. */
export const ClearableEmpty: Story = {
  args: { leadingIcon: SearchGlyph, clearable: true, placeholder: 'Search sounds…' },
}

/** Both trailing slots occupied — padding is reserved in CSS, not measured in JS. */
export const ClearableWithTrailingIcon: Story = {
  args: { clearable: true, trailingIcon: LockGlyph, defaultValue: 'secret', placeholder: 'Value' },
}
