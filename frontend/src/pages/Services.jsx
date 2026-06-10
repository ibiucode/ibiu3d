import { Link } from 'react-router-dom'

export default function Services() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl font-black text-white mb-6">服務項目</h1>
      <p className="text-zinc-400 mb-8">請選擇您想了解的列印技術</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/services/fdm" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors">
          ⚙️ FDM 熔融堆積列印
        </Link>
        <Link to="/services/sla" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors">
          ✨ SLA 光固化列印
        </Link>
      </div>
    </div>
  )
}
