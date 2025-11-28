import { Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'

export const AppointmentsList = () => {
  return (
    <PageLayout
      title="Rendez-vous"
      description="Gérez tous vos rendez-vous médicaux"
      actionButton={
        <Link
          to="/dashboard/appointments/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Nouveau rendez-vous
        </Link>
      }
    >

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
    </PageLayout>
  )
}


