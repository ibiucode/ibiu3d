import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { usePublicContent } from '../hooks/usePublicContent'
import { useAnalytics } from '../hooks/useAnalytics'

// API 失敗或無資料時的 fallback（沿用原本內容）
const FALLBACK_FAQS = [
  { question: '如何提交列印需求？', answer: '您可以透過詢價表單填寫需求，包含列印技術偏好、材料、尺寸及用途說明。提交後我們會在 24 小時內回覆報價。' },
  { question: 'FDM 和 SLA 有什麼差別，應該選哪個？', answer: 'FDM 適合大尺寸、功能性零件，成本較低；SLA 適合需要高精度表面的展示品或精密零件，但尺寸較小。不確定的話在詢價表單說明用途，我們會幫您推薦。' },
  { question: '可以提供哪些檔案格式？', answer: '建議提供 STL、OBJ 或 3MF 格式。如果您只有參考圖片或草圖，我們也提供建模服務。' },
  { question: '交件時間大約多久？', answer: '一般案件約 3–7 個工作天。加急服務另議，請在詢價時說明需求日期。' },
  { question: '最小訂單量是多少？', answer: '我們接受單件訂單，沒有最低數量限制。批量訂單可另行洽談優惠。' },
  { question: '後處理服務包含哪些？', answer: '包含打磨、噴漆、上色、組裝等。詳細後處理需求請在詢價時一併說明。' },
  { question: '如何付款？', answer: '接受銀行轉帳及各大行動支付。訂單確認後先付 50% 訂金，完工交付後付尾款。' },
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-zinc-900/50 transition-colors">
        <span className="text-white font-medium pr-4">{question}</span>
        <span className="text-orange-400 text-xl flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const { trackPageView } = useAnalytics()
  const { content: faqs, loading } = usePublicContent(api.getPublicFaqs, FALLBACK_FAQS)

  useEffect(() => { trackPageView('/faq') }, [trackPageView])

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">常見問題</h1>
        <p className="text-zinc-400 text-lg">找不到您的問題？歡迎直接聯絡我們</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">載入中…</div>
      ) : (
        <div className="flex flex-col gap-3 mb-12">
          {faqs.map((faq, i) => <FAQItem key={faq.id ?? i} question={faq.question} answer={faq.answer} />)}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">還有其他問題？</h2>
        <p className="text-zinc-400 text-sm mb-5">歡迎直接與我們聯絡，我們很樂意為您解答</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="px-6 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium rounded-lg transition-colors text-sm">聯絡我們</Link>
          <Link to="/quote" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm">立即詢價</Link>
        </div>
      </div>
    </div>
  )
}
