import { FileText, Plus } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Button } from '@/components/ui/button'

export const PrescriptionsList = () => {
  return (
    <PageLayout
      title="Prescriptions"
      description="Gérez toutes les prescriptions médicales"
      actionButton={
        <Button>
          <Plus className="h-5 w-5" />
          Nouvelle prescription
        </Button>
      }
    >

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
    </PageLayout>
  )
}


