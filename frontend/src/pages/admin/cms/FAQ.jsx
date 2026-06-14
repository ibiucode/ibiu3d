import { useEffect, useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../services/api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import FormInput from '../../../components/forms/FormInput'
import FormSelect from '../../../components/forms/FormSelect'
import FormTextarea from '../../../components/forms/FormTextarea'

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '發布' },
  { value: 'archived', label: '下架/封存' },
]
const STATUS_VARIANT = { draft: 'default', published: 'green', archived: 'red' }
const STATUS_LABEL = { draft: '草稿', published: '已發布', archived: '已封存' }
const EMPTY = { question: '', answer: '', category: '', status: 'draft', sort_order: 0 }

export default function AdminFAQ() {
  const { data: list, execute: load, loading } = useApi(api.getCmsFaqs)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [load])
  function openNew() { setForm(EMPTY); setEditing('new'); setErr('') }
  function openEdit(f) { setForm({ ...EMPTY, ...f }); setEditing(f); setErr('') }
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErr('') }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.question.trim()) { setErr('問題為必填'); return }
    setSaving(true); setErr('')
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
    try {
      if (editing === 'new') await api.createCmsFaq(payload)
      else await api.updateCmsFaq(editing.id, payload)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || '儲存失敗') } finally { setSaving(false) }
  }
  async function handleArchive(f) {
    if (!window.confirm(`確定封存此 FAQ？`)) return
    try { await api.deleteCmsFaq(f.id); load() } catch (e) { alert(e.message) }
  }

  if (editing) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-zinc-300 text-sm mb-6">← 返回列表</button>
        <h1 className="text-2xl font-bold text-white mb-6">{editing === 'new' ? '新增 FAQ' : '編輯 FAQ'}</h1>
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <FormInput label="問題" required value={form.question} onChange={e => set('question', e.target.value)} />
          <FormTextarea label="回答" value={form.answer} onChange={e => set('answer', e.target.value)} rows={5} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput label="分類" value={form.category} onChange={e => set('category', e.target.value)} />
            <FormSelect label="狀態" options={STATUS_OPTIONS} value={form.status} onChange={e => set('status', e.target.value)} />
            <FormInput label="排序" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <div><Button type="submit" loading={saving}>儲存</Button></div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ 管理</h1>
          <p className="text-zinc-500 text-sm mt-1">常見問題：新增、編輯、排序、發布 / 下架</p>
        </div>
        <Button size="sm" onClick={openNew}>＋ 新增 FAQ</Button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading && !list ? (
          <div className="p-8 text-center text-zinc-500 text-sm">載入中…</div>
        ) : !list || list.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">尚無 FAQ，點右上角新增。</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">問題</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">狀態</th>
                <th className="text-right px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(f => (
                <tr key={f.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{f.question}</div>
                    {f.category && <div className="text-zinc-600 text-xs">{f.category}</div>}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <Badge variant={STATUS_VARIANT[f.status] || 'default'}>{STATUS_LABEL[f.status] || f.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(f)} className="text-zinc-400 hover:text-white text-xs mr-4">編輯</button>
                    {f.status !== 'archived' && <button onClick={() => handleArchive(f)} className="text-zinc-500 hover:text-red-400 text-xs">封存</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
