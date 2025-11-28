import { useParams } from 'react-router-dom'
import { User } from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'

export const PatientDetail = () => {
  const { id } = useParams()

  return (
    <DetailPage title="Détails du patient" id={id} backTo="/dashboard/patients">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <User className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Détails du patient
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Les détails du patient seront affichés ici
          </p>
        </div>
      </div>
    </DetailPage>
  )
}


