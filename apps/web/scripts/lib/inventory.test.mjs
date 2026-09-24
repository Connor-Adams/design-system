import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summaryFromUsage, buildInventory } from './inventory.mjs'

test('summaryFromUsage: strips heading markers and picks first non-empty line', () => {
  assert.equal(summaryFromUsage('\n\n# Button\n\nMore text'), 'Button')
  assert.equal(summaryFromUsage('Plain first line\nsecond'), 'Plain first line')
  assert.equal(summaryFromUsage('   \n  ## Heading two  \n'), 'Heading two')
  assert.equal(summaryFromUsage(''), '')
  assert.equal(summaryFromUsage('   \n  '), '')
  assert.equal(summaryFromUsage('One-line: Small pill for status.'), 'Small pill for status.')
  assert.equal(summaryFromUsage('one-line:   tight spacing'), 'tight spacing')
})

const FIXTURE = {
  manifest: [
    { slug: 'button', name: 'Button', category: 'core' },
    { slug: 'badge', name: 'Badge', category: 'core' },
    { slug: 'money-input', name: 'MoneyInput', category: 'forms' },
  ],
  props: {
    Button: [
      { name: 'variant', type: '"primary" | "ghost"', required: false, defaultValue: 'primary', description: 'Visual style' },
      { name: 'size', type: 'string', required: false, defaultValue: null, description: '' },
    ],
    // Badge intentionally has no props entry
    // More than six props on purpose: llms.txt must list every one of them.
    MoneyInput: [
      { name: 'value', type: 'number', required: true, defaultValue: null, description: '' },
      { name: 'onValueChange', type: '(v: number) => void', required: false, defaultValue: null, description: '' },
      { name: 'currency', type: 'string', required: false, defaultValue: 'CAD', description: '' },
      { name: 'locale', type: 'string', required: false, defaultValue: null, description: '' },
      { name: 'direction', type: "'in' | 'out'", required: false, defaultValue: null, description: '' },
      { name: 'onDirectionChange', type: '(d: string) => void', required: false, defaultValue: null, description: '' },
      { name: 'size', type: "'sm' | 'default'", required: false, defaultValue: 'default', description: '' },
      { name: 'invalid', type: 'boolean', required: false, defaultValue: 'false', description: '' },
    ],
  },
  usage: {
    button: 'Clickable action trigger.',
    // badge intentionally missing
    'money-input': 'Currency-aware numeric field.',
  },
  version: '0.3.1',
  categories: ['core', 'data', 'feedback', 'finance', 'forms', 'navigation', 'overlays'],
  packageName: '@connor-adams/designsystem',
}

test('buildInventory json: one entry per manifest item, sorted by name within category', () => {
  const { json } = buildInventory({ ...FIXTURE, base: '' })
  assert.equal(json.package, '@connor-adams/designsystem')
  assert.equal(json.version, '0.3.1')
  assert.equal(json.components.length, 3)
  // core sorted by name: Badge before Button
  assert.deepEqual(
    json.components.filter((c) => c.category === 'core').map((c) => c.name),
    ['Badge', 'Button'],
  )
})

test('buildInventory json: docs url, summary fallback, props passthrough', () => {
  const { json } = buildInventory({ ...FIXTURE, base: 'https://ds.example.com' })
  const button = json.components.find((c) => c.name === 'Button')
  assert.equal(button.docs, 'https://ds.example.com/components/button')
  assert.equal(button.summary, 'Clickable action trigger.')
  assert.equal(button.props.length, 2)
  const badge = json.components.find((c) => c.name === 'Badge')
  assert.equal(badge.summary, 'Badge component') // no usage → fallback
  assert.deepEqual(badge.props, []) // no props entry → empty array
})

test('buildInventory json: relative docs url when base empty', () => {
  const { json } = buildInventory({ ...FIXTURE, base: '' })
  assert.equal(json.components.find((c) => c.name === 'Button').docs, '/components/button')
})

test('buildInventory llmsTxt: header counts, category sections, bullet + props format', () => {
  const { llmsTxt } = buildInventory({ ...FIXTURE, base: '' })
  assert.match(llmsTxt, /^# Cashflow Design System/)
  // 3 components across 2 non-empty categories (core, forms)
  assert.match(llmsTxt, /3 components across 2 categories/)
  assert.match(llmsTxt, /Full inventory with prop schemas: \/components\.json/)
  assert.match(llmsTxt, /\n## Core\n/)
  assert.match(llmsTxt, /\n## Forms\n/)
  assert.ok(!/## Data/.test(llmsTxt), 'empty categories omitted')
  assert.match(llmsTxt, /- \[Button\]\(\/components\/button\): Clickable action trigger\. Props: variant, size\./)
  // Badge: no props → no trailing "Props:" segment
  assert.match(llmsTxt, /- \[Badge\]\(\/components\/badge\): Badge component\.\n/)
})

test('buildInventory llmsTxt: lists every prop, no truncation', () => {
  const { llmsTxt } = buildInventory({ ...FIXTURE, base: '' })
  const line = llmsTxt.split('\n').find((l) => l.startsWith('- [MoneyInput]'))
  assert.ok(line, 'MoneyInput bullet present')
  const listed = line.split('Props: ')[1].replace(/\.$/, '').split(', ')
  assert.deepEqual(listed, FIXTURE.props.MoneyInput.map((p) => p.name))
})
