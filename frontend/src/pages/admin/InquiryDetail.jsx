import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormSelect from '../../components/forms/FormSelect'
import FormTextarea from '../../components/forms/FormTextarea'

const STATUSES = ['新詢價', '已查看', '待切片', '已切片', '已報價', '等待客戶回覆', '製作中', '已完成', '已取消']
const STATUS_OPTIONS = STATUSES.map(s => ({ value: s, label: s }))

const STATUS_VARIANT = {
  '新詢價': 'orange', '已查看': 'blue', '待切片': 'yellow', '已切片': 'yellow',
  '已報價': 'blue', '等待客戶回覆': 'yellow', '製作中': 'blue',
  '已完成': 'green', '已取消': 'default',
}

const SERVICE_LABEL = { fdm: 'FDM 熔融堆積列印', sla: 'SLA 光固化列印', unsure: '不確定' }
const BUDGET_LABEL = {
  'under500': 'NT$500 以下', '500-2000': 'NT$500–2,000',
  '2000-5000': 'NT$2,000–5,000', 'over5000': 'NT$5,000 以上', 'unsure': '不確定',
}

function formatDatetime(iso) {
  return new Date(iso).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <span className="text-zinc-500 text-sm w-28 flex-shrink-0">{label}</span>
      <span className="text-zinc-200 text-sm">{value}</span>
    </div>
  )
}

export default function InquiryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [note, setNote] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteError, setNoteError] = useState('')

  async function load() {
    try {
      const data = await api.getInquiry(id)
      setInquiry(data)
      setNewStatus(data.status)
    } catch {
      navigate('/admin/inquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleStatusUpdate() {
    if (newStatus === inquiry.status) return
    setStatusLoading(true)
    try {
      await api.updateStatus(id, newStatus)
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!note.trim()) return
    setNoteLoading(true)
    setNoteError('')
    try {
      await api.addNote(id, note.trim())
      setNote('')
      await load()
    } catch (err) {
      setNoteError(err.message)
    } finally {
      setNoteLoading(false)
    }
  }

  const canEdit = user?.role === 'admin' || user?.role === 'staff'

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">載入中…</div>
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/inquiries')} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← 返回列表
        </button>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-400 text-sm">詢價 #{inquiry.id}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{inquiry.customer_name}</h1>
          <p className="text-zinc-500 text-sm mt-1">送出於 {formatDatetime(inquiry.created_at)}</p>
        </div>
        <Badge variant={STATUS_VARIANT[inquiry.status] || 'default'} className="text-sm px-3 py-1">
          {inquiry.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info + Notes */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Customer info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">客戶資訊</h2>
            <InfoRow label="Email" value={inquiry.email} />
            <InfoRow label="電話" value={inquiry.phone} />
            <InfoRow label="LINE" value={inquiry.line_id} />
            <InfoRow label="列印技術" value={SERVICE_LABEL[inquiry.service_type] || inquiry.service_type} />
            <InfoRow label="預算" value={BUDGET_LABEL[inquiry.budget] || inquiry.budget} />
            <InfoRow label="材料偏好" value={inquiry.material_preference} />
            <InfoRow label="數量" value={inquiry.quantity > 1 ? String(inquiry.quantity) : null} />
            <InfoRow label="期望交期" value={inquiry.deadline} />
            {inquiry.customer_note && (
              <div className="pt-3">
                <p className="text-zinc-500 text-sm mb-1.5">需求說明</p>
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-800/50 rounded-lg p-3">
                  {inquiry.customer_note}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">內部備註</h2>
            {inquiry.notes.length === 0 ? (
              <p className="text-zinc-600 text-sm mb-4">尚無備註</p>
            ) : (
              <div className="flex flex-col gap-3 mb-5">
                {inquiry.notes.map(n => (
                  <div key={n.id} className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-zinc-400 text-xs font-medium">{n.author}</span>
                      <span className="text-zinc-600 text-xs">{formatDatetime(n.created_at)}</span>
                    </div>
                    <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))}
              </div>
            )}

            {canEdit && (
              <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                <FormTextarea
                  placeholder="新增內部備註…"
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
                {noteError && <p className="text-red-400 text-xs">{noteError}</p>}
                <Button type="submit" size="sm" loading={noteLoading} disabled={!note.trim()}>
                  新增備註
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Status + History */}
        <div className="flex flex-col gap-5">
          {/* Status update */}
          {canEdit && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">更新狀態</h2>
              <FormSelect
                options={STATUS_OPTIONS}
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="mb-3"
              />
              <Button
                size="sm"
                className="w-full"
                loading={statusLoading}
                disabled={newStatus === inquiry.status}
                onClick={handleStatusUpdate}
              >
                確認更新
              </Button>
            </div>
          )}

          {/* Status history */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">狀態歷程</h2>
            {inquiry.status_history.length === 0 ? (
              <p className="text-zinc-600 text-sm">尚無歷程</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {[...inquiry.status_history].reverse().map((h, i) => (
                  <li key={i} className="flex gap-3 text-xs">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    <div>
                      <div className="text-zinc-300">
                        {h.from ? <><span className="line-through text-zinc-600">{h.from}</span> → </> : ''}
                        {h.to}
                      </div>
                      <div className="text-zinc-600">{formatDatetime(h.changed_at)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
