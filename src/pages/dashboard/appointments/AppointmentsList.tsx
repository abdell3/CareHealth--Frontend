import { Calendar, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AppointmentsList = () => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez tous vos rendez-vous médicaux
          </p>
        </div>
        <Link
          to="/dashboard/appointments/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Nouveau rendez-vous
        </Link>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Aucun rendez-vous
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Les rendez-vous seront affichés ici
          </p>
        </div>
      </div>
    </div>
  )
}


