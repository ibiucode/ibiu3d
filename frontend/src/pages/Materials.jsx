import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MATERIALS_FDM, MATERIALS_SLA } from '../constants/brand'
import { useAnalytics } from '../hooks/useAnalytics'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

export default function Materials() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/materials')
  }, [trackPageView])

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">材料介紹</h1>
        <p className="text-zinc-400 text-lg">根據用途選擇最適合的材料，讓成品品質最大化</p>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">FDM 材料</h2>
          <Badge variant="blue">熔融堆積</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MATERIALS_FDM.map(m => (
            <Card key={m.name} hover>
              <div className={`text-2xl font-black mb-2 ${m.color}`}>{m.name}</div>
              <p className="text-zinc-500 text-sm leading-relaxed">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">SLA 材料</h2>
          <Badge variant="orange">光固化</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {MATERIALS_SLA.map(m => (
            <Card key={m.name} hover>
              <div className={`text-2xl font-black mb-2 ${m.color}`}>{m.name}</div>
              <p className="text-zinc-500 text-sm leading-relaxed">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">不確定要選哪種材料？</h2>
        <p className="text-zinc-400 text-sm mb-5">填寫詢價表單，我們會根據你的需求建議最適合的材料</p>
        <Link to="/quote" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors">
          詢問材料建議
        </Link>
      </div>
    </div>
  )
}
