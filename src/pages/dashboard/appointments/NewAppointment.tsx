import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'

export const NewAppointment = () => {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/dashboard/appointments"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-600">
            Créez un nouveau rendez-vous médical
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Formulaire de création
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Le formulaire de création sera implémenté ici
          </p>
        </div>
      </div>
    </div>
  )
}


