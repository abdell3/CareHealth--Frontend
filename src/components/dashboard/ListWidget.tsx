import * as React from 'react'
import { BaseWidget, type BaseWidgetProps } from './BaseWidget'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { cn } from '@/libs/utils'

interface ListItem {
  id: string
  title: string
  description?: string
  badge?: React.ReactNode
  action?: {
    label: string
    onClick?: () => void
    linkTo?: string
  }
  icon?: React.ReactNode
}

interface ListWidgetProps extends Omit<BaseWidgetProps, 'children'> {
  items: ListItem[]
  emptyMessage?: string
  maxItems?: number
}

export const ListWidget = React.forwardRef<HTMLDivElement, ListWidgetProps>(
  ({ items, emptyMessage = 'Aucun élément', maxItems = 5, ...props }, ref) => {
    const displayItems = maxItems ? items.slice(0, maxItems) : items

    return (
      <BaseWidget ref={ref} {...props}>
        {items.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                {item.icon && (
                  <div className="mt-1 shrink-0 text-medical-blue-600">{item.icon}</div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    {item.badge && <div className="ml-2">{item.badge}</div>}
                  </div>
                  {item.action && (
                    <div className="mt-2">
                      {item.action.linkTo ? (
                        <Link to={item.action.linkTo}>
                          <Button variant="outline" size="sm">
                            {item.action.label}
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" onClick={item.action.onClick}>
                          {item.action.label}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {items.length > maxItems && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Affichage de {maxItems} sur {items.length} éléments
            </p>
          </div>
        )}
      </BaseWidget>
    )
  }
)
ListWidget.displayName = 'ListWidget'

