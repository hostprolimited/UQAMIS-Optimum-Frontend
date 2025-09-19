import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"
import { ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  onRowAction?: (row: TData, action: string) => void
  enableRowSelection?: boolean
  dense?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "",
  searchPlaceholder = "Search...",
  onRowAction,
  enableRowSelection = false,
  dense = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // Add selection column if enabled
  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() ? "indeterminate" : false)
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: dense ? 20 : 10,
      },
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchKey && (
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={dense ? "py-2" : ""}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={dense ? "h-10" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={dense ? "py-2" : ""}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

// Export functionality component
interface ExportButtonsProps {
  data: any[]
  filename?: string
  selectedRows?: any[]
}

export function ExportButtons({ data, filename = "export", selectedRows }: ExportButtonsProps) {
  const exportData = selectedRows && selectedRows.length > 0 ? selectedRows : data

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF()
    
    if (exportData.length === 0) {
      doc.text('No data to export', 20, 20)
    } else {
      const headers = Object.keys(exportData[0]).filter(key => key !== 'id')
      const rows = exportData.map(row => headers.map(header => row[header] || ''))
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      })
    }
    
    doc.save(`${filename}.pdf`)
  }

  const exportToExcel = async () => {
    const XLSX = await import('xlsx')
    const { saveAs } = await import('file-saver')
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `${filename}.xlsx`)
  }

  const exportToWord = async () => {
    const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } = await import('docx')
    const { saveAs } = await import('file-saver')
    
    if (exportData.length === 0) {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [new Paragraph({ children: [new TextRun("No data to export")] })]
        }]
      })
      
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${filename}.docx`)
      return
    }

    const headers = Object.keys(exportData[0]).filter(key => key !== 'id')
    
    const table = new Table({
      rows: [
        new TableRow({
          children: headers.map(header => 
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })]
            })
          )
        }),
        ...exportData.map(row => 
          new TableRow({
            children: headers.map(header => 
              new TableCell({
                children: [new Paragraph({ children: [new TextRun(String(row[header] || ''))] })]
              })
            )
          })
        )
      ]
    })

    const doc = new Document({
      sections: [{
        properties: {},
        children: [table]
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${filename}.docx`)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToPDF}>
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={exportToExcel}>
        Export Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportToWord}>
        Export Word
      </Button>
    </div>
  )
}