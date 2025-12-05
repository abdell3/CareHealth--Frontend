import * as React from 'react'
import { BaseWidget, type BaseWidgetProps } from './BaseWidget'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { cn } from '@/libs/utils'

interface TableColumn {
  key: string
  label: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface TableWidgetProps extends Omit<BaseWidgetProps, 'children'> {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  emptyMessage?: string
  onRowClick?: (row: Record<string, unknown>) => void
  linkTo?: (row: Record<string, unknown>) => string
  maxRows?: number
}

export const TableWidget = React.forwardRef<HTMLDivElement, TableWidgetProps>(
  ({ columns, data, emptyMessage = 'Aucune donnée', onRowClick, linkTo, maxRows = 5, ...props }, ref) => {
    const displayData = maxRows ? data.slice(0, maxRows) : data

    return (
      <BaseWidget ref={ref} {...props}>
        {data.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className="font-semibold text-gray-900">
                      {column.label}
                    </TableHead>
                  ))}
                  {(onRowClick || linkTo) && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((row, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      'transition-colors hover:bg-medical-blue-50/50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '-')}
                      </TableCell>
                    ))}
                    {(onRowClick || linkTo) && (
                      <TableCell>
                        {linkTo ? (
                          <Link to={linkTo(row)}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {data.length > maxRows && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Affichage de {maxRows} sur {data.length} résultats
            </p>
          </div>
        )}
      </BaseWidget>
    )
  }
)
TableWidget.displayName = 'TableWidget'

