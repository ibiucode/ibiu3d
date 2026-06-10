import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAnalytics } from '../hooks/useAnalytics'
import Badge from '../components/ui/Badge'

const GALLERY_ITEMS = [
  { id: 1, title: '機械手臂原型', type: 'FDM', material: 'PETG', color: 'bg-zinc-800' },
  { id: 2, title: '精密齒輪組', type: 'SLA', material: '工程樹脂', color: 'bg-zinc-800' },
  { id: 3, title: '建築縮小模型', type: 'SLA', material: '標準樹脂', color: 'bg-zinc-800' },
  { id: 4, title: '客製化手機殼', type: 'FDM', material: 'TPU', color: 'bg-zinc-800' },
  { id: 5, title: '工業零件替代品', type: 'FDM', material: 'ABS', color: 'bg-zinc-800' },
  { id: 6, title: '藝術雕像', type: 'SLA', material: '標準樹脂', color: 'bg-zinc-800' },
]

export default function Gallery() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/gallery')
  }, [trackPageView])

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">作品展示</h1>
        <p className="text-zinc-400 text-lg">我們完成的部分案例，每一件都是客戶需求與工藝的結合</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {GALLERY_ITEMS.map(item => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-colors group">
            <div className="h-48 bg-zinc-800 flex items-center justify-center text-zinc-600 text-sm group-hover:bg-zinc-750 transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-2">🖨️</div>
                <div>作品圖片</div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={item.type === 'FDM' ? 'blue' : 'orange'}>{item.type}</Badge>
                <Badge variant="default">{item.material}</Badge>
              </div>
              <h3 className="text-white font-semibold">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>

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
