import { FolderOpen, Upload } from 'lucide-react'

export const DocumentsList = () => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez tous vos documents médicaux
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <Upload className="h-5 w-5" />
          Téléverser
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Aucun document
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            La liste des documents sera affichée ici
          </p>
        </div>
      </div>
    </div>
  )
}


