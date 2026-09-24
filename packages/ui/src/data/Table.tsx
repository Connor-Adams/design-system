import * as React from 'react'
import './Table.css'

/**
 * Cashflow Table set. A bordered, scrollable data table. Head cells are
 * uppercase muted micro-labels; rows hover to a faint muted tint; cells are
 * compact (px-3 py-2.5). Compose: Table > TableHeader/TableBody >
 * TableRow > TableHead/TableCell.
 *
 * Row hover lives in `Table.css` (`tbody tr:hover`), not JS — no `useState`,
 * no `onMouseEnter`.
 */

/**
 * Bordered, scrollable data table. Compose Table > TableHeader/TableBody >
 * TableRow > TableHead/TableCell. Pass `maxHeight` for a scroll region — the
 * head stays sticky above it. `className` styles the `<table>`;
 * `containerClassName` styles the scroll container around it.
 */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  maxHeight?: string
  /** Class for the scroll container — the element `maxHeight` constrains. */
  containerClassName?: string
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, style, maxHeight, containerClassName, children, ...props },
  ref,
): React.JSX.Element {
  return (
    <div
      data-slot="table-container"
      className={containerClassName ? `ca-table-container ${containerClassName}` : 'ca-table-container'}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        ref={ref}
        data-slot="table"
        className={className ? `ca-table ${className}` : 'ca-table'}
        style={style}
        {...props}
      >
        {children}
      </table>
    </div>
  )
})

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ children, ...props }, ref): React.JSX.Element {
    return (
      <thead ref={ref} data-slot="table-header" {...props}>
        {children}
      </thead>
    )
  },
)

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ children, ...props }, ref): React.JSX.Element {
    return (
      <tbody ref={ref} data-slot="table-body" {...props}>
        {children}
      </tbody>
    )
  },
)

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, children, ...props },
  ref,
): React.JSX.Element {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      data-state={selected ? 'selected' : undefined}
      className={className ? `ca-table-row ${className}` : 'ca-table-row'}
      {...props}
    >
      {children}
    </tr>
  )
})

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className, children, ...props }, ref): React.JSX.Element {
    return (
      <th
        ref={ref}
        data-slot="table-head"
        className={className ? `ca-table-head ${className}` : 'ca-table-head'}
        {...props}
      >
        {children}
      </th>
    )
  },
)

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, children, ...props }, ref): React.JSX.Element {
    return (
      <td
        ref={ref}
        data-slot="table-cell"
        className={className ? `ca-table-cell ${className}` : 'ca-table-cell'}
        {...props}
      >
        {children}
      </td>
    )
  },
)
