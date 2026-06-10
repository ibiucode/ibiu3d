import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MATERIALS_FDM } from '../../constants/brand'
import { useAnalytics } from '../../hooks/useAnalytics'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const SPECS = [
  { label: '最大列印尺寸', value: '300×300×300 mm' },
  { label: '層厚精度', value: '0.05 – 0.3 mm' },
  { label: '適用材質', value: 'PLA / PETG / ABS / TPU' },
  { label: '交期', value: '3–7 工作天' },
]

const USE_CASES = [
  '工業零件原型', '機構驗證模型', '客製化外殼', '日用品替換件',
  '教學模型', '大件藝術創作',
]

export default function FDM() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/services/fdm')
  }, [trackPageView])

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="blue">FDM</Badge>
        <span className="text-zinc-500 text-sm">熔融堆積成型</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4">FDM 3D 列印服務</h1>
      <p className="text-zinc-400 text-lg max-w-2xl mb-16 leading-relaxed">
        FDM（Fused Deposition Modeling）是最普及的 3D 列印技術。將塑膠絲材加熱融化後逐層堆積，
        適合製作功能性零件、結構原型及大件模型。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">可用材料</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MATERIALS_FDM.map(m => (
              <Card key={m.name} hover>
                <div className={`text-lg font-bold mb-1 ${m.color}`}>{m.name}</div>
                <p className="text-zinc-500 text-sm">{m.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6">規格參數</h2>
          <Card>
            <ul className="flex flex-col gap-4">
              {SPECS.map(s => (
                <li key={s.label} className="flex flex-col gap-1">
                  <span className="text-zinc-500 text-xs">{s.label}</span>
                  <span className="text-white text-sm font-medium">{s.value}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-white mb-6">適合應用場景</h2>
        <div className="flex flex-wrap gap-3">
          {USE_CASES.map(uc => (
            <span key={uc} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 text-sm">
              {uc}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/quote" className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-center">
          詢問 FDM 列印報價
        </Link>
        <Link to="/services/sla" className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold rounded-lg transition-colors text-center">
          了解 SLA 光固化列印 →
        </Link>
      </div>
    </div>
  )
}
