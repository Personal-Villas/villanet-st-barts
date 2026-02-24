import { Link, useLocation } from 'react-router-dom'
import { Home, Grid, Heart } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'

const tabs = [
  { path: '/',          label: 'Home',  icon: Home },
  { path: '/catalog',   label: 'Villas', icon: Grid },
  { path: '/favorites', label: 'Saved',  icon: Heart },
]

export function NavBar() {
  const location = useLocation()
  const { count } = useFavorites()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-lg text-neutral-900 tracking-tight leading-none whitespace-nowrap">
            St. Barts <span className="italic font-light">Villas</span>
          </span>
          <span className="hidden sm:inline text-xs text-neutral-300 border-l border-neutral-200 pl-2 ml-1 whitespace-nowrap">
            by VillaNet
          </span>
        </Link>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>

                {path === '/favorites' && count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

      </div>
    </header>
  )
}