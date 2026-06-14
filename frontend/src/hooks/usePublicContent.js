import { useEffect, useState } from 'react'

// 前台共用：嘗試讀 CMS API；失敗或資料為空時回傳 fallback，永不白屏。
// fetcher 只在掛載時執行一次。
export function usePublicContent(fetcher, fallback) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetcher()
      .then(res => { if (active) { setData(res); setFailed(false) } })
      .catch(() => { if (active) setFailed(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isEmpty = data == null || (Array.isArray(data) && data.length === 0)
  const usingFallback = failed || isEmpty
  const content = usingFallback ? fallback : data
  return { content, loading, usingFallback, raw: data }
}
