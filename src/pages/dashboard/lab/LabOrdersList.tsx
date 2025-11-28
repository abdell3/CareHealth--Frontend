import { ClipboardList, Plus } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Button } from '@/components/ui/button'

export const LabOrdersList = () => {
  return (
    <PageLayout
      title="Commandes de laboratoire"
      description="Gérez toutes les commandes de laboratoire"
      actionButton={
        <Button>
          <Plus className="h-5 w-5" />
          Nouvelle commande
        </Button>
      }
    >

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Aucune commande
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            La liste des commandes sera affichée ici
          </p>
        </div>
      </div>
    </PageLayout>
  )
}


