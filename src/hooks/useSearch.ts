import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchService } from '@/api/search.service'
import { useDebounce } from './useDebounce'
import type { SearchParams, SearchResponse, SearchResultType } from '@/types/api'

// LRU Cache simple pour les résultats de recherche
class SearchCache {
  private cache: Map<string, { data: SearchResponse; timestamp: number }> = new Map()
  private maxSize = 50
  private ttl = 5 * 60 * 1000 // 5 minutes

  get(key: string): SearchResponse | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Vérifier TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Déplacer en fin (LRU)
    this.cache.delete(key)
    this.cache.set(key, item)
    return item.data
  }

  set(key: string, data: SearchResponse): void {
    // Si cache plein, supprimer le plus ancien
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }
}

const searchCache = new SearchCache()

/**
 * Hook for global medical search with caching and debouncing
 */
export const useSearch = (params: SearchParams) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const debouncedQuery = useDebounce(params.q, 300)

  // Cache key basé sur les paramètres
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      q: debouncedQuery,
      types: params.types?.sort(),
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      status: params.status,
      city: params.city,
      doctorId: params.doctorId,
      medication: params.medication,
      limit: params.limit,
      offset: params.offset,
      sortBy: params.sortBy,
    })
  }, [debouncedQuery, params])

  // Vérifier le cache d'abord
  const cachedResult = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return null
    return searchCache.get(cacheKey)
  }, [cacheKey, debouncedQuery])

  // Query avec React Query
  const {
    data: searchData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', cacheKey],
    queryFn: async () => {
      // Si résultat en cache, retourner immédiatement
      const cached = searchCache.get(cacheKey)
      if (cached) return { data: cached }

      // Sinon, faire la requête
      const response = await searchService.search({
        ...params,
        q: debouncedQuery,
      })

      // Mettre en cache
      if (response.data) {
        searchCache.set(cacheKey, response.data)
      }

      return response
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Suggestions
  const {
    data: suggestionsData,
    isLoading: isLoadingSuggestions,
  } = useQuery({
    queryKey: ['search', 'suggestions', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return { data: [] }
      const response = await searchService.getSuggestions(debouncedQuery)
      return response
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Utiliser le cache ou les données de la query
  const results = useMemo(() => {
    if (cachedResult) return cachedResult
    return searchData?.data
  }, [cachedResult, searchData])

  // Ajouter à l'historique
  const addToHistory = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return

    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query)
      return [query, ...filtered].slice(0, 10) // Garder max 10
    })
  }, [])

  // Suggestions contextuelles basées sur l'historique et les tendances
  const contextualSuggestions = useMemo(() => {
    const suggestions: string[] = []

    // Ajouter suggestions de l'API
    if (suggestionsData?.data) {
      suggestions.push(...suggestionsData.data)
    }

    // Ajouter suggestions de l'historique
    if (debouncedQuery) {
      const historyMatches = searchHistory
        .filter((h) => h.toLowerCase().includes(debouncedQuery.toLowerCase()))
        .slice(0, 3)
      suggestions.push(...historyMatches)
    }

    return [...new Set(suggestions)].slice(0, 5) // Dédupliquer et limiter
  }, [suggestionsData, searchHistory, debouncedQuery])

  return {
    results,
    suggestions: contextualSuggestions,
    isLoading: isLoading && !cachedResult,
    isLoadingSuggestions,
    error,
    refetch,
    addToHistory,
    clearCache: () => searchCache.clear(),
  }
}

