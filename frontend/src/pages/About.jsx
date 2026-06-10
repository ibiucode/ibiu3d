import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BRAND, STATS } from '../constants/brand'
import { useAnalytics } from '../hooks/useAnalytics'
import Card from '../components/ui/Card'

const EQUIPMENTS = [
  { name: 'Bambu Lab X1-Carbon', type: 'FDM', spec: '256×256×256mm，多色列印，0.05mm 精度' },
  { name: 'Creality K1 Max', type: 'FDM', spec: '300×300×300mm，大件列印，高速模式' },
  { name: 'Elegoo Saturn 4 Ultra', type: 'SLA', spec: '218×123×220mm，12K 超高解析度' },
]

export default function About() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/about')
  }, [trackPageView])

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">關於職人自造</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          我們是一個專注於 3D 列印製造的小型工作坊。熱愛製造業的我們，從 2021 年開始提供個人與小批量客製化列印服務，
          累積了超過 500 件的成功案例，服務範圍涵蓋原型開發、模型展示、功能性零件及藝術品製作。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {STATS.map(stat => (
          <Card key={stat.label} className="text-center">
            <div className="text-4xl font-black text-orange-500 mb-1">{stat.value}</div>
            <div className="text-zinc-400 text-sm">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-8">機台設備</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EQUIPMENTS.map(eq => (
            <Card key={eq.name} hover>
              <div className="text-xs font-semibold text-orange-400 mb-2 uppercase tracking-wider">{eq.type}</div>
              <h3 className="text-white font-semibold mb-2">{eq.name}</h3>
              <p className="text-zinc-500 text-sm">{eq.spec}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">有合作想法？</h2>
        <p className="text-zinc-400 mb-6">無論是小批量試產、客製化模型或商業合作，都歡迎與我們聯絡</p>
        <Link to="/contact" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors">
          聯絡我們
        </Link>
      </div>
    </div>
  )
}
