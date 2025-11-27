import { FileText, Plus } from 'lucide-react'

export const PrescriptionsList = () => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez toutes les prescriptions médicales
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-5 w-5" />
          Nouvelle prescription
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Aucune prescription
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            La liste des prescriptions sera affichée ici
          </p>
        </div>
      </div>
    </div>
  )
}


