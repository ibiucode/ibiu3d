import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { api } from '../../services/api'
import Badge from '../../components/ui/Badge'

const ROLE_LABEL = { admin: '管理員', staff: '員工', viewer: '檢視者' }
const ROLE_VARIANT = { admin: 'orange', staff: 'blue', viewer: 'default' }

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: summary, execute: fetchSummary } = useApi(api.getAnalyticsSummary)

  useEffect(() => {
    fetchSummary(30).catch(() => {})
  }, [fetchSummary])

  const stats = [
    { label: '30 天瀏覽數', value: summary?.total_pageviews ?? '—', color: 'text-blue-400' },
    { label: '不重複訪客', value: summary?.unique_sessions ?? '—', color: 'text-purple-400' },
    { label: '詢價轉換', value: summary?.total_inquiries ?? '—', color: 'text-orange-400' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">總覽</h1>
          <p className="text-zinc-500 text-sm mt-1">最近 30 天數據</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm hidden sm:block">{user?.name || user?.email}</span>
          <Badge variant={ROLE_VARIANT[user?.role] || 'default'}>
            {ROLE_LABEL[user?.role] || user?.role}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link to="/admin/inquiries" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-colors group">
          <div className="text-2xl mb-3">📋</div>
          <h3 className="text-white font-semibold mb-1">詢價管理</h3>
          <p className="text-zinc-500 text-sm">查看所有詢價單、更新狀態、新增備註</p>
          <span className="text-orange-400 text-sm mt-3 block group-hover:underline">前往 →</span>
        </Link>

        <Link to="/admin/analytics" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-colors group">
          <div className="text-2xl mb-3">📊</div>
          <h3 className="text-white font-semibold mb-1">分析報表</h3>
          <p className="text-zinc-500 text-sm">熱門頁面、訪客趨勢、詢價來源分析</p>
          <span className="text-orange-400 text-sm mt-3 block group-hover:underline">前往 →</span>
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin/users" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-colors group">
            <div className="text-2xl mb-3">👤</div>
            <h3 className="text-white font-semibold mb-1">帳號管理</h3>
            <p className="text-zinc-500 text-sm">新增/停用帳號、設定角色權限</p>
            <span className="text-orange-400 text-sm mt-3 block group-hover:underline">前往 →</span>
          </Link>
        )}

        <Link to="/admin/modules" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-6 transition-colors group">
          <div className="text-2xl mb-3">🚀</div>
          <h3 className="text-white font-semibold mb-1">未來模組</h3>
          <p className="text-zinc-500 text-sm">Phase 2 功能規劃：自動估價、模型預覽、檔案檢查</p>
          <span className="text-orange-400 text-sm mt-3 block group-hover:underline">查看路線圖 →</span>
        </Link>
      </div>
    </div>
  )
}
