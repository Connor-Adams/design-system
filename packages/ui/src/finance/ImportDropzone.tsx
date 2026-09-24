import * as React from 'react'
import { UploadButton } from '../forms/UploadButton'
import { formatFileSize, selectFiles } from '../forms/fileSelect'
import type { FileRejection } from '../forms/fileSelect'
import './ImportDropzone.css'

/**
 * Drop target for file intake — drag-and-drop or click-to-browse. Named for its
 * first job (bank statements) and still defaulted for it, but every piece of copy
 * is a slot, so it works for receipts, audio, or anything else without a
 * `className` hack.
 *
 * The click/keyboard path is a real `UploadButton` filling the surface rather
 * than `role="button"` on the wrapper: one labelled control, native Enter/Space,
 * no nested interactive elements. Drops are validated through the same
 * `fileSelect` rules as picks, so a dragged `.pdf` is rejected exactly like a
 * browsed one; rejections are announced in a polite live region and reported to
 * `onError`.
 *
 * Selection is uncontrolled by default and controlled whenever `files` is passed
 * — `files={[]}` or `files={null}` clears it from outside. Drag-over state is
 * genuine component state and is reflected as `data-drag` for `ImportDropzone.css`;
 * nothing about styling lives in JS.
 */

/** A file this dropzone turned away, and why. */
export type ImportDropzoneRejection = FileRejection

export interface ImportDropzoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  /** Accepted types, `accept`-attribute syntax. Enforced on drop as well as on browse. */
  accept?: string
  /** Allow more than one file per selection. */
  multiple?: boolean
  /** Hard byte ceiling, enforced on both intake paths. Omit for no limit. */
  maxSize?: number
  /** Legacy singular callback — receives the first accepted file. Still supported. */
  onFile?: (file: File) => void
  /** Receives every accepted file from a selection. */
  onFiles?: (files: File[]) => void
  /** Receives anything `accept`/`maxSize` turned away, from either intake path. */
  onError?: (rejections: ImportDropzoneRejection[]) => void
  /** Secondary line under the primary copy. */
  hint?: React.ReactNode
  /** Primary copy. Defaults to the statement-import wording. */
  label?: React.ReactNode
  /** Alias for `label`, for callers who prefer a child. */
  children?: React.ReactNode
  /** The replace affordance shown next to the size once a file is chosen. */
  replaceLabel?: React.ReactNode
  /** Controlled selection. Passing this (including `[]`/`null`) takes ownership. */
  files?: readonly File[] | null
  /** Refuse both intake paths and dim the surface. */
  disabled?: boolean
}

const DEFAULT_LABEL = (
  <>
    Drop a statement, or <span className="ca-import-dropzone-browse">browse</span>
  </>
)

export const ImportDropzone = React.forwardRef<HTMLDivElement, ImportDropzoneProps>(
  function ImportDropzone(
    {
      accept = '.csv,.ofx,.qfx',
      multiple = false,
      maxSize,
      onFile,
      onFiles,
      onError,
      hint = 'CSV, OFX or QFX · up to 10MB',
      label,
      children,
      replaceLabel = 'click to replace',
      files,
      disabled = false,
      className,
      style,
      ...props
    },
    ref,
  ): React.JSX.Element {
    const [drag, setDrag] = React.useState<boolean>(false)
    const [internal, setInternal] = React.useState<readonly File[]>([])
    const [announcement, setAnnouncement] = React.useState<string>('')

    const controlled = files !== undefined
    const selected = controlled ? (files ?? []) : internal

    const reject = (rejections: FileRejection[]): void => {
      if (rejections.length === 0) return
      setAnnouncement(rejections.map((r) => r.message).join(' '))
      onError?.(rejections)
    }

    const take = (accepted: File[]): void => {
      if (accepted.length === 0) return
      setAnnouncement('')
      if (!controlled) setInternal(accepted)
      onFiles?.(accepted)
      const first = accepted[0]
      if (first) onFile?.(first)
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault()
      setDrag(false)
      if (disabled) return
      // The old implementation took dataTransfer.files[0] unchecked, so a dragged
      // .pdf sailed past `accept`. Drops go through the same rules as picks now.
      const { accepted, rejected } = selectFiles(event.dataTransfer?.files, { accept, maxSize, multiple })
      reject(rejected)
      take(accepted)
    }

    const bytes = selected.reduce((sum, f) => sum + f.size, 0)
    const primary = label ?? children ?? DEFAULT_LABEL

    return (
      <div
        ref={ref}
        data-slot="import-dropzone"
        data-drag={drag ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        onDragOver={(event: React.DragEvent<HTMLDivElement>) => {
          event.preventDefault()
          if (!disabled) setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={className ? `ca-import-dropzone ${className}` : 'ca-import-dropzone'}
        style={style}
        {...props}
      >
        <UploadButton
          accept={accept}
          multiple={multiple}
          maxSize={maxSize}
          disabled={disabled}
          onFiles={take}
          onError={reject}
          variant="ghost"
          className="ca-import-dropzone-trigger"
        >
          <span className="ca-import-dropzone-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></svg>
          </span>
          {selected.length > 0 ? (
            <span className="ca-import-dropzone-body">
              <span className="ca-import-dropzone-title">
                {selected.length > 1 ? `${selected.length} files selected` : selected[0]!.name}
              </span>
              <span className="ca-import-dropzone-sub ca-import-dropzone-sub--mono">
                {formatFileSize(bytes)} · {replaceLabel}
              </span>
            </span>
          ) : (
            <span className="ca-import-dropzone-prompt">
              <span className="ca-import-dropzone-title">{primary}</span>
              <span className="ca-import-dropzone-sub">{hint}</span>
            </span>
          )}
        </UploadButton>
        <span className="ca-import-dropzone-error" role="status" aria-live="polite">
          {announcement}
        </span>
      </div>
    )
  },
)
