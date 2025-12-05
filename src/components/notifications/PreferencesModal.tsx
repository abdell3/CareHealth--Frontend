import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, Smartphone, MessageSquare, Moon, X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useApiError } from '@/hooks/useApiError'
import { Alert } from '@/components/ui/alert'
import type { NotificationPreferences, NotificationChannel, NotificationType } from '@/types/api'

interface PreferencesModalProps {
  open: boolean
  onClose: () => void
}

const channelIcons = {
  'in-app': Bell,
  email: Mail,
  push: Smartphone,
  sms: MessageSquare,
}

const typeLabels: Record<NotificationType, string> = {
  system: 'Système',
  appointment: 'Rendez-vous',
  medical: 'Médical',
  message: 'Messages',
  reminder: 'Rappels',
}

export const PreferencesModal = ({ open, onClose }: PreferencesModalProps) => {
  const { preferences, updatePreferences, isLoading, error } = useNotifications()
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null)
  const [quietHoursStart, setQuietHoursStart] = useState('22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00')
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState('')

  const errorMessage = useApiError(error)

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
      if (preferences.types.system.quietHours) {
        setQuietHoursStart(preferences.types.system.quietHours.start)
        setQuietHoursEnd(preferences.types.system.quietHours.end)
      }
      setKeywords(preferences.keywords || [])
    }
  }, [preferences])

  if (!localPreferences) {
    return null
  }

  const handleTypeToggle = (type: NotificationType) => {
    setLocalPreferences({
      ...localPreferences,
      types: {
        ...localPreferences.types,
        [type]: {
          ...localPreferences.types[type],
          enabled: !localPreferences.types[type].enabled,
        },
      },
    })
  }

  const handleChannelToggle = (type: NotificationType, channel: NotificationChannel) => {
    const typePrefs = localPreferences.types[type]
    const newChannels = typePrefs.channels.includes(channel)
      ? typePrefs.channels.filter((c) => c !== channel)
      : [...typePrefs.channels, channel]

    setLocalPreferences({
      ...localPreferences,
      types: {
        ...localPreferences.types,
        [type]: {
          ...typePrefs,
          channels: newChannels,
        },
      },
    })
  }

  const handleSave = async () => {
    const updatedPrefs: Partial<NotificationPreferences> = {
      ...localPreferences,
      types: {
        ...localPreferences.types,
        system: {
          ...localPreferences.types.system,
          quietHours: {
            start: quietHoursStart,
            end: quietHoursEnd,
          },
        },
      },
      keywords,
    }

    await updatePreferences(updatedPrefs)
    onClose()
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const allTypes: NotificationType[] = ['system', 'appointment', 'medical', 'message', 'reminder']
  const allChannels: NotificationChannel[] = ['in-app', 'email', 'push', 'sms']

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Préférences de notifications</DialogTitle>
          <DialogDescription>
            Configurez vos préférences pour recevoir les notifications selon vos besoins.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            {errorMessage}
          </Alert>
        )}

        <div className="space-y-6">
          {/* Notification Types */}
          {allTypes.map((type) => {
            const typePrefs = localPreferences.types[type]
            return (
              <Card key={type} className="p-4">
                <div className="space-y-4">
                  {/* Type Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={typePrefs.enabled}
                        onChange={() => handleTypeToggle(type)}
                        className="h-5 w-5 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                      />
                      <label className="text-lg font-semibold text-gray-900">
                        {typeLabels[type]}
                      </label>
                    </div>
                  </div>

                  {typePrefs.enabled && (
                    <div className="pl-8 space-y-3">
                      {/* Channels */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Canaux de notification
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {allChannels.map((channel) => {
                            const ChannelIcon = channelIcons[channel]
                            const isSelected = typePrefs.channels.includes(channel)
                            return (
                              <Button
                                key={channel}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleChannelToggle(type, channel)}
                                className="capitalize"
                              >
                                <ChannelIcon className="h-4 w-4 mr-2" />
                                {channel === 'in-app' ? 'Application' : channel}
                              </Button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Type-specific settings */}
                      {type === 'appointment' && 'reminders' in typePrefs && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Rappels
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(['24h', '2h', 'on-time'] as const).map((reminder) => (
                              <Button
                                key={reminder}
                                variant={typePrefs.reminders?.[reminder] ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                  setLocalPreferences({
                                    ...localPreferences,
                                    types: {
                                      ...localPreferences.types,
                                      appointment: {
                                        ...typePrefs,
                                        reminders: {
                                          ...typePrefs.reminders,
                                          [reminder]: !typePrefs.reminders?.[reminder],
                                        },
                                      },
                                    },
                                  })
                                }}
                              >
                                {reminder === '24h' ? '24h avant' : reminder === '2h' ? '2h avant' : 'À l\'heure'}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {type === 'medical' && 'criticalOnly' in typePrefs && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={typePrefs.criticalOnly || false}
                            onChange={() => {
                              setLocalPreferences({
                                ...localPreferences,
                                types: {
                                  ...localPreferences.types,
                                  medical: {
                                    ...typePrefs,
                                    criticalOnly: !typePrefs.criticalOnly,
                                  },
                                },
                              })
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                          />
                          <label className="text-sm text-gray-700">
                            Uniquement les alertes critiques
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}

          {/* Quiet Hours */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Heures silencieuses</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Début</label>
                <Input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Fin</label>
                <Input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Les notifications système seront silencieuses pendant cette période
            </p>
          </Card>

          {/* Keywords Filter */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mots-clés à filtrer</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Ajouter un mot-clé..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddKeyword()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleAddKeyword}>Ajouter</Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="gap-2">
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

