import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export const AuthLayout = memo(({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-medical-green-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                CareHealth
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Système de gestion médicale
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            {children}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            © 2024 CareHealth. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
})

AuthLayout.displayName = 'AuthLayout'


