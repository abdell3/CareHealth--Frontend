import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Calendar, Pill, FileText, Users, BarChart3, Shield } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import type { User } from '@/store/auth.store'
import type { Appointment, Prescription } from '@/types/api'

interface RoleSpecificPanelProps {
  user: User
  upcomingAppointments?: Appointment[]
  activePrescriptions?: Prescription[]
  className?: string
}

export const RoleSpecificPanel = React.forwardRef<HTMLDivElement, RoleSpecificPanelProps>(
  ({ user, upcomingAppointments = [], activePrescriptions = [], className }, ref) => {
    // Patient Panel
    if (user.role === 'patient') {
      return (
        <Card ref={ref} className={className}>
          <CardHeader>
            <CardTitle>Vue Patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upcoming Appointments */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Calendar className="h-5 w-5 text-medical-blue-600" />
                Prochains rendez-vous
              </h3>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 3).map((apt) => (
                    <Link
                      key={apt.id}
                      to={`/dashboard/appointments/${apt.id}`}
                      className="block rounded-lg border border-gray-200 p-3 transition-colors hover:bg-medical-blue-50"
                    >
                      <p className="font-medium text-gray-900">
                        {formatDate(apt.date)} à {apt.time}
                      </p>
                      {apt.doctor && (
                        <p className="text-sm text-gray-600">
                          Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun rendez-vous à venir</p>
              )}
            </div>

            {/* Active Prescriptions */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Pill className="h-5 w-5 text-medical-green-600" />
                Prescriptions actives
              </h3>
              {activePrescriptions.length > 0 ? (
                <div className="space-y-2">
                  {activePrescriptions.slice(0, 3).map((prescription) => (
                    <Link
                      key={prescription.id}
                      to={`/dashboard/prescriptions/${prescription.id}`}
                      className="block rounded-lg border border-gray-200 p-3 transition-colors hover:bg-medical-green-50"
                    >
                      <p className="font-medium text-gray-900">
                        {prescription.medications.length} médicament(s)
                      </p>
                      <p className="text-sm text-gray-600">
                        Depuis le {formatDate(prescription.startDate)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune prescription active</p>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Doctor Panel
    if (user.role === 'doctor') {
      return (
        <Card ref={ref} className={className}>
          <CardHeader>
            <CardTitle>Vue Médecin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Users className="h-5 w-5 text-medical-blue-600" />
                Patients aujourd'hui
              </h3>
              <p className="text-2xl font-bold text-medical-blue-600">
                {upcomingAppointments.filter((apt) => {
                  const aptDate = new Date(apt.date)
                  const today = new Date()
                  return (
                    aptDate.getDate() === today.getDate() &&
                    aptDate.getMonth() === today.getMonth() &&
                    aptDate.getFullYear() === today.getFullYear()
                  )
                }).length}
              </p>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Calendar className="h-5 w-5 text-medical-green-600" />
                Rendez-vous cette semaine
              </h3>
              <p className="text-2xl font-bold text-medical-green-600">
                {upcomingAppointments.filter((apt) => {
                  const aptDate = new Date(apt.date)
                  const today = new Date()
                  const weekEnd = new Date(today)
                  weekEnd.setDate(today.getDate() + 7)
                  return aptDate >= today && aptDate <= weekEnd
                }).length}
              </p>
            </div>
            {user.profile?.specialization && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">Spécialisation</h3>
                <Badge variant="info">{user.profile.specialization}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    // Admin Panel
    if (user.role === 'admin') {
      return (
        <Card ref={ref} className={className}>
          <CardHeader>
            <CardTitle>Vue Administrateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Statistiques système
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilisateurs actifs</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stockage utilisé</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Shield className="h-5 w-5 text-purple-600" />
                Actions rapides
              </h3>
              <div className="space-y-2">
                <Link
                  to="/dashboard/users"
                  className="block rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-purple-50"
                >
                  Gérer les utilisateurs
                </Link>
                <Link
                  to="/dashboard"
                  className="block rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-purple-50"
                >
                  Voir les logs système
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Default for other roles
    return null
  }
)
RoleSpecificPanel.displayName = 'RoleSpecificPanel'

