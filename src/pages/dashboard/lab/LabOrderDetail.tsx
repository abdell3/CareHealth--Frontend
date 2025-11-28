import { useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'

export const LabOrderDetail = () => {
  const { id } = useParams()

  return (
    <DetailPage title="Détails de la commande" id={id} backTo="/dashboard/lab-orders">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Détails de la commande
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Les détails de la commande seront affichés ici
          </p>
        </div>
      </div>
    </DetailPage>
  )
}


