import * as React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'
import { Skeleton } from '../feedback/Skeleton'
import './DataTable.css'

/**
 * Cashflow DataTable. The column-config wrapper over the `Table` primitives:
 * you describe the columns once and hand it rows, instead of hand-rolling
 * `thead`/`tbody` markup per screen. It is a thin composition — it renders
 * `Table > TableHeader/TableBody > TableRow > TableHead/TableCell`, so the
 * borders, hover tint, sticky head and compact cell metrics all come from
 * `Table.css` and stay in sync with hand-composed tables.
 *
 * Sorting is **controlled and presentational**: DataTable never reorders
 * `rows`. It renders a keyboard-operable sort button in the head cell, puts
 * the correct `aria-sort` on the `<th>`, and calls `onSortChange` with the
 * next state (asc → desc → cleared). The consumer owns the ordering.
 *
 * Hover, focus ring and the sort-direction caret live in `DataTable.css`,
 * keyed off `data-align` / `data-direction` — no `useState`, no `onMouseEnter`.
 */

/** Horizontal alignment of a column's head and body cells. */
export type DataTableAlign = 'left' | 'center' | 'right'

/** Sort direction. `aria-sort` maps these to ascending/descending. */
export type DataTableSortDirection = 'asc' | 'desc'

/** Controlled sort state: which column key, and which way. */
export interface DataTableSort {
  key: string
  direction: DataTableSortDirection
}

interface DataTableColumnBase<T> {
  /** Head cell content. */
  header: React.ReactNode
  /** Cell renderer. Receives the typed row — no `any`, no index-signature cast. */
  render?: (row: T, index: number) => React.ReactNode
  /** Alignment for this column's head and body cells. Default `left`. */
  align?: DataTableAlign
  /** Fixed column width, e.g. `120` or `'20%'`. */
  width?: number | string
  /** Show a sort button in the head cell and emit `aria-sort`. */
  sortable?: boolean
  /** Extra class on this column's head and body cells. */
  className?: string
}

/**
 * A column. `key` identifies the column (and is what `onSortChange` reports).
 *
 * Type safety: with no `render`, `key` must name a real field of `T` — the
 * cell value is read off the row, so a typo is a compile error. A column with
 * a `render` may use any `key`, since nothing is read off the row by name.
 */
export type DataTableColumn<T> =
  | (DataTableColumnBase<T> & { key: Extract<keyof T, string> })
  | (DataTableColumnBase<T> & { key: string; render: (row: T, index: number) => React.ReactNode })

/** Column-config table over the `Table` primitives. Sorting is controlled. */
export interface DataTableProps<T>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  /** Column definitions, left to right. */
  columns: DataTableColumn<T>[]
  /** The rows to render, in the order they should appear. */
  rows: T[]
  /**
   * Stable React key per row. Required on purpose: keying by array index
   * silently corrupts state when rows are sorted, filtered or paginated.
   */
  getRowKey: (row: T, index: number) => React.Key
  /** Controlled sort state, or `null`/omitted for unsorted. */
  sort?: DataTableSort | null
  /** Called with the next sort state when a sort button is activated. */
  onSortChange?: (sort: DataTableSort | null) => void
  /** Shown in a full-width cell when `rows` is empty and not loading. */
  empty?: React.ReactNode
  /** Replace the body with shimmering `Skeleton` rows. */
  loading?: boolean
  /** How many skeleton rows to render while `loading`. Default 4. */
  loadingRows?: number
  /** Max height of the scroll region; the head stays sticky above it. */
  maxHeight?: string
  /** Class for the scroll container (the element `maxHeight` constrains). */
  containerClassName?: string
}

/** asc → desc → cleared, restarting at asc on a different column. */
function nextSort(current: DataTableSort | null | undefined, key: string): DataTableSort | null {
  if (!current || current.key !== key) return { key, direction: 'asc' }
  if (current.direction === 'asc') return { key, direction: 'desc' }
  return null
}

/** Coerce an arbitrary row field into something React can render. */
function toNode(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === false) return null
  if (typeof value === 'string' || typeof value === 'number') return value
  if (React.isValidElement(value)) return value
  return String(value)
}

function DataTableImpl<T>(
  {
    columns,
    rows,
    getRowKey,
    sort,
    onSortChange,
    empty,
    loading = false,
    loadingRows = 4,
    maxHeight,
    containerClassName,
    className,
    ...props
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>,
): React.JSX.Element {
  const colCount = columns.length

  return (
    <Table
      ref={ref}
      data-slot="data-table"
      className={className ? `ca-data-table ${className}` : 'ca-data-table'}
      maxHeight={maxHeight}
      containerClassName={containerClassName}
      {...props}
    >
      <TableHeader>
        <TableRow>
          {columns.map((col) => {
            const sorted = sort && sort.key === col.key ? sort.direction : undefined
            return (
              <TableHead
                key={col.key}
                className={col.className}
                data-align={col.align ?? 'left'}
                style={col.width !== undefined ? { width: col.width } : undefined}
                aria-sort={
                  col.sortable ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined
                }
              >
                {col.sortable ? (
                  <button
                    type="button"
                    data-slot="data-table-sort"
                    data-direction={sorted ?? 'none'}
                    className="ca-data-table-sort"
                    onClick={() => onSortChange?.(nextSort(sort, col.key))}
                  >
                    {col.header}
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody aria-busy={loading || undefined}>
        {loading ? (
          Array.from({ length: loadingRows }).map((_, rowIndex) => (
            <TableRow key={`loading-${rowIndex}`} data-slot="data-table-loading-row">
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className} data-align={col.align ?? 'left'}>
                  <Skeleton h={12} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={colCount} data-slot="data-table-empty" className="ca-data-table-empty">
              {empty ?? 'No data'}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, rowIndex) => (
            <TableRow key={getRowKey(row, rowIndex)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className} data-align={col.align ?? 'left'}>
                  {col.render
                    ? col.render(row, rowIndex)
                    : toNode((row as Record<string, unknown>)[col.key])}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

/**
 * Generic + `forwardRef`: `React.forwardRef` erases the type parameter, so the
 * result is cast back to a generic call signature. `DataTable` stays a real
 * forwardRef component (the ref lands on the `<table>`) while `columns`,
 * `rows`, `render` and `getRowKey` all narrow to the caller's row type.
 */
export interface DataTableComponent {
  <T>(props: DataTableProps<T> & React.RefAttributes<HTMLTableElement>): React.JSX.Element
  displayName?: string
}

export const DataTable = React.forwardRef(DataTableImpl) as DataTableComponent

DataTable.displayName = 'DataTable'
