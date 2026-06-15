import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAnalytics } from '../hooks/useAnalytics'
import ModelUploadTool from '../components/ModelUploadTool'

export default function Quote() {
  const { trackPageView } = useAnalytics()

  useEffect(() => { trackPageView('/quote') }, [trackPageView])

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">模型上傳預覽</h1>
        <p className="text-zinc-400 text-lg">上傳你的 3D 模型，在瀏覽器即時檢視外觀與尺寸（檔案不會上傳到伺服器）。</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <ModelUploadTool />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">需要報價或進一步討論？</h2>
        <p className="text-zinc-400 text-sm mb-5">看完模型後，歡迎透過聯絡方式告訴我們你的需求，我們會儘快回覆。</p>
        <Link to="/contact" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors">
          前往聯絡我們
        </Link>
      </div>
    </div>
  )
}
