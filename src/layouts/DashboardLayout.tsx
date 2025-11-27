import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/libs/utils'
import { getAccessibleRoutes } from '@/utils/role-based-access'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  roles: Array<'admin' | 'doctor' | 'nurse' | 'patient' | 'receptionist'>
}

const navItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
  },
  {
    label: 'Rendez-vous',
    icon: Calendar,
    path: '/dashboard/appointments',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
  },
  {
    label: 'Patients',
    icon: Users,
    path: '/dashboard/patients',
    roles: ['admin', 'doctor', 'nurse', 'receptionist'],
  },
  {
    label: 'Utilisateurs',
    icon: UserCheck,
    path: '/dashboard/users',
    roles: ['admin'],
  },
  {
    label: 'Prescriptions',
    icon: FileText,
    path: '/dashboard/prescriptions',
    roles: ['admin', 'doctor', 'nurse'],
  },
  {
    label: 'Laboratoire',
    icon: ClipboardList,
    path: '/dashboard/lab-orders',
    roles: ['admin', 'doctor', 'nurse'],
  },
  {
    label: 'Documents',
    icon: FolderOpen,
    path: '/dashboard/documents',
    roles: ['admin', 'doctor', 'nurse', 'patient', 'receptionist'],
  },
]

export const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const accessibleRoutes = getAccessibleRoutes(user.role)
  const filteredNavItems = navItems.filter((item) =>
    accessibleRoutes.includes(item.path)
  )

  const getUserInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">CareHealth</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg px-4 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {getUserInitials()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-xs text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 border-b bg-white shadow-sm">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-auto">
              <p className="text-sm text-gray-600">
                Bienvenue, <span className="font-medium">{user.firstName}</span>
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


