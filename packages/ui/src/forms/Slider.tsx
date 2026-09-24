import * as React from 'react'
import { splitControlProps } from './fieldProps'
import './Slider.css'

/**
 * Single-value range slider — oxblood fill, card thumb. Controlled via `value`
 * + `onValueChange`, or uncontrolled via `defaultValue`. `showValue` prints the
 * current value; pass `format` to format it (e.g. as currency).
 *
 * Static visuals and the focus-visible ring live in `Slider.css`; only the
 * dynamic fill/thumb position is set inline via `--ca-slider-pct`. The ref
 * forwards to the underlying `input[type=range]`.
 *
 * `id`, `name` and the labelling/validation `aria-*` attributes are routed to
 * that `input[type=range]` — the element that takes focus — so a `<label
 * htmlFor>` (or a `Field` wrapper injecting them) actually associates. Layout
 * props (`className`, `style`, `data-*`, handlers) stay on the wrapper.
 */
export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Form control name — forwarded to the inner `input[type=range]`. */
  name?: string
  disabled?: boolean
  showValue?: boolean
  format?: (value: number) => React.ReactNode
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { min = 0, max = 100, step = 1, value, defaultValue = 0, onValueChange, disabled, showValue = false, format, className, style, ...rest },
  ref,
): React.JSX.Element {
  const { control, wrapper } = splitControlProps(rest)
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const v = isControlled ? value : internal
  const pct = ((v - min) / (max - min)) * 100

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value)
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="slider"
      data-disabled={disabled || undefined}
      className={className ? `ca-slider ${className}` : 'ca-slider'}
      style={{ ['--ca-slider-pct' as string]: `${pct}%`, ...style }}
      {...wrapper}
    >
      {showValue && <div className="ca-slider-value">{format ? format(v) : v}</div>}
      <div className="ca-slider-track">
        <div className="ca-slider-rail" />
        <div className="ca-slider-fill" />
        <input
          ref={ref}
          className="ca-slider-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          disabled={disabled}
          onChange={onInput}
          {...control}
        />
        <div className="ca-slider-thumb" />
      </div>
    </div>
  )
})
