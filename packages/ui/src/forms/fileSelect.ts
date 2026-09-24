/**
 * Shared file-intake internals for the package's two file-picking components —
 * `forms/UploadButton` and `finance/ImportDropzone`.
 *
 * Both have to do the same three boring things (normalise a `FileList`, check
 * it against `accept`/`maxSize`, and explain what it threw away), but they need
 * different DOM: a button with a hidden input vs. a drop surface. So the rules
 * live here as pure functions rather than being duplicated in both components
 * — `ImportDropzone` validates *drops* with the same code path `UploadButton`
 * uses for *picks*, which is exactly the bug the old dropzone had (it never
 * re-checked `accept` on drop).
 *
 * Pure and DOM-free on purpose: no React, no refs, trivially unit-testable.
 */

/** Why a file was turned away. */
export type FileRejectionCode = 'accept' | 'max-size'

/** A single turned-away file, with copy suitable for a live region. */
export interface FileRejection {
  file: File
  code: FileRejectionCode
  message: string
}

/** The constraints a selection is checked against. */
export interface FileSelectRules {
  /** Same syntax as the `accept` attribute: `.csv,.ofx`, `image/png`, `image/*`. */
  accept?: string
  /** Hard byte ceiling. Omitted means no limit — advisory hints are not limits. */
  maxSize?: number
  /** When false (the default) everything past the first file is dropped. */
  multiple?: boolean
}

/** A selection partitioned into what you can use and what you must explain. */
export interface FileSelectResult {
  accepted: File[]
  rejected: FileRejection[]
}

/**
 * Human byte size. Deliberately identical to the formatting `ImportDropzone`
 * shipped before this module existed, so the rendered copy does not shift:
 * megabytes to one decimal, everything else in whole KB, never "0 KB".
 */
export function formatFileSize(bytes: number): string {
  return bytes > 1e6 ? (bytes / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1e3)) + ' KB'
}

/**
 * Whether a file satisfies an `accept` list. An empty or blank list accepts
 * everything. Extensions match case-insensitively on the name; mime tokens
 * match the type exactly, and wildcard tokens (a trailing star, on its own or
 * after a type prefix) are honoured.
 */
export function matchesAccept(file: File, accept?: string): boolean {
  const tokens = (accept ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true

  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()

  return tokens.some((token) => {
    if (token === '*' || token === '*/*') return true
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

/**
 * Normalise and validate a selection from either intake path (a file input's
 * `files`, or a drag event's `dataTransfer.files`).
 */
export function selectFiles(
  source: FileList | readonly File[] | null | undefined,
  rules: FileSelectRules = {},
): FileSelectResult {
  const { accept, maxSize, multiple = false } = rules
  const all = source ? Array.from(source as ArrayLike<File>) : []
  const candidates = multiple ? all : all.slice(0, 1)

  const accepted: File[] = []
  const rejected: FileRejection[] = []

  for (const file of candidates) {
    if (!matchesAccept(file, accept)) {
      rejected.push({
        file,
        code: 'accept',
        message: `${file.name} isn’t an accepted file type.`,
      })
      continue
    }
    if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({
        file,
        code: 'max-size',
        message: `${file.name} is larger than the ${formatFileSize(maxSize)} limit.`,
      })
      continue
    }
    accepted.push(file)
  }

  return { accepted, rejected }
}
