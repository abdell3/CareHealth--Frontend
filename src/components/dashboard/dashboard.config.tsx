import { appointmentsService } from '@/api/appointments.service'
import { patientsService } from '@/api/patients.service'
import { usersService } from '@/api/users.service'
import { formatDate, formatPhoneNumber } from '@/utils/helpers'
import type { UserRole } from '@/store/auth.store'
import type { Appointment, Patient } from '@/types/api'
import { Badge } from '@/components/ui/badge'

export interface DashboardWidget {
  id: string
  type: 'stats' | 'table' | 'list' | 'calendar'
  role: UserRole[]
  title: string
  size: 'small' | 'medium' | 'large'
  dataSource: () => Promise<unknown>
  refreshInterval?: number
  props?: Record<string, unknown>
  iconName?: string
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Helper to get start of month
const getStartOfMonth = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export const dashboardConfigs: Record<UserRole, DashboardWidget[]> = {
  admin: [
    {
      id: 'admin-stats-users',
      type: 'stats',
      role: ['admin'],
      title: 'Utilisateurs actifs',
      size: 'small',
      iconName: 'Users',
      dataSource: async () => {
        const response = await usersService.getUsers({ limit: 1 })
        const activeUsers = response.data.users.filter((u) => u.role !== 'patient').length
        return {
          value: activeUsers,
          subtitle: 'Utilisateurs système',
          trend: { value: 0, label: 'ce mois' },
        }
      },
      refreshInterval: 60000,
    },
    {
      id: 'admin-stats-appointments',
      type: 'stats',
      role: ['admin'],
      title: 'Rendez-vous aujourd\'hui',
      size: 'small',
      iconName: 'Calendar',
      dataSource: async () => {
        const response = await appointmentsService.getAppointments({
          date: getTodayDate(),
          limit: 1000,
        })
        return {
          value: response.data.appointments.length,
          subtitle: 'RDVs programmés',
          trend: { value: 0, label: 'aujourd\'hui' },
        }
      },
      refreshInterval: 30000,
    },
    {
      id: 'admin-stats-patients',
      type: 'stats',
      role: ['admin'],
      title: 'Total patients',
      size: 'small',
      iconName: 'Users',
      dataSource: async () => {
        const response = await patientsService.getPatients({ limit: 1 })
        const startOfMonth = getStartOfMonth()
        const newThisMonth = response.data.patients.filter((p) => {
          const createdAt = new Date(p.createdAt)
          return createdAt >= startOfMonth
        }).length
        return {
          value: response.data.total,
          subtitle: `${newThisMonth} nouveaux ce mois`,
          trend: { value: newThisMonth > 0 ? 5 : 0, label: 'nouveaux' },
        }
      },
      refreshInterval: 60000,
    },
    {
      id: 'admin-activity',
      type: 'table',
      role: ['admin'],
      title: 'Activité récente',
      size: 'medium',
      iconName: 'Activity',
      dataSource: async () => {
        const appointmentsResponse = await appointmentsService.getAppointments({
          limit: 10,
        })
        const columns = [
          {
            key: 'date',
            label: 'Date',
            render: (value: string) => formatDate(value),
          },
          {
            key: 'patient',
            label: 'Patient',
            render: (_: unknown, row: Appointment) =>
              row.patient
                ? `${row.patient.firstName} ${row.patient.lastName}`
                : '-',
          },
          {
            key: 'type',
            label: 'Type',
            render: (value: string) => (
              <Badge variant="info">
                {value === 'consultation'
                  ? 'Consultation'
                  : value === 'emergency'
                    ? 'Urgence'
                    : value === 'surgery'
                      ? 'Chirurgie'
                      : 'Suivi'}
              </Badge>
            ),
          },
          {
            key: 'status',
            label: 'Statut',
            render: (value: string) => (
              <Badge
                variant={
                  value === 'completed'
                    ? 'success'
                    : value === 'cancelled'
                      ? 'destructive'
                      : 'info'
                }
              >
                {value === 'scheduled'
                  ? 'Programmé'
                  : value === 'completed'
                    ? 'Terminé'
                    : value === 'cancelled'
                      ? 'Annulé'
                      : 'Absent'}
              </Badge>
            ),
          },
        ]
        return {
          columns,
          data: appointmentsResponse.data.appointments,
          linkTo: (row: Appointment) => `/dashboard/appointments/${row.id}`,
        }
      },
      refreshInterval: 30000,
    },
    {
      id: 'admin-system',
      type: 'list',
      role: ['admin'],
      title: 'Alertes système',
      size: 'medium',
      iconName: 'AlertTriangle',
      dataSource: async () => {
        return {
          items: [
            {
              id: '1',
              title: 'Système opérationnel',
              description: 'Tous les services fonctionnent normalement',
              badge: <Badge variant="success">OK</Badge>,
            },
            {
              id: '2',
              title: 'Stockage',
              description: '75% utilisé',
              badge: <Badge variant="warning">Attention</Badge>,
            },
          ],
        }
      },
      refreshInterval: 60000,
    },
  ],

  doctor: [
    {
      id: 'doctor-today-appointments',
      type: 'calendar',
      role: ['doctor'],
      title: 'Planning du jour',
      size: 'large',
      iconName: 'Calendar',
      dataSource: async () => {
        const response = await appointmentsService.getAppointments({
          date: getTodayDate(),
          status: 'scheduled',
          limit: 100,
        })
        return response.data.appointments
      },
      refreshInterval: 30000,
    },
    {
      id: 'doctor-stats-patients',
      type: 'stats',
      role: ['doctor'],
      title: 'Patients vus ce mois',
      size: 'small',
      iconName: 'Users',
      dataSource: async () => {
        const response = await appointmentsService.getAppointments({
          status: 'completed',
          limit: 1000,
        })
        const startOfMonth = getStartOfMonth()
        const thisMonth = response.data.appointments.filter((apt) => {
          const aptDate = new Date(apt.date)
          return aptDate >= startOfMonth
        }).length
        return {
          value: thisMonth,
          subtitle: 'Consultations terminées',
          trend: { value: 0, label: 'ce mois' },
        }
      },
      refreshInterval: 60000,
    },
    {
      id: 'doctor-pending-prescriptions',
      type: 'list',
      role: ['doctor'],
      title: 'Prescriptions en attente',
      size: 'medium',
      iconName: 'FileText',
      dataSource: async () => {
        return {
          items: [
            {
              id: '1',
              title: 'Prescription #1234',
              description: 'À signer - Patient: Jean Dupont',
              badge: <Badge variant="warning">En attente</Badge>,
              action: {
                label: 'Voir',
                linkTo: '/dashboard/prescriptions/1',
              },
            },
          ],
          emptyMessage: 'Aucune prescription en attente',
        }
      },
      refreshInterval: 30000,
    },
    {
      id: 'doctor-urgent-results',
      type: 'list',
      role: ['doctor'],
      title: 'Résultats labo urgents',
      size: 'medium',
      iconName: 'AlertTriangle',
      dataSource: async () => {
        return {
          items: [
            {
              id: '1',
              title: 'Analyse sanguine - Valeurs critiques',
              description: 'Patient: Marie Martin - Glycémie élevée',
              badge: <Badge variant="destructive">Urgent</Badge>,
              action: {
                label: 'Voir',
                linkTo: '/dashboard/lab/1',
              },
            },
          ],
          emptyMessage: 'Aucun résultat urgent',
        }
      },
      refreshInterval: 15000,
    },
  ],

  nurse: [
    {
      id: 'nurse-tasks',
      type: 'list',
      role: ['nurse'],
      title: 'Tâches quotidiennes',
      size: 'medium',
      iconName: 'Clock',
      dataSource: async () => {
        return {
          items: [
            {
              id: '1',
              title: 'Vérification des signes vitaux',
              description: '3 patients à monitorer',
              badge: <Badge variant="info">En cours</Badge>,
            },
            {
              id: '2',
              title: 'Vaccinations du jour',
              description: '5 vaccinations programmées',
              badge: <Badge variant="success">Planifié</Badge>,
            },
          ],
          emptyMessage: 'Aucune tâche en attente',
        }
      },
      refreshInterval: 30000,
    },
    {
      id: 'nurse-patients-monitor',
      type: 'table',
      role: ['nurse'],
      title: 'Patients à monitorer',
      size: 'large',
      iconName: 'Stethoscope',
      dataSource: async () => {
        const response = await patientsService.getPatients({ limit: 10 })
        const columns = [
          {
            key: 'name',
            label: 'Patient',
            render: (_: unknown, row: Patient) =>
              `${row.firstName} ${row.lastName}`,
          },
          {
            key: 'phone',
            label: 'Téléphone',
            render: (value: string) => formatPhoneNumber(value || ''),
          },
          {
            key: 'lastVisit',
            label: 'Dernière visite',
            render: () => 'Il y a 2 jours',
          },
        ]
        return {
          columns,
          data: response.data.patients,
          linkTo: (row: Patient) => `/dashboard/patients/${row.id}`,
        }
      },
      refreshInterval: 60000,
    },
    {
      id: 'nurse-stock',
      type: 'list',
      role: ['nurse'],
      title: 'Stock matériel',
      size: 'medium',
      iconName: 'Package',
      dataSource: async () => {
        return {
          items: [
            {
              id: '1',
              title: 'Masques chirurgicaux',
              description: 'Stock faible - 50 unités restantes',
              badge: <Badge variant="warning">Faible</Badge>,
            },
          ],
          emptyMessage: 'Stock normal',
        }
      },
      refreshInterval: 60000,
    },
  ],

  receptionist: [
    {
      id: 'receptionist-today-appointments',
      type: 'calendar',
      role: ['receptionist'],
      title: 'Rendez-vous aujourd\'hui',
      size: 'large',
      iconName: 'Calendar',
      dataSource: async () => {
        const response = await appointmentsService.getAppointments({
          date: getTodayDate(),
          limit: 100,
        })
        return response.data.appointments
      },
      refreshInterval: 30000,
    },
    {
      id: 'receptionist-stats',
      type: 'stats',
      role: ['receptionist'],
      title: 'RDVs programmés',
      size: 'small',
      iconName: 'Calendar',
      dataSource: async () => {
        const response = await appointmentsService.getAppointments({
          date: getTodayDate(),
          limit: 1000,
        })
        return {
          value: response.data.appointments.length,
          subtitle: 'Aujourd\'hui',
          trend: { value: 0, label: '' },
        }
      },
      refreshInterval: 30000,
    },
  ],

  patient: [
    {
      id: 'patient-next-appointment',
      type: 'calendar',
      role: ['patient'],
      title: 'Prochain rendez-vous',
      size: 'medium',
      iconName: 'Calendar',
      dataSource: async () => {
        const response = await appointmentsService.getAppointments({
          status: 'scheduled',
          limit: 5,
        })
        return response.data.appointments
      },
      refreshInterval: 60000,
    },
  ],
}
