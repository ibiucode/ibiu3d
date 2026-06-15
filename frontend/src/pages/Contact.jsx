import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../constants/brand'
import { api } from '../services/api'
import { usePublicContent } from '../hooks/usePublicContent'
import { useAnalytics } from '../hooks/useAnalytics'
import Card from '../components/ui/Card'

export default function Contact() {
  const { trackPageView } = useAnalytics()
  const { content: s } = usePublicContent(api.getPublicSiteSettings, null)

  useEffect(() => { trackPageView('/contact') }, [trackPageView])

  const email = s?.contact_email || BRAND.email
  const phone = s?.contact_phone || BRAND.phone
  const line = s?.contact_line || BRAND.line
  const ig = s?.contact_instagram || BRAND.ig

  const contacts = [
    email && { icon: '✉️', label: 'Email', value: email, href: `mailto:${email}` },
    phone && { icon: '📱', label: '電話', value: phone, href: `tel:${phone}` },
    ig && { icon: '📸', label: 'Instagram', value: ig.replace(/^https?:\/\//, ''), href: ig },
    line && { icon: '💬', label: 'LINE', value: '官方帳號聯絡', href: line },
  ].filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">聯絡我們</h1>
        <p className="text-zinc-400 text-lg">有任何問題或合作需求，歡迎透過以下方式聯絡</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {contacts.map(c => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
            <Card hover className="flex items-center gap-4 cursor-pointer">
              <div className="text-3xl">{c.icon}</div>
              <div>
                <div className="text-zinc-400 text-xs mb-1">{c.label}</div>
                <div className="text-white font-medium break-all">{c.value}</div>
              </div>
            </Card>
          </a>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-3">想先看看模型？</h2>
        <p className="text-zinc-400 text-sm mb-5">上傳 STL／OBJ，在瀏覽器即時預覽外觀與尺寸</p>
        <Link to="/quote" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors">
          上傳模型預覽
        </Link>
      </div>
    </div>
  )
}
