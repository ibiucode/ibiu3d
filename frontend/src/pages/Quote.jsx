import { useEffect, useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { api } from '../services/api'
import FormInput from '../components/forms/FormInput'
import FormSelect from '../components/forms/FormSelect'
import FormTextarea from '../components/forms/FormTextarea'
import Button from '../components/ui/Button'

const PRINT_TYPES = [
  { value: '', label: '請選擇列印技術' },
  { value: 'fdm', label: 'FDM 熔融堆積列印' },
  { value: 'sla', label: 'SLA 光固化列印' },
  { value: 'unsure', label: '不確定，請幫我建議' },
]

const BUDGETS = [
  { value: '', label: '請選擇預算範圍' },
  { value: 'under500', label: 'NT$500 以下' },
  { value: '500-2000', label: 'NT$500 – 2,000' },
  { value: '2000-5000', label: 'NT$2,000 – 5,000' },
  { value: 'over5000', label: 'NT$5,000 以上' },
  { value: 'unsure', label: '不確定' },
]

export default function Quote() {
  const { trackPageView, track, sessionId } = useAnalytics()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', print_type: '', budget: '', description: '', privacy_agreed: false,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    trackPageView('/quote')
  }, [trackPageView])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = '請填寫姓名'
    if (!form.email.trim()) e.email = '請填寫 Email'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email 格式不正確'
    if (!form.description.trim()) e.description = '請說明需求'
    if (!form.privacy_agreed) e.privacy_agreed = '請同意隱私政策'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }

    setLoading(true)
    setServerError('')
    try {
      await api.submitInquiry({ ...form, session_id: sessionId })
      track('quote_submitted')
      setSuccess(true)
    } catch (err) {
      setServerError(err.message || '送出失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-6">✅</div>
        <h1 className="text-3xl font-black text-white mb-4">詢價已送出！</h1>
        <p className="text-zinc-400 mb-2">感謝您的詢問，我們會在 24 小時內以 Email 回覆報價。</p>
        <p className="text-zinc-500 text-sm">若有急件需求，也可直接致電或透過 LINE 聯絡。</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-3">詢價 / 需求表單</h1>
        <p className="text-zinc-400">填寫以下資訊，我們將在 24 小時內回覆報價</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput
            label="姓名"
            required
            placeholder="您的姓名"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
          />
          <FormInput
            label="電話（選填）"
            placeholder="方便聯絡的電話"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
        </div>

        <FormInput
          label="Email"
          required
          type="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          error={errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormSelect
            label="列印技術"
            options={PRINT_TYPES}
            value={form.print_type}
            onChange={e => set('print_type', e.target.value)}
          />
          <FormSelect
            label="預算範圍"
            options={BUDGETS}
            value={form.budget}
            onChange={e => set('budget', e.target.value)}
          />
        </div>

        <FormTextarea
          label="需求說明"
          required
          placeholder="請描述您的需求，例如：用途、尺寸、數量、特殊要求等"
          rows={5}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          error={errors.description}
        />

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy"
            checked={form.privacy_agreed}
            onChange={e => set('privacy_agreed', e.target.checked)}
            className="mt-0.5 accent-orange-500"
          />
          <label htmlFor="privacy" className="text-zinc-400 text-sm leading-relaxed">
            我同意
            <a href="#/privacy" className="text-orange-400 hover:underline mx-1">隱私政策</a>
            ，並了解本站僅使用提供的資料處理詢價事務
          </label>
        </div>
        {errors.privacy_agreed && <p className="text-xs text-red-400 -mt-3">{errors.privacy_agreed}</p>}

        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" className="w-full">
          送出詢價
        </Button>
      </form>
    </div>
  )
}
