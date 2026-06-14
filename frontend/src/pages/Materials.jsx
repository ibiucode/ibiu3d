import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MATERIALS_FDM, MATERIALS_SLA } from '../constants/brand'
import { api } from '../services/api'
import { usePublicContent } from '../hooks/usePublicContent'
import { useAnalytics } from '../hooks/useAnalytics'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

// fallback：把原本常數轉成材料項目（含 process_type）
const FALLBACK_MATERIALS = [
  ...MATERIALS_FDM.map(m => ({ name: m.name, process_type: 'FDM', properties: m.desc, description: '' })),
  ...MATERIALS_SLA.map(m => ({ name: m.name, process_type: 'SLA', properties: m.desc, description: '' })),
]

const GROUPS = [
  { type: 'FDM', label: 'FDM 材料', badge: '熔融堆積', variant: 'blue' },
  { type: 'SLA', label: 'SLA 材料', badge: '光固化', variant: 'orange' },
  { type: 'Other', label: '其他材料', badge: '其他', variant: 'default' },
]

function MaterialCard({ m }) {
  return (
    <Card hover>
      {m.image_url && (
        <img src={m.image_url} alt={m.name} className="w-full h-32 object-cover rounded-lg mb-3" loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none' }} />
      )}
      <div className="text-2xl font-black text-white mb-2">{m.name}</div>
      {m.properties && <p className="text-zinc-400 text-sm leading-relaxed">{m.properties}</p>}
      {m.suitable_for && <p className="text-zinc-500 text-xs mt-2">適合：{m.suitable_for}</p>}
      {m.description && <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{m.description}</p>}
    </Card>
  )
}

export default function Materials() {
  const { trackPageView } = useAnalytics()
  const { content: materials, loading } = usePublicContent(api.getPublicMaterials, FALLBACK_MATERIALS)

  useEffect(() => { trackPageView('/materials') }, [trackPageView])

  const groups = GROUPS.map(g => ({ ...g, items: materials.filter(m => m.process_type === g.type) })).filter(g => g.items.length > 0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">材料介紹</h1>
        <p className="text-zinc-400 text-lg">根據用途選擇最適合的材料，讓成品品質最大化</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">載入中…</div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 rounded-xl mb-16">
          <p className="text-zinc-400">材料資料準備中，敬請期待。</p>
        </div>
      ) : (
        groups.map(g => (
          <section key={g.type} className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">{g.label}</h2>
              <Badge variant={g.variant}>{g.badge}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {g.items.map((m, i) => <MaterialCard key={m.id ?? i} m={m} />)}
            </div>
          </section>
        ))
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">不確定要選哪種材料？</h2>
        <p className="text-zinc-400 text-sm mb-5">填寫詢價表單，我們會根據你的需求建議最適合的材料</p>
        <Link to="/quote" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors">詢問材料建議</Link>
      </div>
    </div>
  )
}
