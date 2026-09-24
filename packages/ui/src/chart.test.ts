import { chartColors, chartTheme, chartColor, chartLineColor } from './chart'

// Every value the palette hands a charting library must be a CSS var()
// reference, never a resolved color — that is the whole point of the module:
// the chart stays theme- and brand-reactive with no JS theme detection.
const VAR_REF = /var\(--[a-z0-9-]+\)/

describe('chartColors', () => {
  it('exposes a 5-step categorical ramp of var() strings', () => {
    expect(chartColors.categorical).toHaveLength(5)
    for (const c of chartColors.categorical) expect(c).toMatch(VAR_REF)
  })

  it('exposes a 6-step line ramp of var() strings', () => {
    expect(chartColors.line).toHaveLength(6)
    for (const c of chartColors.line) expect(c).toMatch(VAR_REF)
  })

  it('exposes the domain aliases defined in the token layer', () => {
    expect(chartColors.domain).toEqual({
      spend: 'var(--chart-spend)',
      credit: 'var(--chart-credit)',
      payment: 'var(--chart-payment)',
      business: 'var(--chart-business)',
      personal: 'var(--chart-personal)',
    })
  })

  it('points the ramps at the --chart-N / --chart-line-N tokens in order', () => {
    expect(chartColors.categorical[0]).toBe('var(--chart-1)')
    expect(chartColors.categorical[4]).toBe('var(--chart-5)')
    expect(chartColors.line[0]).toBe('var(--chart-line-1)')
    expect(chartColors.line[5]).toBe('var(--chart-line-6)')
  })
})

describe('chartColor / chartLineColor', () => {
  it('indexes the ramp', () => {
    expect(chartColor(0)).toBe('var(--chart-1)')
    expect(chartLineColor(2)).toBe('var(--chart-line-3)')
  })

  it('wraps around instead of returning undefined', () => {
    expect(chartColor(5)).toBe('var(--chart-1)')
    expect(chartColor(7)).toBe('var(--chart-3)')
    expect(chartLineColor(6)).toBe('var(--chart-line-1)')
  })

  it('tolerates negative and fractional indices', () => {
    expect(chartColor(-1)).toBe('var(--chart-5)')
    expect(chartColor(1.7)).toBe('var(--chart-2)')
  })
})

describe('chartTheme', () => {
  it('carries the colors', () => {
    expect(chartTheme.colors).toBe(chartColors)
  })

  it('themes axis tick text and the axis line through tokens', () => {
    expect(chartTheme.axis.tick.fill).toBe('var(--muted-foreground)')
    expect(chartTheme.axis.tick.fontSize).toMatch(VAR_REF)
    expect(chartTheme.axis.tick.fontFamily).toBe('var(--font-sans)')
    expect(chartTheme.axis.stroke).toBe('var(--border)')
  })

  it('themes grid lines through tokens', () => {
    expect(chartTheme.grid.stroke).toMatch(VAR_REF)
    expect(chartTheme.grid.strokeDasharray).toBe('3 3')
  })

  it('themes the tooltip surface, border and text through tokens', () => {
    const { contentStyle, labelStyle, itemStyle } = chartTheme.tooltip
    expect(contentStyle.background).toBe('var(--popover)')
    expect(contentStyle.border).toBe('1px solid var(--border)')
    expect(contentStyle.borderRadius).toMatch(VAR_REF)
    expect(contentStyle.boxShadow).toBe('var(--shadow)')
    expect(contentStyle.color).toBe('var(--popover-foreground)')
    expect(labelStyle.color).toBe('var(--foreground)')
    expect(itemStyle.color).toBe('var(--popover-foreground)')
  })

  it('contains no resolved color literals anywhere', () => {
    const flat = JSON.stringify(chartTheme)
    expect(flat).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(flat).not.toMatch(/\brgba?\(/)
    expect(flat).not.toMatch(/\bhsla?\(/)
  })
})
