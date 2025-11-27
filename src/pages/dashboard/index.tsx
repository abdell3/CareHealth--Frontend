import { useAuth } from '@/hooks/useAuth'
import { LayoutDashboard, Calendar, Users, FileText } from 'lucide-react'

export const DashboardIndex = () => {
  const { user } = useAuth()

  const stats = [
    {
      label: 'Rendez-vous aujourd\'hui',
      value: '0',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Patients',
      value: '0',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Prescriptions',
      value: '0',
      icon: FileText,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-2 text-gray-600">
          Voici un aperçu de votre activité aujourd'hui
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Activité récente
        </h2>
        <p className="text-sm text-gray-600">
          Aucune activité récente
        </p>
      </div>
    </div>
  )
}


