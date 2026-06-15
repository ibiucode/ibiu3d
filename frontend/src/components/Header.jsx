import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BRAND, NAV_LINKS } from '../constants/brand'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  if (location.pathname?.startsWith('/admin')) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <span className="text-orange-500 text-xl font-black">▲</span>
          <span className="text-white font-bold text-lg tracking-wide">{BRAND.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm transition-colors ${
                location.pathname === link.path
                  ? 'text-orange-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/quote"
            className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded transition-colors"
          >
            模型預覽
          </Link>
        </div>

        <button
          className="md:hidden text-zinc-300 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="開啟選單"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="text-zinc-300 hover:text-white text-sm py-1"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/quote"
            className="mt-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded text-center"
            onClick={() => setMenuOpen(false)}
          >
            模型預覽
          </Link>
        </div>
      )}
    </header>
  )
}
