import { useNavigate } from 'react-router-dom'
import { Search, Bed, Bath, DollarSign, ArrowRight, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { publicApi } from '../api/api'
import type { Listing } from '../types/listing'

function formatMoney(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return '—'
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function Home() {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('')
  const [curated, setCurated] = useState<Listing[]>([])
  const [loadingCurated, setLoadingCurated] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const minCheckOut = checkIn || today

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    navigate(`/catalog?${params.toString()}`)
  }

  // Fetch top 4 ranked villas
  useEffect(() => {
    publicApi.get('/public/listings?destination=St.+Barts&limit=4&sort=rank&page=1')
      .then(res => setCurated(res.results || []))
      .catch(() => { })
      .finally(() => setLoadingCurated(false))
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative h-[92vh] flex items-center justify-center overflow-hidden">
        <img
          src="/assets/villanet-login.jpg"
          alt="St. Barts luxury villa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-white/70 mb-4">
            St. Barthélemy · French West Indies
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Villa Rentals<br />
            <span className="italic font-bold">in St. Barts</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto font-normal">
            Curated luxury villas, vetted property managers,<br className="hidden md:block" /> exceptional Caribbean stays.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-2xl mx-auto shadow-2xl">
            <div className="flex flex-col flex-1 px-3 py-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Check in</span>
              <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)}
                className="text-sm text-neutral-900 bg-transparent focus:outline-none" />
            </div>
            <div className="hidden md:block w-px h-10 bg-neutral-200" />
            <div className="flex flex-col flex-1 px-3 py-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Check out</span>
              <input type="date" value={checkOut} min={minCheckOut} onChange={e => setCheckOut(e.target.value)}
                className="text-sm text-neutral-900 bg-transparent focus:outline-none" />
            </div>
            <div className="hidden md:block w-px h-10 bg-neutral-200" />
            <div className="flex flex-col flex-1 px-3 py-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Guests</span>
              <input type="number" min={1} max={30} placeholder="Add guests" value={guests} onChange={e => setGuests(e.target.value)}
                className="text-sm text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-400" />
            </div>
            <button onClick={handleSearch}
              className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap">
              <Search size={16} /> Search Villas
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest uppercase">Explore</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ── CURATED PICKS ────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-2">
                Hand-selected by VillaNet
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900">
                Top Villas in St. Barts
              </h2>
            </div>
            <button onClick={() => navigate('/catalog')}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              View all <ArrowRight size={15} />
            </button>
          </div>

          {/* Grid */}
          {loadingCurated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-neutral-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded w-3/4" />
                    <div className="h-3 bg-neutral-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {curated.map(item => (
                <div key={item.id}
                  onClick={() => navigate(`/villa/${item.id}`)}
                  className="group rounded-2xl border border-neutral-100 overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img
                      src={(item.images_json?.[0] || item.heroImage) as string || ''}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {(item.rank ?? item.villanet_rank) && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/95 rounded-full text-[10px] font-bold text-neutral-700">
                        <Star size={11} className="text-yellow-500 fill-yellow-500" />
                        {item.rank ?? item.villanet_rank}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 mb-1 truncate text-sm">{item.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><Bed size={11} />{item.bedrooms ?? '—'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Bath size={11} />{item.bathrooms != null ? Math.floor(Number(item.bathrooms)) : '—'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} />{formatMoney(item.priceUSD ?? (item as any).price_usd)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA mobile */}
          <div className="mt-8 text-center md:hidden">
            <button onClick={() => navigate('/catalog')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              View all villas <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────────────────── */}
      <section className="bg-neutral-50 py-16 px-4 text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">
          Curated by VillaNet
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4">
          The finest villas in<br />St. Barthélemy
        </h2>
        <p className="text-neutral-500 max-w-md mx-auto mb-8 text-sm">
          Every villa is hand-selected and managed by vetted property managers.
          No surprises, just exceptional stays.
        </p>
        <button onClick={() => navigate('/catalog')}
          className="bg-neutral-900 hover:bg-neutral-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200">
          Browse all villas
        </button>
      </section>

    </div>
  )
}