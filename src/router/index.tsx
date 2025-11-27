import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoute } from './protected-route'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Auth pages
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'

// Dashboard pages
import { DashboardIndex } from '@/pages/dashboard/index'
import { AppointmentsList } from '@/pages/dashboard/appointments/AppointmentsList'
import { AppointmentDetail } from '@/pages/dashboard/appointments/AppointmentDetail'
import { NewAppointment } from '@/pages/dashboard/appointments/NewAppointment'
import { PatientsList } from '@/pages/dashboard/patients/PatientsList'
import { PatientDetail } from '@/pages/dashboard/patients/PatientDetail'
import { UsersList } from '@/pages/dashboard/users/UsersList'
import { UserDetail } from '@/pages/dashboard/users/UserDetail'
import { PrescriptionsList } from '@/pages/dashboard/prescriptions/PrescriptionsList'
import { PrescriptionDetail } from '@/pages/dashboard/prescriptions/PrescriptionDetail'
import { LabOrdersList } from '@/pages/dashboard/lab/LabOrdersList'
import { LabOrderDetail } from '@/pages/dashboard/lab/LabOrderDetail'
import { DocumentsList } from '@/pages/dashboard/documents/DocumentsList'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPassword />
      </AuthLayout>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthLayout>
        <ResetPassword />
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
        element: <DashboardIndex />,
      },
      {
        path: 'appointments',
        element: <AppointmentsList />,
      },
      {
        path: 'appointments/new',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <NewAppointment />
          </ProtectedRoute>
        ),
      },
      {
        path: 'appointments/:id',
        element: <AppointmentDetail />,
      },
      {
        path: 'patients',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <PatientsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'patients/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}>
            <PatientDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <UserDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'prescriptions',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <PrescriptionsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'prescriptions/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <PrescriptionDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'lab-orders',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <LabOrdersList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'lab-orders/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
            <LabOrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents',
        element: <DocumentsList />,
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
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
