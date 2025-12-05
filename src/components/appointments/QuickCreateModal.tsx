import * as React from 'react'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/libs/utils'

interface QuickCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuickCreateData) => void
  className?: string
}

export interface QuickCreateData {
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: 'consultation' | 'follow-up' | 'emergency' | 'surgery'
  notes?: string
}

export const QuickCreateModal = React.forwardRef<HTMLDivElement, QuickCreateModalProps>(
  ({ isOpen, onClose, onSubmit, className }, ref) => {
    const [formData, setFormData] = useState<QuickCreateData>({
      patientId: '',
      doctorId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      type: 'consultation',
      notes: '',
    })

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
      onClose()
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
          className
        )}
        onClick={onClose}
      >
        <Card
          className="w-full max-w-md border-medical-blue-200 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-medical-blue-50 to-medical-green-50">
            <CardTitle className="text-lg font-semibold text-medical-blue-700">
              Nouveau rendez-vous
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ID Patient
                </label>
                <Input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  required
                  placeholder="ID du patient"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ID Médecin
                </label>
                <Input
                  type="text"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                  placeholder="ID du médecin"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Heure</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Durée (min)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })
                    }
                    min="15"
                    step="15"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as QuickCreateData['type'],
                      })
                    }
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Suivi</option>
                    <option value="emergency">Urgence</option>
                    <option value="surgery">Chirurgie</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Notes optionnelles..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                >
                  Créer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }
)
QuickCreateModal.displayName = 'QuickCreateModal'

