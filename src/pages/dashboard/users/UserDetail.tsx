import { useParams } from 'react-router-dom'
import { UserCheck } from 'lucide-react'
import { DetailPage } from '@/components/layouts/DetailPage'

export const UserDetail = () => {
  const { id } = useParams()

  return (
    <DetailPage title="Détails de l'utilisateur" id={id} backTo="/dashboard/users">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <UserCheck className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Détails de l'utilisateur
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Les détails de l'utilisateur seront affichés ici
          </p>
        </div>
      </div>
    </DetailPage>
  )
}


