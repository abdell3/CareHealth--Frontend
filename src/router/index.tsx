import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoute } from './protected-route'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PatientLayout } from '@/layouts/PatientLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { queryClient } from '@/lib/query-client'
import { ThemeProvider } from '@/design-system'

// Lazy load all pages for code splitting
const Login = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/auth/Register').then((m) => ({ default: m.Register })))
const ForgotPassword = lazy(() =>
  import('@/pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword }))
)
const ResetPassword = lazy(() =>
  import('@/pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword }))
)

const DashboardIndex = lazy(() =>
  import('@/pages/dashboard/index').then((m) => ({ default: m.DashboardIndex }))
)
const AppointmentsList = lazy(() =>
  import('@/pages/dashboard/appointments/AppointmentsList').then((m) => ({
    default: m.AppointmentsList,
  }))
)
const AppointmentDetail = lazy(() =>
  import('@/pages/dashboard/appointments/AppointmentDetail').then((m) => ({
    default: m.AppointmentDetail,
  }))
)
const NewAppointment = lazy(() =>
  import('@/pages/dashboard/appointments/NewAppointment').then((m) => ({
    default: m.NewAppointment,
  }))
)
const PatientsList = lazy(() =>
  import('@/pages/dashboard/patients/PatientsList').then((m) => ({ default: m.PatientsList }))
)
const PatientDetail = lazy(() =>
  import('@/pages/dashboard/patients/PatientDetail').then((m) => ({ default: m.PatientDetail }))
)
const UsersList = lazy(() =>
  import('@/pages/dashboard/users/UsersList').then((m) => ({ default: m.UsersList }))
)
const UserDetail = lazy(() =>
  import('@/pages/dashboard/users/UserDetail').then((m) => ({ default: m.UserDetail }))
)
const PrescriptionsList = lazy(() =>
  import('@/pages/dashboard/prescriptions/PrescriptionsList').then((m) => ({
    default: m.PrescriptionsList,
  }))
)
const PrescriptionDetail = lazy(() =>
  import('@/pages/dashboard/prescriptions/PrescriptionDetail').then((m) => ({
    default: m.PrescriptionDetail,
  }))
)
const LabOrdersList = lazy(() =>
  import('@/pages/dashboard/lab/LabOrdersList').then((m) => ({ default: m.LabOrdersList }))
)
const LabOrderDetail = lazy(() =>
  import('@/pages/dashboard/lab/LabOrderDetail').then((m) => ({ default: m.LabOrderDetail }))
)
const DocumentsList = lazy(() =>
  import('@/pages/dashboard/documents/DocumentsList').then((m) => ({ default: m.DocumentsList }))
)
const Profile = lazy(() =>
  import('@/pages/profile/Profile').then((m) => ({ default: m.Profile }))
)
const NotificationCenter = lazy(() =>
  import('@/pages/dashboard/notifications/NotificationCenter').then((m) => ({
    default: m.NotificationCenter,
  }))
)
const SearchResultsPage = lazy(() =>
  import('@/pages/dashboard/search/SearchResultsPage').then((m) => ({
    default: m.SearchResultsPage,
  }))
)
const PatientDashboard = lazy(() =>
  import('@/pages/patient/PatientDashboard').then((m) => ({ default: m.PatientDashboard }))
)
const PatientAppointments = lazy(() =>
  import('@/pages/patient/PatientAppointments').then((m) => ({ default: m.PatientAppointments }))
)
const PatientPrescriptions = lazy(() =>
  import('@/pages/patient/PatientPrescriptions').then((m) => ({ default: m.PatientPrescriptions }))
)
const PatientLabResults = lazy(() =>
  import('@/pages/patient/PatientLabResults').then((m) => ({ default: m.PatientLabResults }))
)
const PatientDocuments = lazy(() =>
  import('@/pages/patient/PatientDocuments').then((m) => ({ default: m.PatientDocuments }))
)
const PatientBilling = lazy(() =>
  import('@/pages/patient/PatientBilling').then((m) => ({ default: m.PatientBilling }))
)
const PatientSettings = lazy(() =>
  import('@/pages/patient/PatientSettings').then((m) => ({ default: m.PatientSettings }))
)

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <Register />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <ForgotPassword />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthLayout>
        <Suspense fallback={<PageLoader />}>
          <ResetPassword />
        </Suspense>
      </AuthLayout>
    ),
  },

  // Protected routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardIndex />
          </Suspense>
        ),
      },
      {
        path: 'appointments',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppointmentsList />
          </Suspense>
        ),
      },
      {
        path: 'appointments/new',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <Suspense fallback={<PageLoader />}>
              <NewAppointment />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'appointments/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppointmentDetail />
          </Suspense>
        ),
      },
      {
        path: 'patients',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <Suspense fallback={<PageLoader />}>
              <PatientsList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'patients/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <Suspense fallback={<PageLoader />}>
              <PatientDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<PageLoader />}>
              <UsersList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<PageLoader />}>
              <UserDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'prescriptions',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <Suspense fallback={<PageLoader />}>
              <PrescriptionsList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'prescriptions/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <Suspense fallback={<PageLoader />}>
              <PrescriptionDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'lab-orders',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <Suspense fallback={<PageLoader />}>
              <LabOrdersList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'lab-orders/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <Suspense fallback={<PageLoader />}>
              <LabOrderDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DocumentsList />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotificationCenter />
          </Suspense>
        ),
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SearchResultsPage />
          </Suspense>
        ),
      },
    ],
  },

  // Patient routes
  {
    path: '/patient',
    element: (
      <ProtectedRoute allowedRoles={['patient', 'admin']}>
        <PatientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientDashboard />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientDashboard />
          </Suspense>
        ),
      },
      {
        path: 'appointments',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientAppointments />
          </Suspense>
        ),
      },
      {
        path: 'appointments/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppointmentDetail />
          </Suspense>
        ),
      },
      {
        path: 'prescriptions',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientPrescriptions />
          </Suspense>
        ),
      },
      {
        path: 'lab-results',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientLabResults />
          </Suspense>
        ),
      },
      {
        path: 'documents',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientDocuments />
          </Suspense>
        ),
      },
      {
        path: 'billing',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientBilling />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PatientSettings />
          </Suspense>
        ),
      },
    ],
  },

  // Default redirect
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // 404 handler
  {
    path: '*',
    element: (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-2 text-gray-600">Page not found</p>
        </div>
      </div>
    ),
  },
])

export const AppRouter = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
