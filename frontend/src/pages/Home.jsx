import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { BRAND, STATS } from '../constants/brand'
import { useAnalytics } from '../hooks/useAnalytics'
import Card from '../components/ui/Card'

const FEATURES = [
  { icon: '⚙️', title: 'FDM 列印', desc: '多種材質選擇，適合功能性零件與大件模型', link: '/services/fdm' },
  { icon: '✨', title: 'SLA 光固化', desc: '超高精度表面，適合展示品與精密零件', link: '/services/sla' },
  { icon: '🔧', title: '建模修改', desc: '專業建模、修模、分件服務，支援各種格式', link: '/contact' },
  { icon: '🎨', title: '後處理加工', desc: '打磨、噴漆、組裝，交件完整成品', link: '/contact' },
]

export default function Home() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/')
  }, [trackPageView])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center bg-zinc-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            台灣本地 3D 列印工作坊
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            精準製造<br />
            <span className="text-orange-500">實現你的設計</span>
          </h1>

          <p className="text-zinc-300 text-base md:text-lg mb-4 max-w-2xl font-medium">
            FDM・SLA 3D 列印｜建模・修模・分件｜後處理加工
          </p>
          <p className="text-zinc-500 text-sm mb-10 max-w-xl leading-relaxed">
            {BRAND.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded transition-colors text-sm"
            >
              立即詢價 →
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded transition-colors text-sm"
            >
              查看作品
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
            {STATS.map(stat => (
              <div key={stat.label} className="border border-zinc-800 rounded-lg p-5 bg-zinc-900/50 hover:border-zinc-600 transition-colors">
                <div className="text-xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-zinc-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">我們提供的服務</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">從設計到成品，一站式 3D 列印解決方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(feat => (
              <Card key={feat.title} hover>
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-4">{feat.desc}</p>
                <Link to={feat.link} className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
                  了解更多 →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">準備好開始了嗎？</h2>
          <p className="text-zinc-400 mb-8">告訴我們你的需求，24 小時內回報報價</p>
          <Link
            to="/quote"
            className="inline-block px-10 py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg transition-colors text-base"
          >
            填寫詢價表單
          </Link>
        </div>
      </section>
    </div>
  )
}
