import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Listing } from '../types/listing'

interface FavoritesContextType {
  favorites: Listing[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (item: Listing) => void
  count: number
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)
const STORAGE_KEY = 'stbarts_favorites'

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Listing[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = (id: string) =>
    favorites.some(f => f.id === id || f.listing_id === id)

  const toggleFavorite = (item: Listing) => {
    setFavorites(prev =>
      isFavorite(item.id || item.listing_id || '')
        ? prev.filter(f => f.id !== item.id && f.listing_id !== item.listing_id)
        : [...prev, item]
    )
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, count: favorites.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}