import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { Heart, Bed, Bath, DollarSign, MapPin, Trash2 } from 'lucide-react'

function formatMoney(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return '—'
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function Favorites() {
  const navigate = useNavigate()
  const { favorites, toggleFavorite, count } = useFavorites()

  if (count === 0) return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
        <Heart size={24} className="text-neutral-300" />
      </div>
      <h2 className="text-xl font-black text-neutral-900">No saved villas yet</h2>
      <p className="text-sm text-neutral-400 max-w-xs">Browse our collection and tap the heart icon to save your favorites.</p>
      <button onClick={() => navigate('/catalog')}
        className="mt-2 bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
        Browse Villas
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Saved Villas</h1>
            <p className="text-sm text-neutral-400 mt-1">{count} villa{count !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick={() => favorites.forEach(f => toggleFavorite(f))}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={(item.images_json?.[0] || item.heroImage) as string || ''}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button onClick={() => toggleFavorite(item)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform">
                  <Heart size={14} className="fill-red-500 text-red-500" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-neutral-900 mb-1 truncate">{item.name}</h3>
                {item.location && item.location !== 'Unknown' && (
                  <div className="flex items-center gap-1 text-neutral-400 text-xs mb-3">
                    <MapPin size={11} /><span className="truncate">{item.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-100">
                  <span className="flex items-center gap-1"><Bed size={12} />{item.bedrooms != null ? Math.floor(Number(item.bathrooms)) : '—'} BR</span>
                  <span className="flex items-center gap-1"><Bath size={12} />{item.bathrooms != null ? Math.floor(Number(item.bathrooms)) : '—'} BA</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} />From {formatMoney(item.priceUSD)}/nt</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/villa/${item.id}`)}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                    View Villa
                  </button>
                  <button onClick={() => toggleFavorite(item)}
                    className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-neutral-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}