import { useEffect, useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../services/api'
import { isValidHex } from '../../../lib/theme'
import Button from '../../../components/ui/Button'
import FormInput from '../../../components/forms/FormInput'
import FormTextarea from '../../../components/forms/FormTextarea'

const COLOR_FIELDS = [
  { key: 'primary_color', label: '主色 Primary' },
  { key: 'secondary_color', label: '輔色 Secondary' },
  { key: 'background_color', label: '背景色 Background' },
  { key: 'surface_color', label: '卡片色 Surface' },
  { key: 'text_color', label: '文字色 Text' },
  { key: 'accent_color', label: '強調色 Accent' },
  { key: 'border_color', label: '邊框色 Border' },
]

const EMPTY = {
  site_name: '', tagline: '', logo_url: '',
  primary_color: '#f97316', secondary_color: '#3f3f46', background_color: '#09090b',
  surface_color: '#18181b', text_color: '#fafafa', accent_color: '#f97316', border_color: '#27272a',
  hero_title: '', hero_subtitle: '', hero_cta_text: '', hero_cta_link: '', hero_image_url: '',
  contact_email: '', contact_phone: '', contact_line: '', contact_instagram: '',
}

function ColorField({ label, value, onChange }) {
  const valid = isValidHex(value)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-zinc-300">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : '#000000'}
          onChange={e => onChange(e.target.value)}
          className="h-10 w-12 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#rrggbb"
          className={`flex-1 bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 ${
            valid ? 'border-zinc-700 focus:border-orange-500 focus:ring-orange-500/30' : 'border-red-500/60 focus:border-red-500'
          }`}
        />
      </div>
      {!valid && <p className="text-xs text-red-400">無效色碼，請用 #rrggbb</p>}
    </div>
  )
}

export default function AdminSiteSettings() {
  const { data, execute: load, loading } = useApi(api.getSiteSettings)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (data) setForm(f => ({ ...EMPTY, ...data, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v != null)) }))
  }, [data])

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })); setMsg(''); setErr('') }

  const invalidColors = COLOR_FIELDS.filter(c => !isValidHex(form[c.key])).map(c => c.label)

  async function handleSave(e) {
    e.preventDefault()
    if (invalidColors.length) { setErr(`色碼無效：${invalidColors.join('、')}`); return }
    setSaving(true); setErr(''); setMsg('')
    try {
      await api.updateSiteSettings(form)
      setMsg('已儲存，前台重新整理後即套用新設定。')
    } catch (e2) {
      setErr(e2.message || '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">網站設定</h1>
          <p className="text-zinc-500 text-sm mt-1">全站名稱、主題配色、Hero 與聯絡資訊（僅管理員可編輯）</p>
        </div>
      </div>

      {loading && !data ? (
        <div className="p-8 text-center text-zinc-500 text-sm">載入中…</div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-8">
          {/* 基本 */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">基本資訊</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="網站名稱" value={form.site_name} onChange={e => set('site_name', e.target.value)} />
              <FormInput label="標語 Tagline" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
              <FormInput label="Logo URL（可空）" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} className="sm:col-span-2" />
            </div>
          </section>

          {/* 主題配色 */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">主題配色</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COLOR_FIELDS.map(c => (
                <ColorField key={c.key} label={c.label} value={form[c.key] ?? ''} onChange={v => set(c.key, v)} />
              ))}
            </div>
            <div className="mt-5 rounded-lg p-4 border" style={{ background: isValidHex(form.background_color) ? form.background_color : '#09090b', borderColor: isValidHex(form.border_color) ? form.border_color : '#27272a' }}>
              <div className="text-xs mb-2" style={{ color: isValidHex(form.text_color) ? form.text_color : '#fafafa' }}>預覽</div>
              <span className="inline-block px-4 py-2 rounded font-semibold text-white" style={{ background: isValidHex(form.primary_color) ? form.primary_color : '#f97316' }}>
                {form.hero_cta_text || '按鈕範例'}
              </span>
            </div>
          </section>

          {/* Hero */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">首頁 Hero</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Hero 標題" value={form.hero_title} onChange={e => set('hero_title', e.target.value)} className="sm:col-span-2" />
              <FormTextarea label="Hero 副標題" value={form.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)} className="sm:col-span-2" />
              <FormInput label="CTA 按鈕文字" value={form.hero_cta_text} onChange={e => set('hero_cta_text', e.target.value)} />
              <FormInput label="CTA 連結" value={form.hero_cta_link} onChange={e => set('hero_cta_link', e.target.value)} />
              <FormInput label="Hero 圖片 URL（可空）" value={form.hero_image_url} onChange={e => set('hero_image_url', e.target.value)} className="sm:col-span-2" />
            </div>
          </section>

          {/* 聯絡 */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">聯絡資訊</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
              <FormInput label="電話" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              <FormInput label="LINE" value={form.contact_line} onChange={e => set('contact_line', e.target.value)} />
              <FormInput label="Instagram" value={form.contact_instagram} onChange={e => set('contact_instagram', e.target.value)} />
            </div>
          </section>

          {err && <p className="text-red-400 text-sm">{err}</p>}
          {msg && <p className="text-green-400 text-sm">{msg}</p>}
          <div>
            <Button type="submit" loading={saving}>儲存設定</Button>
          </div>
        </form>
      )}
    </div>
  )
}
