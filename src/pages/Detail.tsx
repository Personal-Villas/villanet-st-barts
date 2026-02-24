import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { publicApi } from '../api/api'
import { useFavorites } from '../context/FavoritesContext'
import type { Listing } from '../types/listing'
import {
  Heart, Bed, Bath, Users, MapPin, ChevronLeft, ChevronRight,
  ArrowLeft, DollarSign, Shield
} from 'lucide-react'
import { getRecaptchaToken } from '../services/reCaptcha.service'

function formatMoney(n: number | null | undefined) {
  if (n == null || isNaN(Number(n))) return '—'
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgIdx, setImgIdx] = useState(0)

  // Inquiry form
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    publicApi.get(`/public/listings/${id}`)
      .then(data => setListing(data))
      .catch(() => setError('Villa not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const images = listing?.images_json?.length
    ? listing.images_json
    : listing?.heroImage ? [listing.heroImage] : []

  const prevImg = useCallback(() => setImgIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const nextImg = useCallback(() => setImgIdx(i => (i + 1) % images.length), [images.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) { 
      setFormError('Please fill in all required fields.')
      return 
    }
    
    setSending(true)
    setFormError(null)
    
    try {
      // 2. Obtener el token ANTES de enviar los datos
      const token = await getRecaptchaToken('inquiry_form')
      
      if (!token) {
        throw new Error('Verification failed')
      }

      // 3. Incluir recaptchaToken en el payload para el backend
      await publicApi.post('/public/property-messages', {
        listingId: id,
        name, 
        email, 
        message, 
        checkIn, 
        checkOut, 
        guests,
        recaptchaToken: token 
      })
      setSent(true)
    } catch (err) {
      setFormError('Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !listing) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-neutral-500">{error || 'Villa not found.'}</p>
      <button onClick={() => navigate('/catalog')} className="text-sm underline text-neutral-700">Back to catalog</button>
    </div>
  )

  const favorite = isFavorite(listing.id)

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mb-1">{listing.name}</h1>
            {listing.location && listing.location !== 'Unknown' && (
              <div className="flex items-center gap-1 text-neutral-400 text-sm">
                <MapPin size={13} />{listing.location}
              </div>
            )}
          </div>
          <button onClick={() => toggleFavorite(listing)} className="flex-shrink-0 w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:border-neutral-400 transition-all">
            <Heart size={16} className={favorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left col: gallery + details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            {images.length > 0 && (
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-200 group">
                <img src={images[imgIdx] as string} alt={listing.name} className="w-full h-full object-cover" />

                {images.length > 1 && (
                  <>
                    <button onClick={prevImg} disabled={imgIdx === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                      {imgIdx + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex gap-1.5">
                    {images.slice(0, 5).map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-6">
              <h2 className="text-base font-bold text-neutral-900 mb-4">Villa Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Bed, label: 'Bedrooms', value: listing.bedrooms != null ? Math.floor(Number(listing.bedrooms)) : '—' },
                  { icon: Bath, label: 'Bathrooms', value: listing.bathrooms != null ? Math.floor(Number(listing.bathrooms)) : '—' },
                  { icon: Users, label: 'Max Guests', value: listing.max_guests ?? '—' },
                  { icon: DollarSign, label: 'From / night', value: formatMoney(listing.priceUSD ?? (listing as any).price_usd) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center p-4 bg-neutral-50 rounded-xl gap-2">
                    <Icon size={18} className="text-neutral-400" />
                    <span className="text-lg font-black text-neutral-900">{value}</span>
                    <span className="text-xs text-neutral-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manager */}
            {listing.villaNetPropertyManagerName && (
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex items-center gap-3">
                <Shield size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Managed by</p>
                  <p className="text-sm font-semibold text-neutral-900">{listing.villaNetPropertyManagerName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right col: inquiry form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 sticky top-24">
              <h2 className="text-base font-bold text-neutral-900 mb-1">Request information</h2>
              <p className="text-xs text-neutral-400 mb-5">Our team will get back to you within 24h.</p>

              {sent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={20} className="text-green-500" />
                  </div>
                  <p className="font-semibold text-neutral-900 mb-1">Message sent!</p>
                  <p className="text-sm text-neutral-400">We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your name *"
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *"
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900" />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold px-1">Check in</label>
                      <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900" />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold px-1">Check out</label>
                      <input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900" />
                    </div>
                  </div>

                  <input type="number" min={1} value={guests} onChange={e => setGuests(e.target.value)} placeholder="Number of guests"
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900" />

                  <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message *" rows={4} maxLength={1000}
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 resize-none" />

                  {formError && <p className="text-xs text-red-500">{formError}</p>}

                  <button type="submit" disabled={sending}
                    className="w-full py-3 bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
                    {sending ? 'Sending...' : 'Send inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}