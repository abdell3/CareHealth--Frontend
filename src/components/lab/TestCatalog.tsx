import * as React from 'react'
import { Search, CheckCircle2, Info, DollarSign, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'
import type { LabTest, LabTestCategory } from '@/types/api'

interface TestCatalogProps {
  selectedTests: LabTest[]
  onTestToggle: (test: LabTest) => void
  patientConditions?: string[] // For smart recommendations
  className?: string
}

// Mock test catalog - in real app, fetch from API
const testCategories: LabTestCategory[] = [
  {
    id: 'hematology',
    name: 'Hématologie',
    icon: '🩸',
    tests: [
      { id: 'cbc', name: 'Numération formule sanguine (NFS)', code: 'CBC', category: 'hematology', description: 'Compte complet des cellules sanguines', estimatedCost: 25, estimatedTime: '24h', requiresFasting: false },
      { id: 'coag', name: 'Coagulation', code: 'COAG', category: 'hematology', description: 'Temps de prothrombine, INR', estimatedCost: 30, estimatedTime: '24h', requiresFasting: false },
      { id: 'ferritin', name: 'Ferritine', code: 'FERR', category: 'hematology', description: 'Taux de ferritine', estimatedCost: 35, estimatedTime: '48h', requiresFasting: false },
    ],
  },
  {
    id: 'biochemistry',
    name: 'Biochimie',
    icon: '🧪',
    tests: [
      { id: 'glucose', name: 'Glycémie', code: 'GLUC', category: 'biochemistry', description: 'Taux de glucose sanguin', estimatedCost: 15, estimatedTime: '24h', requiresFasting: true },
      { id: 'creatinine', name: 'Créatinine', code: 'CREA', category: 'biochemistry', description: 'Fonction rénale', estimatedCost: 20, estimatedTime: '24h', requiresFasting: false },
      { id: 'lipids', name: 'Lipides (Cholestérol, Triglycérides)', code: 'LIPID', category: 'biochemistry', description: 'Profil lipidique complet', estimatedCost: 40, estimatedTime: '48h', requiresFasting: true },
      { id: 'hba1c', name: 'Hémoglobine glyquée (HbA1c)', code: 'HBA1C', category: 'biochemistry', description: 'Contrôle glycémique 3 mois', estimatedCost: 35, estimatedTime: '48h', requiresFasting: false },
    ],
  },
  {
    id: 'hormones',
    name: 'Hormones',
    icon: '⚗️',
    tests: [
      { id: 'tsh', name: 'TSH (Thyroïde)', code: 'TSH', category: 'hormones', description: 'Hormone stimulante thyroïdienne', estimatedCost: 30, estimatedTime: '48h', requiresFasting: false },
      { id: 'cortisol', name: 'Cortisol', code: 'CORT', category: 'hormones', description: 'Hormone du stress', estimatedCost: 40, estimatedTime: '48h', requiresFasting: false },
    ],
  },
  {
    id: 'urine',
    name: 'Urines',
    icon: '💧',
    tests: [
      { id: 'urinalysis', name: 'Analyse d\'urine', code: 'URIN', category: 'urine', description: 'Examen complet urines', estimatedCost: 20, estimatedTime: '24h', requiresFasting: false },
      { id: 'urine-culture', name: 'Culture urinaire', code: 'URCUL', category: 'urine', description: 'Détection bactéries', estimatedCost: 35, estimatedTime: '72h', requiresFasting: false },
    ],
  },
  {
    id: 'other',
    name: 'Autres',
    icon: '🔬',
    tests: [
      { id: 'covid', name: 'Test COVID-19', code: 'COVID', category: 'other', description: 'PCR COVID-19', estimatedCost: 50, estimatedTime: '24h', requiresFasting: false },
      { id: 'pcr', name: 'PCR Générique', code: 'PCR', category: 'other', description: 'Amplification ADN/ARN', estimatedCost: 60, estimatedTime: '48h', requiresFasting: false },
    ],
  },
]

export const TestCatalog: React.FC<TestCatalogProps> = ({
  selectedTests,
  onTestToggle,
  patientConditions = [],
  className,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
    new Set(['hematology', 'biochemistry'])
  )

  // Smart recommendations based on patient conditions
  const recommendedTests = React.useMemo(() => {
    const recommendations: LabTest[] = []
    if (patientConditions.includes('diabetes')) {
      recommendations.push(
        ...testCategories
          .find((cat) => cat.id === 'biochemistry')
          ?.tests.filter((t) => t.code === 'HBA1C' || t.code === 'GLUC') || []
      )
    }
    if (patientConditions.includes('hypertension')) {
      recommendations.push(
        ...testCategories
          .find((cat) => cat.id === 'biochemistry')
          ?.tests.filter((t) => t.code === 'CREA' || t.code === 'LIPID') || []
      )
    }
    return recommendations
  }, [patientConditions])

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return testCategories

    const term = searchTerm.toLowerCase()
    return testCategories.map((category) => ({
      ...category,
      tests: category.tests.filter(
        (test) =>
          test.name.toLowerCase().includes(term) ||
          test.code.toLowerCase().includes(term) ||
          test.description?.toLowerCase().includes(term)
      ),
    })).filter((category) => category.tests.length > 0)
  }, [searchTerm])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const isTestSelected = (test: LabTest) => {
    return selectedTests.some((t) => t.code === test.code)
  }

  // Calculate totals
  const totalCost = selectedTests.reduce((sum, test) => sum + (test.estimatedCost || 0), 0)
  const maxEstimatedTime = selectedTests.reduce((max, test) => {
    const time = test.estimatedTime ? parseInt(test.estimatedTime) : 0
    return Math.max(max, time)
  }, 0)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un test (nom, code, description)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Recommendations */}
      {recommendedTests.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-900">
              💡 Recommandations intelligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendedTests.map((test) => (
                <Badge
                  key={test.code}
                  variant={isTestSelected(test) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onTestToggle(test)}
                >
                  {test.name}
                  {isTestSelected(test) && <CheckCircle2 className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="border-medical-blue-200">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <span>{category.name}</span>
                  <Badge variant="outline">{category.tests.length} tests</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  {expandedCategories.has(category.id) ? '▼' : '▶'}
                </Button>
              </div>
            </CardHeader>
            {expandedCategories.has(category.id) && (
              <CardContent>
                <div className="space-y-3">
                  {category.tests.map((test) => {
                    const isSelected = isTestSelected(test)
                    return (
                      <div
                        key={test.code}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                          isSelected
                            ? 'border-medical-blue-500 bg-medical-blue-50'
                            : 'border-gray-200 hover:border-medical-blue-300 hover:bg-gray-50',
                          'cursor-pointer'
                        )}
                        onClick={() => onTestToggle(test)}
                      >
                        <div className="mt-1">
                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-medical-blue-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{test.name}</p>
                            <Badge variant="outline" className="font-mono text-xs">
                              {test.code}
                            </Badge>
                            {test.requiresFasting && (
                              <Badge variant="warning" className="text-xs">
                                Jeûne requis
                              </Badge>
                            )}
                          </div>
                          {test.description && (
                            <p className="mt-1 text-sm text-gray-600">{test.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            {test.estimatedCost && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{test.estimatedCost}€</span>
                              </div>
                            )}
                            {test.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{test.estimatedTime}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      {selectedTests.length > 0 && (
        <Card className="border-medical-blue-500 bg-medical-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-medical-blue-900">
                  {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} sélectionné
                  {selectedTests.length > 1 ? 's' : ''}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-medical-blue-700">
                  {totalCost > 0 && (
                    <span>
                      <DollarSign className="mr-1 inline h-4 w-4" />
                      Total: {totalCost}€
                    </span>
                  )}
                  {maxEstimatedTime > 0 && (
                    <span>
                      <Clock className="mr-1 inline h-4 w-4" />
                      Délai max: {maxEstimatedTime}h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

