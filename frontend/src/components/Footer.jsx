import { Link, useLocation } from 'react-router-dom'
import { BRAND, NAV_LINKS } from '../constants/brand'

export default function Footer() {
  const location = useLocation()
  if (location.pathname?.startsWith('/admin')) return null

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-500 text-lg font-black">▲</span>
              <span className="text-white font-bold">{BRAND.name}</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">{BRAND.description}</p>
          </div>

          <div>
            <h4 className="text-zinc-300 text-sm font-semibold mb-3">頁面導覽</h4>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-300 text-sm font-semibold mb-3">聯絡方式</h4>
            <ul className="flex flex-col gap-2 text-sm text-zinc-500">
              <li><a href={`mailto:${BRAND.email}`} className="hover:text-zinc-300 transition-colors">{BRAND.email}</a></li>
              <li><a href={`tel:${BRAND.phone}`} className="hover:text-zinc-300 transition-colors">{BRAND.phone}</a></li>
              <li><a href={BRAND.ig} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Instagram</a></li>
              <li><a href={BRAND.line} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">LINE 官方帳號</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <Link to="/privacy" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">隱私政策</Link>
        </div>
      </div>
    </footer>
  )
}
