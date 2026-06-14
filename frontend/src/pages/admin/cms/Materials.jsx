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
const PROCESS_OPTIONS = [
  { value: 'FDM', label: 'FDM' },
  { value: 'SLA', label: 'SLA' },
  { value: 'Other', label: 'Other' },
]
const STATUS_VARIANT = { draft: 'default', published: 'green', archived: 'red' }
const STATUS_LABEL = { draft: '草稿', published: '已發布', archived: '已封存' }
const EMPTY = {
  name: '', process_type: 'FDM', category: '', properties: '', suitable_for: '',
  description: '', image_url: '', status: 'draft', sort_order: 0,
}

export default function AdminMaterials() {
  const { data: list, execute: load, loading } = useApi(api.getCmsMaterials)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [load])
  function openNew() { setForm(EMPTY); setEditing('new'); setErr('') }
  function openEdit(m) { setForm({ ...EMPTY, ...m, image_url: m.image_url || '' }); setEditing(m); setErr('') }
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErr('') }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { setErr('名稱為必填'); return }
    setSaving(true); setErr('')
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
    try {
      if (editing === 'new') await api.createCmsMaterial(payload)
      else await api.updateCmsMaterial(editing.id, payload)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || '儲存失敗') } finally { setSaving(false) }
  }
  async function handleArchive(m) {
    if (!window.confirm(`確定封存「${m.name}」？`)) return
    try { await api.deleteCmsMaterial(m.id); load() } catch (e) { alert(e.message) }
  }

  if (editing) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-zinc-300 text-sm mb-6">← 返回列表</button>
        <h1 className="text-2xl font-bold text-white mb-6">{editing === 'new' ? '新增材料' : '編輯材料'}</h1>
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="名稱" required value={form.name} onChange={e => set('name', e.target.value)} />
            <FormSelect label="工法" options={PROCESS_OPTIONS} value={form.process_type} onChange={e => set('process_type', e.target.value)} />
          </div>
          <FormInput label="分類" value={form.category} onChange={e => set('category', e.target.value)} />
          <FormInput label="特性 properties" value={form.properties} onChange={e => set('properties', e.target.value)} placeholder="耐熱、耐衝擊…" />
          <FormInput label="適合用途 suitable_for" value={form.suitable_for} onChange={e => set('suitable_for', e.target.value)} placeholder="功能性零件、展示品…" />
          <FormTextarea label="說明" value={form.description} onChange={e => set('description', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput label="圖片 URL（可空）" value={form.image_url} onChange={e => set('image_url', e.target.value)} className="sm:col-span-1" />
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
          <h1 className="text-2xl font-bold text-white">材料管理</h1>
          <p className="text-zinc-500 text-sm mt-1">材料介紹：工法、特性、適合用途；圖片僅 URL</p>
        </div>
        <Button size="sm" onClick={openNew}>＋ 新增材料</Button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading && !list ? (
          <div className="p-8 text-center text-zinc-500 text-sm">載入中…</div>
        ) : !list || list.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">尚無材料，點右上角新增。</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">名稱</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">工法</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">狀態</th>
                <th className="text-right px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{m.name}</div>
                    {m.properties && <div className="text-zinc-600 text-xs">{m.properties}</div>}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <Badge variant={m.process_type === 'FDM' ? 'blue' : m.process_type === 'SLA' ? 'orange' : 'default'}>{m.process_type}</Badge>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <Badge variant={STATUS_VARIANT[m.status] || 'default'}>{STATUS_LABEL[m.status] || m.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(m)} className="text-zinc-400 hover:text-white text-xs mr-4">編輯</button>
                    {m.status !== 'archived' && <button onClick={() => handleArchive(m)} className="text-zinc-500 hover:text-red-400 text-xs">封存</button>}
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
