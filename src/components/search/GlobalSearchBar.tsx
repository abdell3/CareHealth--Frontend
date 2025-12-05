import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Mic, Loader2, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useSearch } from '@/hooks/useSearch'
import { cn } from '@/libs/utils'
import type { SearchResultType, SearchResult } from '@/types/api'

interface GlobalSearchBarProps {
  className?: string
  onResultClick?: (result: SearchResult) => void
}

const typeColors: Record<SearchResultType, string> = {
  patient: 'bg-blue-100 text-blue-700 border-blue-200',
  appointment: 'bg-green-100 text-green-700 border-green-200',
  prescription: 'bg-purple-100 text-purple-700 border-purple-200',
  document: 'bg-orange-100 text-orange-700 border-orange-200',
  lab: 'bg-red-100 text-red-700 border-red-200',
}

const typeIcons: Record<SearchResultType, string> = {
  patient: '👤',
  appointment: '📅',
  prescription: '💊',
  document: '📄',
  lab: '🔬',
}

const typeLabels: Record<SearchResultType, string> = {
  patient: 'Patient',
  appointment: 'Rendez-vous',
  prescription: 'Prescription',
  document: 'Document',
  lab: 'Laboratoire',
}

export const GlobalSearchBar = ({ className, onResultClick }: GlobalSearchBarProps) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { results, suggestions, isLoading, addToHistory } = useSearch({
    q: query,
    limit: 5,
  })

  // Fermer dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navigation clavier
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || !results) return

      const allItems = [
        ...(suggestions || []),
        ...(results.results || []).map((r) => r.id),
      ]

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // Suggestion sélectionnée
          setQuery(suggestions[selectedIndex])
          setIsOpen(false)
        } else if (selectedIndex >= suggestions.length && results.results) {
          // Résultat sélectionné
          const resultIndex = selectedIndex - suggestions.length
          const result = results.results[resultIndex]
          handleResultClick(result)
        } else if (query.trim().length >= 2) {
          // Recherche directe
          navigateToSearch()
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    },
    [isOpen, results, suggestions, selectedIndex, query, navigate]
  )

  const handleResultClick = (result: SearchResult) => {
    addToHistory(query)
    setIsOpen(false)
    setQuery('')

    if (onResultClick) {
      onResultClick(result)
    } else {
      // Navigation par défaut
      const action = result.actions[0]
      if (action?.url) {
        navigate(action.url)
      }
    }
  }

  const navigateToSearch = () => {
    if (query.trim().length >= 2) {
      addToHistory(query)
      navigate(`/dashboard/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setIsOpen(false)
    navigate(`/dashboard/search?q=${encodeURIComponent(suggestion)}`)
  }

  // Grouper résultats par type
  const groupedResults = results?.results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<SearchResultType, SearchResult[]>) || {}

  const hasResults = results && results.results.length > 0
  const hasSuggestions = suggestions && suggestions.length > 0
  const showDropdown = isOpen && (query.length >= 2 || hasSuggestions)

  // Highlight query dans le texte
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Rechercher patients, RDVs, prescriptions..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => {
            if (query.length >= 2 || hasSuggestions) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          icon={<Search className="h-4 w-4 text-gray-400" />}
          className={cn(
            'pr-20 transition-all duration-200',
            isOpen && 'ring-2 ring-medical-blue-500',
            isLoading && 'pr-24'
          )}
        />

        {/* Actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
                inputRef.current?.focus()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[600px] overflow-y-auto shadow-medical-card border-medical-blue-200"
        >
          <div className="p-2">
            {/* Suggestions */}
            {hasSuggestions && (
              <div className="mb-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  <TrendingUp className="h-3 w-3" />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 transition-colors',
                      selectedIndex === index && 'bg-medical-blue-50'
                    )}
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{highlightText(suggestion, query)}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Results by Type */}
            {hasResults && (
              <div className="space-y-3">
                {Object.entries(groupedResults).map(([type, typeResults]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeIcons[type as SearchResultType]}</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {typeLabels[type as SearchResultType]}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {typeResults.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {typeResults.slice(0, 5).map((result, index) => {
                        const globalIndex = suggestions.length + index
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              'w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 transition-all border-l-2 border-transparent',
                              selectedIndex === globalIndex && 'bg-medical-blue-50 border-medical-blue-500'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold shrink-0',
                                typeColors[result.type]
                              )}
                            >
                              {typeIcons[result.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {highlightText(result.title, query)}
                              </div>
                              <div className="text-xs text-gray-600 line-clamp-1">
                                {highlightText(result.description, query)}
                              </div>
                              {result.relevance > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-medical-blue-500 transition-all"
                                      style={{ width: `${result.relevance * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(result.relevance * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !hasResults && query.length >= 2 && (
              <div className="px-3 py-8 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Aucun résultat trouvé
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Essayez avec d'autres mots-clés
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToSearch}
                >
                  Recherche avancée
                </Button>
              </div>
            )}

            {/* View All Results */}
            {hasResults && results.total > results.results.length && (
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-sm font-medium text-medical-blue-600 hover:text-medical-blue-700"
                  onClick={navigateToSearch}
                >
                  Voir tous les résultats ({results.total})
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

