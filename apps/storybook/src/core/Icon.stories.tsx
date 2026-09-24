import type { Meta, StoryObj } from '@storybook/react'
import { Icon, iconNames } from '@connor-adams/designsystem'

const meta: Meta<typeof Icon> = {
  title: 'Core/Icon',
  component: Icon,
  args: { name: 'wallet', size: 24 },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: { type: 'number', min: 12, max: 64, step: 2 } },
    strokeWidth: { control: { type: 'number', min: 1, max: 3, step: 0.25 } },
    brand: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Icon>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icon name="trending-up" size={16} />
      <Icon name="trending-up" size={24} />
      <Icon name="trending-up" size={32} />
      <Icon name="trending-up" size={48} />
    </div>
  ),
}

export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <span style={{ color: 'var(--positive)' }}><Icon name="trending-up" size={28} /></span>
      <span style={{ color: 'var(--destructive)' }}><Icon name="trending-down" size={28} /></span>
      <span style={{ color: 'var(--muted-foreground)' }}><Icon name="settings" size={28} /></span>
    </div>
  ),
}

export const BrandMarks: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <Icon name="brand:spotify" size={36} brand />
      <Icon name="brand:netflix" size={36} brand />
      <Icon name="brand:visa" size={36} brand />
      <Icon name="brand:paypal" size={36} brand />
      <Icon name="brand:cash-app" size={36} brand />
      <Icon name="brand:starbucks" size={36} brand />
    </div>
  ),
}

export const MediaSet: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
  ),
}

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18 }}>
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 'var(--text-label)', color: 'var(--muted-foreground)' }}>
          <Icon name={name} size={24} />
          <span style={{ textAlign: 'center' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
}
