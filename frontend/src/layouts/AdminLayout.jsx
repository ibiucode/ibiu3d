import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { label: '總覽', path: '/admin/dashboard', icon: '◉' },
  { label: '詢價管理', path: '/admin/inquiries', icon: '📋' },
  { label: '分析報表', path: '/admin/analytics', icon: '📊' },
  { label: '未來模組', path: '/admin/modules', icon: '🚀' },
  { label: '帳號管理', path: '/admin/users', icon: '👤', adminOnly: true },
]

const ROLE_LABEL = { admin: '管理員', staff: '員工', viewer: '檢視者' }
const ROLE_COLOR = { admin: 'text-orange-400 bg-orange-500/10', staff: 'text-blue-400 bg-blue-500/10', viewer: 'text-zinc-400 bg-zinc-700' }

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  const visibleNav = NAV.filter(n => !n.adminOnly || user?.role === 'admin')

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col
        transition-transform duration-200
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-5 border-b border-zinc-800">
          <span className="text-orange-500 font-black">▲</span>
          <span className="text-white text-sm font-semibold">職人自造</span>
          <span className="text-zinc-600 text-xs ml-1">後台</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {visibleNav.map(n => (
            <Link
              key={n.path}
              to={n.path}
              onClick={() => setSideOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === n.path
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* User block */}
        <div className="p-4 border-t border-zinc-800">
          <div className="mb-3">
            <div className="text-white text-sm font-medium truncate">{user?.name || user?.email}</div>
            <div className="text-zinc-500 text-xs truncate">{user?.email}</div>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${ROLE_COLOR[user?.role] || ''}`}>
            {ROLE_LABEL[user?.role] || user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="w-full text-left text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
          >
            登出 →
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3 px-4 md:hidden">
          <button
            onClick={() => setSideOpen(true)}
            className="text-zinc-400 hover:text-white"
            aria-label="開啟側欄"
          >
            ☰
          </button>
          <span className="text-orange-500 font-black">▲</span>
          <span className="text-white text-sm font-semibold">職人自造後台</span>
        </div>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
