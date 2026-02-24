import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useFavorites } from '../context/FavoritesContext'
import { Heart, Bed, Bath, DollarSign, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'

const SORT_OPTIONS = [
  { value: 'rank', label: 'Top Ranked' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'bedrooms', label: 'Most Bedrooms' },
]

const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5', '6+']
const BATHROOM_OPTIONS = ['1', '2', '3', '4', '5+']

function formatMoney(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return '—'
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export function Catalog() {
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    page: 1,
    guests: Number(searchParams.get('guests')) || 0,
    sortBy: 'rank',
    query: '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    bedrooms: [] as string[],
    bathrooms: [] as string[],
    minPrice: '',
    maxPrice: '',
    amenities: [] as string[],
  })

  const [showFilters, setShowFilters] = useState(false)
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({})

  const { listings, loading, totalPages, error, totalCount } = useListings(filters)
  const { isFavorite, toggleFavorite } = useFavorites()

  // Leer params de URL al montar
  useEffect(() => {
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests')
    if (checkIn || checkOut || guests) {
      setFilters(prev => ({
        ...prev,
        checkIn: checkIn || prev.checkIn,
        checkOut: checkOut || prev.checkOut,
        guests: guests ? Number(guests) : prev.guests,
      }))
    }
  }, [])

  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleClear = useCallback(() => {
    setFilters({
      page: 1, guests: 0, sortBy: 'rank', query: '',
      checkIn: '', checkOut: '', bedrooms: [], bathrooms: [],
      minPrice: '', maxPrice: '', amenities: [],
    })
  }, [])

  const toggleBedroom = (val: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      bedrooms: prev.bedrooms.includes(val)
        ? prev.bedrooms.filter(b => b !== val)
        : [...prev.bedrooms, val]
    }))
  }

  const toggleBathroom = (val: string) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      bathrooms: prev.bathrooms.includes(val)
        ? prev.bathrooms.filter(b => b !== val)
        : [...prev.bathrooms, val]
    }))
  }

  const handlePrevImage = useCallback((e: React.MouseEvent, id: string, total: number) => {
    e.stopPropagation()
    setImageIndices(prev => ({ ...prev, [id]: ((prev[id] || 0) - 1 + total) % total }))
  }, [])

  const handleNextImage = useCallback((e: React.MouseEvent, id: string, total: number) => {
    e.stopPropagation()
    setImageIndices(prev => ({ ...prev, [id]: ((prev[id] || 0) + 1) % total }))
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const activeFiltersCount = [
    filters.bedrooms.length > 0,
    filters.bathrooms.length > 0,
    filters.minPrice,
    filters.maxPrice,
    filters.checkIn,
    filters.checkOut,
    filters.guests > 0,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* SEARCH BAR */}
      <SearchBar
        itemsCount={totalCount}
        sortBy={filters.sortBy}
        setSortBy={v => setFilters(prev => ({ ...prev, sortBy: v, page: 1 }))}
        checkIn={filters.checkIn}
        setCheckIn={v => setFilters(prev => ({ ...prev, checkIn: v, page: 1 }))}
        checkOut={filters.checkOut}
        setCheckOut={v => setFilters(prev => ({ ...prev, checkOut: v, page: 1 }))}
        bedrooms={filters.bedrooms}
        setBedrooms={v => setFilters(prev => ({ ...prev, bedrooms: v, page: 1 }))}
        bathrooms={filters.bathrooms}
        setBathrooms={v => setFilters(prev => ({ ...prev, bathrooms: v, page: 1 }))}
        minPrice={filters.minPrice}
        setMinPrice={v => setFilters(prev => ({ ...prev, minPrice: v, page: 1 }))}
        maxPrice={filters.maxPrice}
        setMaxPrice={v => setFilters(prev => ({ ...prev, maxPrice: v, page: 1 }))}
        guests={filters.guests}
        setGuests={v => setFilters(prev => ({ ...prev, guests: v, page: 1 }))}
        onApplyFilters={handleSearch}
        onClearAllFilters={handleClear}
      />

      {/* GRID */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {error && (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-black text-neutral-900 mb-2">No villas found</p>
            <p className="text-neutral-500 text-sm mb-6">Try adjusting your filters</p>
            <button onClick={handleClear} className="bg-neutral-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-700 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item, idx) => {
              const images = item.images_json?.length ? item.images_json : [item.heroImage].filter(Boolean)
              const imgIdx = imageIndices[item.id] || 0
              const favorite = isFavorite(item.id)

              return (
                <div key={item.id} className="group border border-neutral-200 rounded-xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200">

                  {/* Imagen */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img
                      src={images[imgIdx] as string || ''}
                      alt={item.name}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Flechas */}
                    {images.length > 1 && <>
                      <button disabled={imgIdx === 0}
                        onClick={e => handlePrevImage(e, item.id, images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                      ><ChevronLeft size={14} /></button>
                      <button onClick={e => handleNextImage(e, item.id, images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      ><ChevronRight size={14} /></button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">
                        {imgIdx + 1} / {images.length}
                      </div>
                    </>}

                    {/* Favorito */}
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow transition-all hover:scale-110"
                    >
                      <Heart size={14} className={favorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 mb-1 truncate">{item.name}</h3>
                    {item.location && item.location !== 'Unknown' && (
                      <div className="flex items-center gap-1 text-neutral-400 text-xs mb-3">
                        <MapPin size={11} />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4 pb-3 border-b border-neutral-100">
                      <span className="flex items-center gap-1"><Bed size={12} />{item.bedrooms ?? '—'} BR</span>
                      <span className="flex items-center gap-1"><Bath size={12} />{item.bathrooms ?? '—'} BA</span>
                      <span className="flex items-center gap-1"><DollarSign size={12} />From {formatMoney(item.priceUSD)}/nt</span>
                    </div>

                    <button
                      onClick={() => window.location.href = `/villa/${item.id}`}
                      className="w-full bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
                    >
                      View Villa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-neutral-400 transition-colors"
            >← Prev</button>

            <span className="text-sm text-neutral-500 px-4">
              Page {filters.page} of {totalPages}
            </span>

            <button
              disabled={filters.page === totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-neutral-400 transition-colors"
            >Next →</button>
          </div>
        )}
      </main>
    </div>
  )
}