import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Settings, User, Bell, Lock, Shield, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link as RouterLink } from 'react-router-dom'

const PatientSettings = memo(() => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-medical-blue-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-medical-blue-600" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Modifiez vos informations personnelles et votre profil
            </p>
            <RouterLink to="/dashboard/profile">
              <Button variant="outline" className="w-full">
                Modifier mon profil
              </Button>
            </RouterLink>
          </CardContent>
        </Card>

        <Card className="border-medical-blue-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-medical-blue-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Gérez vos préférences de notifications
            </p>
            <Button variant="outline" className="w-full">
              Configurer les notifications
            </Button>
          </CardContent>
        </Card>

        <Card className="border-medical-blue-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-medical-blue-600" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Changez votre mot de passe et gérez la sécurité
            </p>
            <RouterLink to="/dashboard/profile">
              <Button variant="outline" className="w-full">
                Paramètres de sécurité
              </Button>
            </RouterLink>
          </CardContent>
        </Card>

        <Card className="border-medical-blue-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-medical-blue-600" />
              Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Gérez vos données personnelles et votre confidentialité
            </p>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4" />
              <span className="ml-2">Exporter mes données</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

PatientSettings.displayName = 'PatientSettings'

export { PatientSettings }

