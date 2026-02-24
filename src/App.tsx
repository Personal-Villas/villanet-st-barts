import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'
import { NavBar } from './components/NavBar'
import { Home } from './pages/Home'
import { Catalog } from './pages/Catalog'
import { Detail } from './pages/Detail'
import { Favorites } from './pages/Favorites'

export default function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/catalog"   element={<Catalog />} />
          <Route path="/villa/:id" element={<Detail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  )
}