import { useMemo, useState, useEffect, useRef } from 'react'
import {
  Bath, Calendar, DollarSign, Waves, Eye, ChefHat, UtensilsCrossed,
  Users, X, Ship, Footprints, Hotel, Flag, Dumbbell, Film, CircleDot,
  Car, SlidersHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'chef-hat': ChefHat, 'chef-included': ChefHat, chef: ChefHat,
  cook: UtensilsCrossed, 'cook-included': UtensilsCrossed,
  beach: Waves, waves: Waves, 'true-beach-front': Waves, 'heated-pool': Waves, pool: Waves,
  'walk-to-the-beach': Footprints,
  'ocean-front': Ship, 'ocean-view': Eye,
  resort: Hotel, 'resort-villa': Hotel,
  golf: Flag, 'golf-villa': Flag, 'golf-cart-included': Car,
  gym: Dumbbell, 'private-gym': Dumbbell,
  cinema: Film, 'private-cinema': Film,
  pickleball: CircleDot, tennis: CircleDot,
  default: Waves,
}

const guestyCalendarStyles = `
  .gc { font-family: inherit; }
  .gc * { box-sizing: border-box; }
  .gc button { margin:0;padding:0;border:none;background:none;cursor:pointer;font-family:inherit; }
  .gc table { border-collapse:collapse;border-spacing:0;width:100%; }
  .gc-months { display:flex;gap:2rem; }
  .gc-month { flex:1;min-width:280px; }
  .gc-caption { display:flex;justify-content:center;align-items:center;position:relative;margin-bottom:1rem;padding:.5rem 0; }
  .gc-caption-label { font-size:.875rem;font-weight:600;color:#111; }
  .gc-nav { position:absolute;right:0;display:flex;gap:.25rem; }
  .gc-nav-btn { width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;border-radius:.375rem;border:1px solid #e5e5e5;transition:all .15s; }
  .gc-nav-btn:hover { background:#f5f5f5; }
  .gc-head-cell { text-align:center;font-size:.75rem;font-weight:500;color:#737373;padding:.5rem 0;width:14.285%; }
  .gc-row { display:table-row;height:2.5rem; }
  .gc-cell { display:table-cell;position:relative;text-align:center;vertical-align:middle;padding:0; }
  .gc-cell-mid::before,.gc-cell-start::before,.gc-cell-end::before { content:'';position:absolute;top:50%;height:2.2rem;transform:translateY(-50%);background:#111;z-index:0;pointer-events:none; }
  .gc-cell-mid::before { left:0;right:0; }
  .gc-cell-start::before { left:0;right:0;clip-path:polygon(.8rem 0%,100% 0%,100% 100%,0% 100%); }
  .gc-cell-end::before { left:0;right:0;clip-path:polygon(0% 0%,100% 0%,calc(100% - .8rem) 100%,0% 100%); }
  .gc-day { position:relative;z-index:1;width:2.2rem;height:2.2rem;display:inline-flex;align-items:center;justify-content:center;font-size:.875rem;transition:all .15s;color:#111;background:transparent; }
  .gc-day-sel { background:#111;color:#fff;font-weight:600;border-radius:50%; }
  .gc-day-mid { background:transparent;color:#fff;border-radius:0; }
  .gc-day-today:not(.gc-day-sel):not(.gc-day-mid) { background:#f5f5f5;font-weight:600;border-radius:50%; }
  .gc-day:hover:not(:disabled):not(.gc-day-sel) { background:#f5f5f5;border-radius:50%; }
  .gc-day:disabled { opacity:.3;cursor:not-allowed; }
`

const toISO = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

const formatDates = (ci: string, co: string) => {
  if (!ci && !co) return 'Add dates'
  if (ci && !co) return 'Select checkout'
  const fmt = (s: string) => parseISO(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(ci)} – ${fmt(co)}`
}

function GuestyCalendar({ selected, onSelect, numberOfMonths = 2 }: {
  selected?: { from?: Date; to?: Date }
  onSelect: (r?: { from?: Date; to?: Date }) => void
  numberOfMonths?: number
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const minMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today])
  const [currentMonth, setCurrentMonth] = useState(
    selected?.from ? new Date(selected.from.getFullYear(), selected.from.getMonth(), 1) : minMonth
  )

  const sameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()

  const getMonthData = (date: Date) => {
    const year = date.getFullYear(), month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weeks: (Date | null)[][] = []
    let week: (Date | null)[] = Array(firstDay.getDay()).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(new Date(year, month, d))
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week) }
    return { weeks, month, year }
  }

  const handleClick = (day: Date) => {
    if (day < today) return
    if (!selected?.from || selected.to) { onSelect({ from: day, to: undefined }); return }
    if (day < selected.from) { onSelect({ from: day, to: selected.from }); return }
    if (sameDay(day, selected.from)) { onSelect({ from: day, to: undefined }); return }
    onSelect({ from: selected.from, to: day })
  }

  const isPrevDisabled = currentMonth.getFullYear() === minMonth.getFullYear() && currentMonth.getMonth() === minMonth.getMonth()
  const months = Array.from({ length: numberOfMonths }, (_, i) =>
    getMonthData(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1))
  )

  return (
    <>
      <style>{guestyCalendarStyles}</style>
      <div className="gc">
        <div className="gc-months">
          {months.map((md, mi) => (
            <div key={mi} className="gc-month">
              <div className="gc-caption">
                <div className="gc-caption-label">
                  {new Date(md.year, md.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                {mi === months.length - 1 && (
                  <div className="gc-nav">
                    <button className="gc-nav-btn" onClick={() => !isPrevDisabled && setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} disabled={isPrevDisabled}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="gc-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <table style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead><tr>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <th key={d} className="gc-head-cell">{d}</th>)}</tr></thead>
                <tbody>
                  {md.weeks.map((week, wi) => (
                    <tr key={wi} className="gc-row">
                      {week.map((day, di) => {
                        if (!day) return <td key={di} className="gc-cell" />
                        const disabled = day.getMonth() !== md.month || day < today
                        const isStart = selected?.from && sameDay(day, selected.from)
                        const isEnd = selected?.to && sameDay(day, selected.to)
                        const isMid = selected?.from && selected?.to && day > selected.from && day < selected.to
                        const isToday = sameDay(day, today)
                        let cellCls = 'gc-cell'
                        if (isMid) cellCls += ' gc-cell-mid'
                        if (isStart) cellCls += ' gc-cell-start'
                        if (isEnd) cellCls += ' gc-cell-end'
                        let dayCls = 'gc-day'
                        if (isStart || isEnd) dayCls += ' gc-day-sel'
                        if (isMid) dayCls += ' gc-day-mid'
                        if (isToday && !isStart) dayCls += ' gc-day-today'
                        return (
                          <td key={di} className={cellCls}>
                            <button className={dayCls} disabled={disabled} onClick={() => !disabled && handleClick(day)}>
                              {day.getDate()}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export type SearchBarProps = {
  itemsCount: number
  sortBy: string
  setSortBy: (v: string) => void
  checkIn: string
  setCheckIn: (v: string) => void
  checkOut: string
  setCheckOut: (v: string) => void
  bedrooms: string[]
  setBedrooms: (v: string[]) => void
  bathrooms: string[]
  setBathrooms: (v: string[]) => void
  minPrice: string
  setMinPrice: (v: string) => void
  maxPrice: string
  setMaxPrice: (v: string) => void
  guests: number
  setGuests: (v: number) => void
  onApplyFilters: () => void
  onClearAllFilters: () => void
}

const deriveCount = (arr: string[]) => {
  if (!arr.length) return 0
  if (arr.includes('12+')) return 12
  return parseInt(arr[0]) || 0
}

export function SearchBar({
  itemsCount, sortBy, setSortBy,
  checkIn, setCheckIn, checkOut, setCheckOut,
  bedrooms, setBedrooms, bathrooms, setBathrooms,
  minPrice, setMinPrice, maxPrice, setMaxPrice,
  guests, setGuests, onApplyFilters, onClearAllFilters,
}: SearchBarProps) {
  const [showDate, setShowDate] = useState(false)
  const [showGuests, setShowGuests] = useState(false)
  const [showBeds, setShowBeds] = useState(false)
  const [showBaths, setShowBaths] = useState(false)
  const [showPrice, setShowPrice] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)

  const dateRef = useRef<HTMLDivElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)
  const bedRef = useRef<HTMLDivElement>(null)
  const bathRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)

  const closeAll = () => { setShowDate(false); setShowGuests(false); setShowBeds(false); setShowBaths(false); setShowPrice(false) }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const refs = [dateRef, guestRef, bedRef, bathRef, priceRef]
      if (refs.every(r => !r.current?.contains(e.target as Node))) closeAll()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleRangeSelect = (r?: { from?: Date; to?: Date }) => {
    if (!r) { setCheckIn(''); setCheckOut(''); return }
    if (r.from) setCheckIn(toISO(r.from))
    if (r.to) setCheckOut(toISO(r.to))
    else setCheckOut('')
  }

  const applyAndClose = (closeFn: () => void) => { closeFn(); onApplyFilters() }

  const datesLabel = formatDates(checkIn, checkOut)
  const guestsLabel = guests > 0 ? `${guests} Guests` : 'Guests'
  const bedsLabel = deriveCount(bedrooms) > 0 ? `${deriveCount(bedrooms)} Bedrooms` : 'Bedrooms'
  const bathsLabel = deriveCount(bathrooms) > 0 ? `${deriveCount(bathrooms)} Bathrooms` : 'Bathrooms'
  const priceLabel = !minPrice && !maxPrice ? 'Price'
    : minPrice && !maxPrice ? `$${Number(minPrice).toLocaleString()}+`
      : !minPrice && maxPrice ? `Up to $${Number(maxPrice).toLocaleString()}`
        : `$${Number(minPrice).toLocaleString()} – $${Number(maxPrice).toLocaleString()}`

  const hasFilters = !!(checkIn || checkOut || guests > 0 || bedrooms.length || bathrooms.length || minPrice || maxPrice || sortBy !== 'rank')

  const filterBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-sm transition-colors whitespace-nowrap
        ${active ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {label}
    </button>
  )

  const Dropdown = ({ refEl, align = 'left', children }: { refEl: React.RefObject<HTMLDivElement | null>; align?: 'left' | 'right'; children: React.ReactNode }) => (
    <div ref={refEl} className={`absolute top-full mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
      {children}
    </div>
  )

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block sticky top-16 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-6 h-[60px] flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 text-sm whitespace-nowrap flex-shrink-0">
            <span className="font-semibold text-foreground">{itemsCount} Villas · St. Barts</span>
            <span className="text-muted-foreground">•</span>

            <div className="relative" ref={dateRef}>
              {filterBtn(datesLabel, !!(checkIn || checkOut), () => { closeAll(); setShowDate(v => !v) })}
              {showDate && (
                <Dropdown refEl={dateRef}>
                  <div className="p-4">
                    <GuestyCalendar
                      selected={{ from: checkIn ? parseISO(checkIn) : undefined, to: checkOut ? parseISO(checkOut) : undefined }}
                      onSelect={handleRangeSelect}
                      numberOfMonths={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2 px-4 pb-4 border-t border-border pt-3">
                    {(checkIn || checkOut) && <button onClick={() => handleRangeSelect(undefined)} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>}
                    <button onClick={() => applyAndClose(() => setShowDate(false))} className="px-4 py-2 text-sm bg-foreground text-background rounded-lg font-medium">Apply Dates</button>
                  </div>
                </Dropdown>
              )}
            </div>

            <span className="text-muted-foreground">•</span>

            <div className="relative" ref={guestRef}>
              {filterBtn(guestsLabel, guests > 0, () => { closeAll(); setShowGuests(v => !v) })}
              {showGuests && (
                <Dropdown refEl={guestRef}>
                  <div className="p-5" style={{ width: 200 }}>
                    <p className="text-sm font-medium mb-4 text-center">Guests</p>
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => setGuests(Math.max(0, guests - 1))} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted" disabled={guests <= 0}>–</button>
                      <span className="w-10 text-center text-lg font-semibold">{guests || 0}</span>
                      <button onClick={() => setGuests(guests + 1)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">+</button>
                    </div>
                    <div className="flex justify-end mt-4 pt-3 border-t border-border">
                      <button onClick={() => applyAndClose(() => setShowGuests(false))} className="px-4 py-2 text-sm bg-foreground text-background rounded-lg font-medium">Apply</button>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>

            <span className="text-muted-foreground">•</span>

            <div className="relative" ref={bedRef}>
              {filterBtn(bedsLabel, bedrooms.length > 0, () => { closeAll(); setShowBeds(v => !v) })}
              {showBeds && (
                <Dropdown refEl={bedRef} align="right">
                  <div className="p-5" style={{ width: 200 }}>
                    <p className="text-sm font-medium mb-4 text-center">Bedrooms</p>
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => { const n = Math.max(0, deriveCount(bedrooms) - 1); setBedrooms(n === 0 ? [] : [String(n)]) }} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">–</button>
                      <span className="w-10 text-center text-lg font-semibold">{deriveCount(bedrooms) || 'Any'}</span>
                      <button onClick={() => { const n = Math.min(13, deriveCount(bedrooms) + 1); setBedrooms(n >= 12 ? ['12+'] : [String(n)]) }} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">+</button>
                    </div>
                    <div className="flex justify-end mt-4 pt-3 border-t border-border">
                      <button onClick={() => applyAndClose(() => setShowBeds(false))} className="px-4 py-2 text-sm bg-foreground text-background rounded-lg font-medium">Apply</button>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>

            <span className="text-muted-foreground">•</span>

            <div className="relative" ref={bathRef}>
              {filterBtn(bathsLabel, bathrooms.length > 0, () => { closeAll(); setShowBaths(v => !v) })}
              {showBaths && (
                <Dropdown refEl={bathRef} align="right">
                  <div className="p-5" style={{ width: 200 }}>
                    <p className="text-sm font-medium mb-4 text-center">Bathrooms</p>
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => { const n = Math.max(0, deriveCount(bathrooms) - 1); setBathrooms(n === 0 ? [] : [String(n)]) }} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">–</button>
                      <span className="w-10 text-center text-lg font-semibold">{deriveCount(bathrooms) || 'Any'}</span>
                      <button onClick={() => { const n = Math.min(13, deriveCount(bathrooms) + 1); setBathrooms(n >= 12 ? ['12+'] : [String(n)]) }} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg hover:bg-muted">+</button>
                    </div>
                    <div className="flex justify-end mt-4 pt-3 border-t border-border">
                      <button onClick={() => applyAndClose(() => setShowBaths(false))} className="px-4 py-2 text-sm bg-foreground text-background rounded-lg font-medium">Apply</button>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>

            <span className="text-muted-foreground">•</span>

            <div className="relative" ref={priceRef}>
              {filterBtn(priceLabel, !!(minPrice || maxPrice), () => { closeAll(); setShowPrice(v => !v) })}
              {showPrice && (
                <Dropdown refEl={priceRef} align="right">
                  <div className="p-5 w-72">
                    <p className="text-sm font-medium mb-4">Price per night</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                        <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="$0" min="0" step="100"
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                        <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" min="0" step="100"
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-border">
                      <button onClick={() => { setMinPrice(''); setMaxPrice('') }} className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted">Clear</button>
                      <button onClick={() => applyAndClose(() => setShowPrice(false))} className="px-4 py-2 text-sm bg-foreground text-background rounded-lg font-medium">Apply</button>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>

            {hasFilters && (
              <>
                <span className="text-muted-foreground">•</span>
                <button onClick={onClearAllFilters} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <X size={13} /> Clear all
                </button>
              </>
            )}
          </div>

          <select value={sortBy} onChange={e => { setSortBy(e.target.value); onApplyFilters() }}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none">
            <option value="rank">Top Ranked</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
            <option value="bedrooms">Most Bedrooms</option>
          </select>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden sticky top-16 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold">{itemsCount} Villas</span>
        <button onClick={() => setShowMobile(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted">
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">!</span>}
        </button>
      </div>

      {/* MOBILE MODAL */}
      {showMobile && (
        <div className="fixed inset-0 z-[200] bg-background overflow-y-auto md:hidden">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={() => setShowMobile(false)} className="p-2 hover:bg-muted rounded-full"><X size={20} /></button>
          </div>
          <div className="p-4 space-y-6 pb-24">
            <div>
              <label className="block text-sm font-medium mb-2">Sort by</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none">
                <option value="rank">Top Ranked</option>
                <option value="price_low">Price: Low → High</option>
                <option value="price_high">Price: High → Low</option>
                <option value="bedrooms">Most Bedrooms</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dates</label>
              <div className="space-y-2">
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none" />
                <input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Guests</label>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <span className="text-sm">Number of guests</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(Math.max(0, guests - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center" disabled={guests <= 0}>–</button>
                  <span className="w-8 text-center font-medium">{guests}</span>
                  <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">+</button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Min. bedrooms</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => { const n = Math.max(0, deriveCount(bedrooms) - 1); setBedrooms(n === 0 ? [] : [String(n)]) }} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">–</button>
                  <span className="w-8 text-center font-semibold">{deriveCount(bedrooms) || 'Any'}</span>
                  <button onClick={() => { const n = Math.min(13, deriveCount(bedrooms) + 1); setBedrooms(n >= 12 ? ['12+'] : [String(n)]) }} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">+</button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bathrooms</label>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <span className="text-sm text-muted-foreground">Min. bathrooms</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => { const n = Math.max(0, deriveCount(bathrooms) - 1); setBathrooms(n === 0 ? [] : [String(n)]) }} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">–</button>
                  <span className="w-8 text-center font-semibold">{deriveCount(bathrooms) || 'Any'}</span>
                  <button onClick={() => { const n = Math.min(13, deriveCount(bathrooms) + 1); setBathrooms(n >= 12 ? ['12+'] : [String(n)]) }} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">+</button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price / night</label>
              <div className="space-y-2">
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ($)" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none" />
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ($)" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-3">
            {hasFilters && <button onClick={() => { onClearAllFilters(); setShowMobile(false) }} className="flex-1 py-3 text-sm border border-border rounded-lg font-medium hover:bg-muted">Clear All</button>}
            <button onClick={() => { onApplyFilters(); setShowMobile(false) }} className="flex-1 py-3 text-sm bg-foreground text-background rounded-lg font-medium">Show Villas</button>
          </div>
        </div>
      )}
    </>
  )
}