import { useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { BRAND } from '../constants/brand'

export default function Privacy() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/privacy')
  }, [trackPageView])

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-white mb-4">隱私政策</h1>
      <p className="text-zinc-500 text-sm mb-10">最後更新：2025 年</p>

      <div className="prose prose-zinc max-w-none text-zinc-400 leading-relaxed space-y-8">
        <section>
          <h2 className="text-white text-xl font-bold mb-3">1. 資料收集</h2>
          <p>本網站僅在您主動填寫詢價表單時收集您提供的個人資料（姓名、Email、電話）。網站行為分析僅收集匿名的使用行為數據，不與個人資料連結。</p>
        </section>

        <section>
          <h2 className="text-white text-xl font-bold mb-3">2. 資料用途</h2>
          <p>收集的個人資料僅用於：</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>回覆您的詢價需求</li>
            <li>後續訂單溝通</li>
          </ul>
          <p className="mt-3">不會將您的個人資料出售或提供給第三方。</p>
        </section>

        <section>
          <h2 className="text-white text-xl font-bold mb-3">3. Cookie 使用</h2>
          <p>本網站使用功能性 Cookie 維持您的使用偏好，及匿名分析 Cookie 了解網站使用狀況。您可以透過瀏覽器設定拒絕 Cookie，但可能影響部分功能。</p>
        </section>

        <section>
          <h2 className="text-white text-xl font-bold mb-3">4. 資料保存</h2>
          <p>詢價相關資料將保存至訂單完成後 2 年，之後予以刪除。</p>
        </section>

        <section>
          <h2 className="text-white text-xl font-bold mb-3">5. 您的權利</h2>
          <p>您有權要求查詢、更正或刪除您的個人資料。請透過 <a href={`mailto:${BRAND.email}`} className="text-orange-400 hover:underline">{BRAND.email}</a> 聯絡我們。</p>
        </section>
      </div>
    </div>
  )
}
