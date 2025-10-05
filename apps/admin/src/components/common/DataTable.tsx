import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

export type DataTableProps<T extends object> = {
  columns: ColumnDef<T, any>[]
  data: T[]
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T extends object>({ columns, data, onPageChange, page = 1, pageSize = 20 }: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="text-left px-3 py-2 select-none">
                  {header.isPlaceholder ? null : (
                    <div
                      className="cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 flex items-center justify-between text-xs">
        <div>Стр. {page}</div>
        <div className="space-x-2">
          <button className="px-2 py-1 border rounded" onClick={() => onPageChange?.(Math.max(1, page - 1))}>
            Назад
          </button>
          <button className="px-2 py-1 border rounded" onClick={() => onPageChange?.(page + 1)}>
            Далее
          </button>
        </div>
      </div>
    </div>
  )
}
