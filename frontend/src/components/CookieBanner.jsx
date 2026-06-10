import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setShow(true)
  }, [])

  if (location.pathname?.startsWith('/admin')) return null
  if (!show) return null

  function accept() {
    localStorage.setItem('cookie_consent', '1')
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
        <p className="text-zinc-400 text-sm flex-1">
          本網站使用匿名 Cookie 與行為分析，以改善您的使用體驗。不收集個人識別資料。
          <a href="#/privacy" className="text-orange-400 hover:underline ml-1">隱私政策</a>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            略過
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-400 text-white rounded-lg transition-colors font-medium"
          >
            接受
          </button>
        </div>
      </div>
    </div>
  )
}
