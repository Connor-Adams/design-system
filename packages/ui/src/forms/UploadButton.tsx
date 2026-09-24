import * as React from 'react'
import { Button } from '../core/Button'
import type { ButtonSize, ButtonVariant } from '../core/Button'
import { Spinner } from '../core/Spinner'
import { selectFiles } from './fileSelect'
import type { FileRejection } from './fileSelect'
import './UploadButton.css'

/**
 * A file picker that looks like a Button. Wraps the hidden-`<input type="file">`
 * plus proxy-button pattern every app otherwise rebuilds by hand, and gets the
 * two details that hand-rolled copies usually miss:
 *
 * - the input's `value` is reset after every selection, so picking the *same*
 *   file twice in a row still fires `onFiles` the second time;
 * - `aria-busy` is set while `loading`, so assistive tech hears the upload.
 *
 * It composes `core/Button` rather than restyling a button, so `variant` and
 * `size` are the Button's own and every interactive state comes from
 * `Button.css`. Selections are validated with the shared `fileSelect` rules;
 * anything turned away goes to `onError`, never silently to `onFiles`.
 */
export interface UploadButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onError' | 'value'> {
  /** `accept` attribute for the input, e.g. `.csv,.ofx` or `audio/*`. */
  accept?: string
  /** Allow picking more than one file. */
  multiple?: boolean
  /** Hard byte ceiling; files over it are rejected instead of handed over. */
  maxSize?: number
  /** Called with the accepted files after every selection. */
  onFiles?: (files: File[]) => void
  /** Called with anything `accept`/`maxSize` turned away. */
  onError?: (rejections: FileRejection[]) => void
  /** Upload in flight — disables the control and sets `aria-busy`. */
  loading?: boolean
  /** Button treatment. Forwarded to `core/Button`. */
  variant?: ButtonVariant
  /** Button size. Forwarded to `core/Button`. */
  size?: ButtonSize
  /** Leading node, swapped for a Spinner while `loading`. Icons are nodes — no icon dep. */
  icon?: React.ReactNode
  /** Label shown while `loading`; falls back to `children`. */
  loadingLabel?: React.ReactNode
  /** Escape hatch onto the hidden input (e.g. to clear it imperatively). */
  inputRef?: React.Ref<HTMLInputElement>
  /** Extra attributes for the hidden input. */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'accept' | 'multiple' | 'onChange' | 'ref'
  >
}

export const UploadButton = React.forwardRef<HTMLButtonElement, UploadButtonProps>(
  function UploadButton(
    {
      accept,
      multiple = false,
      maxSize,
      onFiles,
      onError,
      loading = false,
      disabled = false,
      variant = 'secondary',
      size = 'default',
      icon,
      loadingLabel,
      inputRef,
      inputProps,
      className,
      children = 'Upload',
      onClick,
      ...props
    },
    ref,
  ): React.JSX.Element {
    const input = React.useRef<HTMLInputElement | null>(null)
    const busy = loading

    const attachInput = (node: HTMLInputElement | null): void => {
      input.current = node
      if (typeof inputRef === 'function') inputRef(node)
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { accepted, rejected } = selectFiles(event.target.files, { accept, maxSize, multiple })
      // Reset before reporting: the same file re-picked must fire `change` again,
      // and an early return in a consumer callback must not skip the reset.
      event.target.value = ''
      if (rejected.length > 0) onError?.(rejected)
      if (accepted.length > 0) onFiles?.(accepted)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.(event)
      if (event.defaultPrevented) return
      input.current?.click()
    }

    return (
      <>
        <input
          ref={attachInput}
          type="file"
          accept={accept}
          multiple={multiple}
          tabIndex={-1}
          data-slot="upload-button-input"
          className="ca-upload-button-input"
          onChange={handleChange}
          {...inputProps}
        />
        <Button
          ref={ref}
          variant={variant}
          size={size}
          disabled={disabled || busy}
          aria-busy={busy ? true : undefined}
          data-slot="upload-button"
          data-loading={busy ? 'true' : undefined}
          className={className ? `ca-upload-button ${className}` : 'ca-upload-button'}
          onClick={handleClick}
          {...props}
        >
          {busy ? <Spinner size="sm" label="Uploading" /> : icon}
          <span className="ca-upload-button-label">{busy ? (loadingLabel ?? children) : children}</span>
        </Button>
      </>
    )
  },
)
