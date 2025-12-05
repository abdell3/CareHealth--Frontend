import * as React from 'react'
import { Plus, X, Settings, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/libs/utils'
import type { CalendarResource } from '@/types/calendar'

interface ResourceSchedulerProps {
  resources: CalendarResource[]
  onResourcesChange: (resources: CalendarResource[]) => void
  className?: string
}

export const ResourceScheduler: React.FC<ResourceSchedulerProps> = ({
  resources,
  onResourcesChange,
  className,
}) => {
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingResource, setEditingResource] = React.useState<CalendarResource | null>(null)

  const handleAddResource = (resource: Omit<CalendarResource, 'id'>) => {
    const newResource: CalendarResource = {
      ...resource,
      id: `resource-${Date.now()}`,
    }
    onResourcesChange([...resources, newResource])
    setShowAddDialog(false)
  }

  const handleRemoveResource = (id: string) => {
    onResourcesChange(resources.filter((r) => r.id !== id))
  }

  const handleUpdateResource = (id: string, updates: Partial<CalendarResource>) => {
    onResourcesChange(
      resources.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const typeColors: Record<CalendarResource['type'], string> = {
    doctor: 'bg-blue-100 text-blue-800 border-blue-300',
    room: 'bg-green-100 text-green-800 border-green-300',
    equipment: 'bg-purple-100 text-purple-800 border-purple-300',
  }

  const typeLabels: Record<CalendarResource['type'], string> = {
    doctor: 'Médecin',
    room: 'Salle',
    equipment: 'Équipement',
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ressources</h3>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-2">
        {resources.map((resource) => (
          <Card key={resource.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center',
                      typeColors[resource.type].split(' ')[0]
                    )}
                    style={{ backgroundColor: resource.color || undefined }}
                  >
                    <span className="text-lg">
                      {resource.type === 'doctor' ? '👨‍⚕️' : resource.type === 'room' ? '🏥' : '🔬'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{resource.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn('text-xs', typeColors[resource.type])}>
                        {typeLabels[resource.type]}
                      </Badge>
                      {resource.availability && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {resource.availability.start} - {resource.availability.end}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingResource(resource)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveResource(resource.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      {(showAddDialog || editingResource) && (
        <ResourceDialog
          resource={editingResource || undefined}
          onSave={(resource) => {
            if (editingResource) {
              handleUpdateResource(editingResource.id, resource)
              setEditingResource(null)
            } else {
              handleAddResource(resource)
            }
          }}
          onClose={() => {
            setShowAddDialog(false)
            setEditingResource(null)
          }}
        />
      )}
    </div>
  )
}

interface ResourceDialogProps {
  resource?: CalendarResource
  onSave: (resource: Omit<CalendarResource, 'id'>) => void
  onClose: () => void
}

const ResourceDialog: React.FC<ResourceDialogProps> = ({ resource, onSave, onClose }) => {
  const [title, setTitle] = React.useState(resource?.title || '')
  const [type, setType] = React.useState<CalendarResource['type']>(resource?.type || 'doctor')
  const [color, setColor] = React.useState(resource?.color || '')
  const [availabilityStart, setAvailabilityStart] = React.useState(
    resource?.availability?.start || '08:00'
  )
  const [availabilityEnd, setAvailabilityEnd] = React.useState(
    resource?.availability?.end || '18:00'
  )

  const handleSave = () => {
    onSave({
      title,
      type,
      color: color || undefined,
      availability: {
        start: availabilityStart,
        end: availabilityEnd,
      },
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{resource ? 'Modifier la ressource' : 'Nouvelle ressource'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarResource['type'])}
              className="h-10 w-full rounded-lg border border-input bg-background px-3"
            >
              <option value="doctor">Médecin</option>
              <option value="room">Salle</option>
              <option value="equipment">Équipement</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Couleur</label>
            <Input
              type="color"
              value={color || '#3b82f6'}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Disponible de</label>
              <Input
                type="time"
                value={availabilityStart}
                onChange={(e) => setAvailabilityStart(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Disponible jusqu'à</label>
              <Input
                type="time"
                value={availabilityEnd}
                onChange={(e) => setAvailabilityEnd(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!title}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

