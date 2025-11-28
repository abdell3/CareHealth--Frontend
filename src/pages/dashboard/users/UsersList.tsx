import { UserCheck, Plus } from 'lucide-react'
import { PageLayout } from '@/components/layouts/PageLayout'
import { Button } from '@/components/ui/button'

export const UsersList = () => {
  return (
    <PageLayout
      title="Utilisateurs"
      description="Gérez tous les utilisateurs du système"
      actionButton={
        <Button>
          <Plus className="h-5 w-5" />
          Nouvel utilisateur
        </Button>
      }
    >

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <UserCheck className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Aucun utilisateur
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            La liste des utilisateurs sera affichée ici
          </p>
        </div>
      </div>
    </PageLayout>
  )
}


