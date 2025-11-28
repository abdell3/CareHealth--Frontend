import { FolderOpen, Upload } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Button } from '@/components/ui/button'

export const DocumentsList = () => {
  return (
    <PageLayout
      title="Documents"
      description="Gérez tous vos documents médicaux"
      actionButton={
        <Button>
          <Upload className="h-5 w-5" />
          Téléverser
        </Button>
      }
    >

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
    </PageLayout>
  )
}


