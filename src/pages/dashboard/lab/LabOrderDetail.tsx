import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList } from 'lucide-react'

export const LabOrderDetail = () => {
  const { id } = useParams()

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/dashboard/lab-orders"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Détails de la commande</h1>
          <p className="mt-1 text-sm text-gray-600">ID: {id}</p>
        </div>
      </div>

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
    </div>
  )
}


