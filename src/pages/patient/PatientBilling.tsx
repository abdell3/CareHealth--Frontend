import { useMemo, memo } from 'react'
import { CreditCard, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/utils/helpers'

// Mock billing data - would come from API
interface Invoice {
  id: string
  date: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  description: string
  items: Array<{ name: string; amount: number }>
}

const PatientBilling = memo(() => {
  // Mock data - would be fetched from API
  const invoices: Invoice[] = useMemo(
    () => [
      {
        id: '1',
        date: new Date().toISOString(),
        amount: 25.0,
        status: 'pending',
        description: 'Consultation du 15 janvier 2024',
        items: [{ name: 'Consultation', amount: 25.0 }],
      },
    ],
    []
  )

  const pendingInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === 'pending'),
    [invoices]
  )

  const paidInvoices = useMemo(
    () => invoices.filter((inv) => inv.status === 'paid'),
    [invoices]
  )

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">En attente</Badge>
      case 'paid':
        return <Badge variant="success">Payée</Badge>
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Consultez vos factures et effectuez vos paiements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-medical-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-medical-blue-600">
                  {pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)} €
                </p>
              </div>
              <Clock className="h-8 w-8 text-medical-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-medical-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payées ce mois</p>
                <p className="text-2xl font-bold text-medical-green-600">
                  {paidInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)} €
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-medical-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600">0.00 €</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            En attente ({pendingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">Payées ({paidInvoices.length})</TabsTrigger>
        </TabsList>

        {/* Pending Invoices */}
        <TabsContent value="pending" className="mt-6">
          {pendingInvoices.length > 0 ? (
            <div className="space-y-4">
              {pendingInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-medical-blue-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{invoice.description}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(invoice.date)} • Facture #{invoice.id}
                            </p>
                          </div>
                        </div>
                        <div className="ml-8 space-y-1">
                          {invoice.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="font-medium text-gray-900">{item.amount.toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                        <div className="ml-8 flex items-center justify-between border-t pt-2">
                          <span className="font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-medical-blue-600">
                            {invoice.amount.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(invoice.status)}
                        <Button
                          className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white"
                        >
                          Payer maintenant
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="ml-2">Télécharger</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucune facture en attente
                </h3>
                <p className="text-sm text-gray-600">Toutes vos factures sont à jour</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Paid Invoices */}
        <TabsContent value="paid" className="mt-6">
          {paidInvoices.length > 0 ? (
            <div className="space-y-4">
              {paidInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-gray-200 opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{invoice.description}</h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(invoice.date)} • {invoice.amount.toFixed(2)} €
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(invoice.status)}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucune facture payée
                </h3>
                <p className="text-sm text-gray-600">
                  Vos factures payées apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
})

PatientBilling.displayName = 'PatientBilling'

export { PatientBilling }

