import { memo, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Calendar,
  Pill,
  FlaskConical,
  FolderOpen,
  CreditCard,
  Settings,
  Menu,
  X,
  Heart,
  LogOut,
  Bell,
  Phone,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/libs/utils'
import { getUserInitials } from '@/utils/helpers'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PatientNavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const patientNavItems: PatientNavItem[] = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/patient/dashboard',
  },
  {
    label: 'Mes rendez-vous',
    icon: Calendar,
    path: '/patient/appointments',
  },
  {
    label: 'Mes prescriptions',
    icon: Pill,
    path: '/patient/prescriptions',
  },
  {
    label: 'Résultats labo',
    icon: FlaskConical,
    path: '/patient/lab-results',
  },
  {
    label: 'Mes documents',
    icon: FolderOpen,
    path: '/patient/documents',
  },
  {
    label: 'Facturation',
    icon: CreditCard,
    path: '/patient/billing',
  },
  {
    label: 'Paramètres',
    icon: Settings,
    path: '/patient/settings',
  },
]

export const PatientLayout = memo(() => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/patient/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-medical-blue-400 to-medical-green-400">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CareHealth</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <div className="hidden items-center gap-3 md:flex">
              <Avatar
                initials={getUserInitials(user.firstName, user.lastName)}
                src={user.profile?.avatar}
                size="sm"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">Patient</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 transform bg-white/95 backdrop-blur-sm shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col border-r border-blue-100">
            {/* Close button mobile */}
            <div className="flex h-16 items-center justify-between border-b border-blue-100 px-4 lg:hidden">
              <span className="font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {patientNavItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-medical-blue-50 to-medical-green-50 text-medical-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-medical-blue-600'
                    )}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="lg:inline">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Emergency Button */}
            <div className="border-t border-red-100 p-4">
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                onClick={() => {
                  // TODO: Implement emergency contact
                  window.location.href = 'tel:15'
                }}
              >
                <AlertCircle className="h-5 w-5" />
                <span className="ml-2">Urgence</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Info Banner */}
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Besoin d'aide ?</span> Contactez-nous au{' '}
                <a href="tel:0123456789" className="font-semibold text-medical-blue-600 hover:underline">
                  01 23 45 67 89
                </a>
              </p>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Phone className="h-4 w-4" />
                <span className="ml-2">Appeler</span>
              </Button>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="border-t border-blue-100 bg-white/50 px-4 py-6 lg:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Contact urgence</h4>
                <p className="text-sm text-gray-600">15 - SAMU</p>
                <p className="text-sm text-gray-600">18 - Pompiers</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Assistance</h4>
                <p className="text-sm text-gray-600">Lun-Ven: 8h-20h</p>
                <p className="text-sm text-gray-600">Sam: 9h-13h</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Informations</h4>
                <p className="text-sm text-gray-600">© 2024 CareHealth</p>
                <p className="text-sm text-gray-600">Tous droits réservés</p>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
})

PatientLayout.displayName = 'PatientLayout'

