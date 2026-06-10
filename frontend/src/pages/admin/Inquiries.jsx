import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import Badge from '../../components/ui/Badge'

const STATUSES = ['全部', '新詢價', '已查看', '待切片', '已切片', '已報價', '等待客戶回覆', '製作中', '已完成', '已取消']

const STATUS_VARIANT = {
  '新詢價': 'orange', '已查看': 'blue', '待切片': 'yellow', '已切片': 'yellow',
  '已報價': 'blue', '等待客戶回覆': 'yellow', '製作中': 'blue',
  '已完成': 'green', '已取消': 'default',
}

const SERVICE_LABEL = { fdm: 'FDM', sla: 'SLA', unsure: '待確認' }
const BUDGET_LABEL = {
  'under500': '<500', '500-2000': '500–2K', '2000-5000': '2K–5K',
  'over5000': '>5K', 'unsure': '不確定',
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('全部')

  useEffect(() => {
    setLoading(true)
    api.getInquiries(activeStatus === '全部' ? null : activeStatus)
      .then(setInquiries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeStatus])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">詢價管理</h1>
        <p className="text-zinc-500 text-sm">共 {inquiries.length} 筆{activeStatus !== '全部' ? `（${activeStatus}）` : ''}</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeStatus === s
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-zinc-500 text-sm">載入中…</div>
        ) : inquiries.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">尚無詢價單</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">#</th>
                <th className="text-left px-5 py-3">客戶</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">技術</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">預算</th>
                <th className="text-left px-5 py-3">狀態</th>
                <th className="text-left px-5 py-3 hidden lg:table-cell">時間</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(i => (
                <tr key={i.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4 text-zinc-500 text-xs">{i.id}</td>
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{i.customer_name}</div>
                    <div className="text-zinc-500 text-xs">{i.email || i.phone || i.line_id || '—'}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-zinc-300 text-xs">{SERVICE_LABEL[i.service_type] || i.service_type || '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-zinc-400 text-xs">{BUDGET_LABEL[i.budget] || i.budget || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[i.status] || 'default'}>{i.status}</Badge>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-zinc-500 text-xs">{formatDate(i.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/inquiries/${i.id}`}
                      className="text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors"
                    >
                      查看 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
