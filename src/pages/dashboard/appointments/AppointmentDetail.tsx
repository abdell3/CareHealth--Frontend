import { useParams } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'

export const AppointmentDetail = () => {
  const { id } = useParams()

  return (
    <DetailPage
      title="Détails du rendez-vous"
      id={id}
      backTo="/dashboard/appointments"
    >
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Détails du rendez-vous
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Les détails du rendez-vous seront affichés ici
          </p>
        </div>
      </div>
    </DetailPage>
  )
}


