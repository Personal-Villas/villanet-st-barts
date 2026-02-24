import { useState, useEffect, useCallback } from 'react'
import { publicApi } from '../api/api'
import type { Listing } from '../types/listing'

interface Filters {
  page: number
  guests: number
  sortBy: string
  query: string
  checkIn: string
  checkOut: string
  bedrooms: string[]
  bathrooms: string[]
  minPrice: string
  maxPrice: string
  amenities: string[]
}

export function useListings(filters: Filters) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        destination: 'St. Barts',
        page: filters.page.toString(),
        limit: '12',
        guests: filters.guests.toString(),
        sort: filters.sortBy,
      })
      if (filters.query) params.append('q', filters.query)
      if (filters.checkIn) params.append('checkIn', filters.checkIn)
      if (filters.checkOut) params.append('checkOut', filters.checkOut)
      if (filters.bedrooms.length) params.append('bedrooms', filters.bedrooms.join(','))
      if (filters.bathrooms.length) params.append('bathrooms', filters.bathrooms.join(','))
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.amenities.length) params.append('amenities', filters.amenities.join(','))

      const res = await publicApi.get(`/public/listings?${params}`)
      setListings(res.results || [])
      setTotalPages(Math.ceil((res.total || 0) / 12))
      setTotalCount(res.total || 0)
    } catch (e) {
      setError('Could not load villas. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchListings() }, [fetchListings])

  return { listings, loading, totalPages, error, refetch: fetchListings, totalCount }
}