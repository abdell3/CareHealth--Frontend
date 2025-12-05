import * as React from 'react'
import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import type { Appointment } from '@/types/api'
import type { User } from '@/store/auth.store'

interface AdvancedFiltersProps {
  doctors?: User[]
  onFiltersChange: (filters: AppointmentFilters) => void
  className?: string
}

export interface AppointmentFilters {
  doctorId?: string
  patientId?: string
  status?: Appointment['status'][]
  dateRange?: { start: Date; end: Date }
  location?: string
}

export const AdvancedFilters = React.forwardRef<HTMLDivElement, AdvancedFiltersProps>(
  ({ doctors = [], onFiltersChange, className }, ref) => {
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<AppointmentFilters>({
      status: [],
    })

    const handleFilterChange = (key: keyof AppointmentFilters, value: unknown) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFiltersChange(newFilters)
    }

    const handleStatusToggle = (status: Appointment['status']) => {
      const currentStatus = filters.status || []
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status]
      handleFilterChange('status', newStatus)
    }

    const resetFilters = () => {
      const emptyFilters: AppointmentFilters = { status: [] }
      setFilters(emptyFilters)
      onFiltersChange(emptyFilters)
    }

    const hasActiveFilters =
      filters.doctorId ||
      filters.patientId ||
      (filters.status && filters.status.length > 0) ||
      filters.dateRange ||
      filters.location

    return (
      <div ref={ref} className={className}>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres avancés
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-medical-blue-500 px-2 py-0.5 text-xs text-white">
              {[
                filters.doctorId ? 1 : 0,
                filters.patientId ? 1 : 0,
                filters.status?.length || 0,
                filters.dateRange ? 1 : 0,
                filters.location ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </Button>

        {showFilters && (
          <Card className="absolute z-10 mt-2 w-full max-w-2xl border-medical-blue-200 shadow-lg">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filtres avancés</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Doctor Filter */}
                {doctors.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Médecin</label>
                    <select
                      value={filters.doctorId || ''}
                      onChange={(e) => handleFilterChange('doctorId', e.target.value || undefined)}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Tous les médecins</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Statut</label>
                  <div className="flex flex-wrap gap-2">
                    {(['scheduled', 'completed', 'cancelled', 'no-show'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusToggle(status)}
                        className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                          filters.status?.includes(status)
                            ? 'border-medical-blue-500 bg-medical-blue-50 text-medical-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {status === 'scheduled'
                          ? 'Programmé'
                          : status === 'completed'
                            ? 'Terminé'
                            : status === 'cancelled'
                              ? 'Annulé'
                              : 'Absent'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Date début</label>
                    <Input
                      type="date"
                      value={
                        filters.dateRange?.start
                          ? filters.dateRange.start.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        handleFilterChange('dateRange', {
                          start: e.target.value ? new Date(e.target.value) : undefined,
                          end: filters.dateRange?.end,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Date fin</label>
                    <Input
                      type="date"
                      value={
                        filters.dateRange?.end
                          ? filters.dateRange.end.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        handleFilterChange('dateRange', {
                          start: filters.dateRange?.start,
                          end: e.target.value ? new Date(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Localisation</label>
                  <Input
                    type="text"
                    placeholder="Filtrer par localisation..."
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                  />
                </div>

                {/* Reset Button */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button variant="ghost" onClick={resetFilters} className="text-sm">
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
)
AdvancedFilters.displayName = 'AdvancedFilters'

