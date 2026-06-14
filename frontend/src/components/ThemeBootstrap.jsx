import { useEffect } from 'react'
import { api } from '@/services/api'
import { applyTheme } from '@/lib/theme'

// 啟動時讀取公開 site_settings 並套用主題色；失敗則靜默沿用 fallback。
export default function ThemeBootstrap() {
  useEffect(() => {
    let active = true
    api.getPublicSiteSettings()
      .then(s => { if (active) applyTheme(s) })
      .catch(() => {})
    return () => { active = false }
  }, [])
  return null
}
