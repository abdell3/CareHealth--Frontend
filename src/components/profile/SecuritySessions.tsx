import * as React from 'react'
import { useState } from 'react'
import { Monitor, Smartphone, Tablet, LogOut, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/utils/helpers'

interface Session {
  id: string
  device: string
  browser: string
  location?: string
  ipAddress?: string
  lastActive: string
  isCurrent: boolean
}

interface SecuritySessionsProps {
  sessions?: Session[]
  onRevokeSession?: (sessionId: string) => void
  onRevokeAll?: () => void
  className?: string
}

const getDeviceIcon = (device: string) => {
  if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
    return Smartphone
  }
  if (device.toLowerCase().includes('tablet')) {
    return Tablet
  }
  return Monitor
}

export const SecuritySessions = React.forwardRef<HTMLDivElement, SecuritySessionsProps>(
  ({ sessions = [], onRevokeSession, onRevokeAll, className }, ref) => {
    return (
      <Card ref={ref} className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sessions actives</CardTitle>
            {sessions.length > 1 && onRevokeAll && (
              <Button variant="outline" size="sm" onClick={onRevokeAll}>
                Déconnecter toutes les autres sessions
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-sm text-gray-500">Aucune session active</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.device)
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-medical-blue-100 p-3">
                        <DeviceIcon className="h-5 w-5 text-medical-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{session.device}</p>
                          {session.isCurrent && (
                            <Badge variant="success" className="text-xs">
                              Session actuelle
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{session.browser}</p>
                        {session.location && (
                          <p className="text-xs text-gray-500">{session.location}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Dernière activité : {formatDateTime(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && onRevokeSession && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRevokeSession(session.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
SecuritySessions.displayName = 'SecuritySessions'

