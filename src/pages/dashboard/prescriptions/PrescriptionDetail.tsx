import { useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'

export const PrescriptionDetail = () => {
  const { id } = useParams()

  return (
    <DetailPage title="Détails de la prescription" id={id} backTo="/dashboard/prescriptions">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Détails de la prescription
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Les détails de la prescription seront affichés ici
          </p>
        </div>
      </div>
    </DetailPage>
  )
}


