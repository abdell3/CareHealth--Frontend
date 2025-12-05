import * as React from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ChevronRight, ChevronLeft, User, FlaskConical, FileCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestCatalog } from '@/components/lab/TestCatalog'
import { patientsService } from '@/api/patients.service'
import { labService } from '@/api/lab.service'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { useApiError } from '@/hooks/useApiError'
import { formatDate } from '@/utils/helpers'
import type { Patient, LabTest, CreateLabOrderRequest } from '@/types/api'

type WizardStep = 1 | 2 | 3

export const NewLabOrder: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>(1)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'stat'>('normal')
  const [instructions, setInstructions] = useState('')
  const [notes, setNotes] = useState('')
  const [desiredResultDate, setDesiredResultDate] = useState('')
  const [consents, setConsents] = useState<string[]>([])

  const debouncedSearch = useDebounce(patientSearch, 300)

  // Search patients
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return { patients: [] }
      const response = await patientsService.getPatients({ search: debouncedSearch, limit: 10 })
      return response.data
    },
  })

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateLabOrderRequest) => {
      const response = await labService.createLabOrder(data)
      return response.data
    },
    onSuccess: (order) => {
      navigate(`/dashboard/lab-orders/${order.id}`)
    },
  })

  const errorMessage = useApiError(createMutation.error)

  const handleTestToggle = (test: LabTest) => {
    setSelectedTests((prev) => {
      const exists = prev.some((t) => t.code === test.code)
      if (exists) {
        return prev.filter((t) => t.code !== test.code)
      }
      return [...prev, test]
    })
  }

  const handleNext = () => {
    if (step === 1 && selectedPatient && selectedTests.length > 0) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep)
    }
  }

  const handleSubmit = () => {
    if (!selectedPatient) return

    createMutation.mutate({
      patientId: selectedPatient.id,
      tests: selectedTests,
      priority,
      instructions,
      notes,
      desiredResultDate: desiredResultDate || undefined,
      consents: consents.length > 0 ? consents : undefined,
    })
  }

  const canProceed = () => {
    if (step === 1) return selectedPatient && selectedTests.length > 0
    if (step === 2) return true
    return false
  }

  // Calculate totals
  const totalCost = selectedTests.reduce((sum, test) => sum + (test.estimatedCost || 0), 0)
  const maxEstimatedTime = selectedTests.reduce((max, test) => {
    const time = test.estimatedTime ? parseInt(test.estimatedTime) : 0
    return Math.max(max, time)
  }, 0)

  // Get patient conditions for recommendations
  const patientConditions = React.useMemo(() => {
    if (!selectedPatient) return []
    const conditions: string[] = []
    // In real app, get from patient medical history
    return conditions
  }, [selectedPatient])

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/dashboard/lab-orders"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle commande de laboratoire</h1>
          <p className="mt-1 text-sm text-gray-600">Créer une nouvelle commande en 3 étapes</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2
                  ${step >= s ? 'border-medical-blue-500 bg-medical-blue-500 text-white' : 'border-gray-300 bg-white text-gray-400'}
                `}
              >
                {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
              </div>
              <p className="mt-2 text-xs font-medium">
                {s === 1 ? 'Patient & Tests' : s === 2 ? 'Instructions' : 'Confirmation'}
              </p>
            </div>
            {s < 3 && (
              <div
                className={`h-1 flex-1 mx-2 ${step > s ? 'bg-medical-blue-500' : 'bg-gray-300'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-medical-blue-200 shadow-medical-card">
        <CardContent className="p-6">
          {/* Step 1: Patient and Tests */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Étape 1 : Patient et tests</h2>

                {/* Patient Selection */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sélectionner un patient
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher un patient..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="pr-10"
                    />
                    <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Patient Results */}
                  {patientSearch && patientsData && (
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border bg-white">
                      {patientsData.patients.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">Aucun patient trouvé</p>
                      ) : (
                        patientsData.patients.map((patient) => (
                          <div
                            key={patient.id}
                            className={`cursor-pointer border-b p-3 hover:bg-gray-50 ${
                              selectedPatient?.id === patient.id ? 'bg-medical-blue-50' : ''
                            }`}
                            onClick={() => {
                              setSelectedPatient(patient)
                              setPatientSearch('')
                            }}
                          >
                            <p className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {patient.email} • {formatDate(patient.dateOfBirth)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Selected Patient */}
                  {selectedPatient && (
                    <div className="mt-3 rounded-lg border border-medical-blue-200 bg-medical-blue-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-medical-blue-900">
                            {selectedPatient.firstName} {selectedPatient.lastName}
                          </p>
                          <p className="text-sm text-medical-blue-700">{selectedPatient.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatient(null)}
                        >
                          Changer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Catalog */}
                <TestCatalog
                  selectedTests={selectedTests}
                  onTestToggle={handleTestToggle}
                  patientConditions={patientConditions}
                />
              </div>
            </div>
          )}

          {/* Step 2: Instructions */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Étape 2 : Instructions et priorité</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Priorité</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent' | 'stat')}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2"
                  >
                    <option value="normal">Normale</option>
                    <option value="urgent">Urgente</option>
                    <option value="stat">Stat (immédiat)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Instructions spécifiques
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Ex: Jeûne de 12h requis, éviter certains médicaments..."
                    className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date souhaitée pour les résultats
                  </label>
                  <Input
                    type="date"
                    value={desiredResultDate}
                    onChange={(e) => setDesiredResultDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Commentaires pour le laboratoire
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes additionnelles..."
                    className="min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Consents requis
                  </label>
                  <div className="space-y-2">
                    {['Consentement général', 'Consentement données sensibles'].map((consent) => (
                      <label key={consent} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={consents.includes(consent)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConsents([...consents, consent])
                            } else {
                              setConsents(consents.filter((c) => c !== consent))
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{consent}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Étape 3 : Confirmation</h2>

              <div className="space-y-4">
                {/* Patient Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Patient</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient && (
                      <div>
                        <p className="font-semibold">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tests Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tests sélectionnés ({selectedTests.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedTests.map((test, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-xs text-gray-500">{test.code}</p>
                          </div>
                          {test.estimatedCost && (
                            <Badge variant="outline">{test.estimatedCost}€</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    {totalCost > 0 && (
                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <p className="font-semibold">Total estimé</p>
                        <p className="text-lg font-bold text-medical-blue-600">{totalCost}€</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Instructions Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Détails</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priorité:</span>
                      <Badge variant={priority === 'stat' ? 'destructive' : priority === 'urgent' ? 'warning' : 'default'}>
                        {priority === 'normal' ? 'Normale' : priority === 'urgent' ? 'Urgente' : 'Stat'}
                      </Badge>
                    </div>
                    {instructions && (
                      <div>
                        <span className="text-gray-600">Instructions:</span>
                        <p className="mt-1 text-gray-900">{instructions}</p>
                      </div>
                    )}
                    {maxEstimatedTime > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Délai estimé:</span>
                        <span className="font-medium">{maxEstimatedTime}h</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {errorMessage && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        {step < 3 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-medical-blue-600 hover:bg-medical-blue-700"
          >
            {createMutation.isPending ? 'Création...' : 'Créer la commande'}
          </Button>
        )}
      </div>
    </div>
  )
}

