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
  title: '', slug: '', process_type: 'FDM', category: '', material: '',
  summary: '', description: '', image_url: '', thumbnail_url: '',
  is_featured: false, status: 'draft', sort_order: 0,
}

export default function AdminGallery() {
  const { data: list, execute: load, loading } = useApi(api.getCmsGallery)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [load])

  function openNew() { setForm(EMPTY); setEditing('new'); setErr('') }
  function openEdit(g) {
    setForm({ ...EMPTY, ...g, image_url: g.image_url || '', thumbnail_url: g.thumbnail_url || '' })
    setEditing(g); setErr('')
  }
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErr('') }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) { setErr('標題為必填'); return }
    setSaving(true); setErr('')
    const payload = { ...form, sort_order: Number(form.sort_order) || 0, slug: form.slug || null }
    try {
      if (editing === 'new') await api.createCmsGallery(payload)
      else await api.updateCmsGallery(editing.id, payload)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || '儲存失敗') } finally { setSaving(false) }
  }

  async function handleArchive(g) {
    if (!window.confirm(`確定封存「${g.title}」？`)) return
    try { await api.deleteCmsGallery(g.id); load() } catch (e) { alert(e.message) }
  }

  if (editing) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-zinc-300 text-sm mb-6">← 返回列表</button>
        <h1 className="text-2xl font-bold text-white mb-6">{editing === 'new' ? '新增作品' : '編輯作品'}</h1>
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <FormInput label="標題" required value={form.title} onChange={e => set('title', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Slug（留空自動產生）" value={form.slug} onChange={e => set('slug', e.target.value)} />
            <FormSelect label="工法" options={PROCESS_OPTIONS} value={form.process_type} onChange={e => set('process_type', e.target.value)} />
            <FormInput label="分類" value={form.category} onChange={e => set('category', e.target.value)} />
            <FormInput label="材料" value={form.material} onChange={e => set('material', e.target.value)} />
          </div>
          <FormInput label="摘要" value={form.summary} onChange={e => set('summary', e.target.value)} />
          <FormTextarea label="詳細說明" value={form.description} onChange={e => set('description', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="圖片 URL（可空，無則顯示 placeholder）" value={form.image_url} onChange={e => set('image_url', e.target.value)} />
            <FormInput label="縮圖 URL（可空）" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} />
            <FormSelect label="狀態" options={STATUS_OPTIONS} value={form.status} onChange={e => set('status', e.target.value)} />
            <FormInput label="排序" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
            設為精選（首頁顯示）
          </label>
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
          <h1 className="text-2xl font-bold text-white">作品管理</h1>
          <p className="text-zinc-500 text-sm mt-1">圖片僅使用 URL（不支援上傳）；無圖前台顯示 placeholder</p>
        </div>
        <Button size="sm" onClick={openNew}>＋ 新增作品</Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading && !list ? (
          <div className="p-8 text-center text-zinc-500 text-sm">載入中…</div>
        ) : !list || list.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">尚無作品，點右上角新增。</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">作品</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">工法</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">狀態</th>
                <th className="text-right px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(g => (
                <tr key={g.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-5 py-4">
                    <div className="text-white font-medium flex items-center gap-2">
                      {g.is_featured && <Badge variant="orange">精選</Badge>}{g.title}
                    </div>
                    <div className="text-zinc-600 text-xs">{g.material || g.category || g.slug}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <Badge variant={g.process_type === 'FDM' ? 'blue' : g.process_type === 'SLA' ? 'orange' : 'default'}>{g.process_type}</Badge>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <Badge variant={STATUS_VARIANT[g.status] || 'default'}>{STATUS_LABEL[g.status] || g.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(g)} className="text-zinc-400 hover:text-white text-xs mr-4">編輯</button>
                    {g.status !== 'archived' && (
                      <button onClick={() => handleArchive(g)} className="text-zinc-500 hover:text-red-400 text-xs">封存</button>
                    )}
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
