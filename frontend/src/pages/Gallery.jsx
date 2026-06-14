import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { usePublicContent } from '../hooks/usePublicContent'
import { useAnalytics } from '../hooks/useAnalytics'
import Badge from '../components/ui/Badge'

// API 失敗或無資料時的 fallback placeholder（沿用原本展示內容）
const FALLBACK_ITEMS = [
  { id: 1, title: '機械手臂原型', process_type: 'FDM', material: 'PETG' },
  { id: 2, title: '精密齒輪組', process_type: 'SLA', material: '工程樹脂' },
  { id: 3, title: '建築縮小模型', process_type: 'SLA', material: '標準樹脂' },
  { id: 4, title: '客製化手機殼', process_type: 'FDM', material: 'TPU' },
  { id: 5, title: '工業零件替代品', process_type: 'FDM', material: 'ABS' },
  { id: 6, title: '藝術雕像', process_type: 'SLA', material: '標準樹脂' },
]

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'FDM', label: 'FDM' },
  { value: 'SLA', label: 'SLA' },
  { value: 'Other', label: 'Other' },
]

function GalleryCard({ item }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-colors group">
      <div className="h-48 bg-zinc-800 flex items-center justify-center overflow-hidden">
        {item.image_url || item.thumbnail_url ? (
          <img src={item.thumbnail_url || item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div className="text-center text-zinc-600 text-sm">
            <div className="text-4xl mb-2">🖨️</div>
            <div>作品圖片</div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={item.process_type === 'FDM' ? 'blue' : item.process_type === 'SLA' ? 'orange' : 'default'}>{item.process_type}</Badge>
          {item.material && <Badge variant="default">{item.material}</Badge>}
        </div>
        <h3 className="text-white font-semibold">{item.title}</h3>
        {item.summary && <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{item.summary}</p>}
      </div>
    </div>
  )
}

export default function Gallery() {
  const { trackPageView } = useAnalytics()
  const { content: items, loading } = usePublicContent(api.getPublicGallery, FALLBACK_ITEMS)
  const [filter, setFilter] = useState('all')

  useEffect(() => { trackPageView('/gallery') }, [trackPageView])

  const shown = filter === 'all' ? items : items.filter(i => i.process_type === filter)

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">作品展示</h1>
        <p className="text-zinc-400 text-lg">我們完成的部分案例，每一件都是客戶需求與工藝的結合</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filter === f.value ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">載入中…</div>
      ) : shown.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900 border border-zinc-800 rounded-xl mb-16">
          <div className="text-4xl mb-3">🖨️</div>
          <p className="text-zinc-400">此分類目前尚無作品。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {shown.map(item => <GalleryCard key={item.id ?? item.slug} item={item} />)}
        </div>
      )}

      <div className="text-center bg-zinc-900 border border-zinc-800 rounded-xl p-10">
        <h2 className="text-2xl font-bold text-white mb-3">想要類似的作品？</h2>
        <p className="text-zinc-400 mb-6">告訴我們你的設計需求，我們幫你實現</p>
        <Link to="/quote" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors">
          立即詢價
        </Link>
      </div>
    </div>
  )
}
