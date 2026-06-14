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

const EMPTY = {
  title: '', slug: '', category: '', summary: '', content: '',
  cover_image_url: '', status: 'draft', is_pinned: false,
  published_at: '', expires_at: '', sort_order: 0,
}

const dateOnly = (iso) => (iso ? String(iso).slice(0, 10) : '')

export default function AdminNews() {
  const { data: list, execute: load, loading } = useApi(api.getCmsNews)
  const [editing, setEditing] = useState(null) // null=列表, 'new'=新增, 物件=編輯
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [load])

  function openNew() { setForm(EMPTY); setEditing('new'); setErr('') }
  function openEdit(n) {
    setForm({ ...EMPTY, ...n, cover_image_url: n.cover_image_url || '', published_at: dateOnly(n.published_at), expires_at: dateOnly(n.expires_at) })
    setEditing(n); setErr('')
  }
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErr('') }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) { setErr('標題為必填'); return }
    setSaving(true); setErr('')
    const payload = {
      ...form,
      sort_order: Number(form.sort_order) || 0,
      published_at: form.published_at || null,
      expires_at: form.expires_at || null,
      slug: form.slug || null,
    }
    try {
      if (editing === 'new') await api.createCmsNews(payload)
      else await api.updateCmsNews(editing.id, payload)
      setEditing(null); load()
    } catch (e2) { setErr(e2.message || '儲存失敗') } finally { setSaving(false) }
  }

  async function handleArchive(n) {
    if (!window.confirm(`確定封存「${n.title}」？（不會刪除資料，可改回草稿/發布）`)) return
    try { await api.deleteCmsNews(n.id); load() } catch (e) { alert(e.message) }
  }

  if (editing) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-zinc-300 text-sm mb-6">← 返回列表</button>
        <h1 className="text-2xl font-bold text-white mb-6">{editing === 'new' ? '新增公告' : '編輯公告'}</h1>
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <FormInput label="標題" required value={form.title} onChange={e => set('title', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Slug（留空自動產生）" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="my-post" />
            <FormInput label="分類" value={form.category} onChange={e => set('category', e.target.value)} placeholder="公告 / 活動…" />
          </div>
          <FormInput label="摘要" value={form.summary} onChange={e => set('summary', e.target.value)} />
          <FormTextarea label="內文（純文字）" value={form.content} onChange={e => set('content', e.target.value)} rows={8} />
          <FormInput label="封面圖片 URL（可空）" value={form.cover_image_url} onChange={e => set('cover_image_url', e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect label="狀態" options={STATUS_OPTIONS} value={form.status} onChange={e => set('status', e.target.value)} />
            <FormInput label="排序（數字越小越前）" type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
            <FormInput label="發布日期" type="date" value={form.published_at} onChange={e => set('published_at', e.target.value)} />
            <FormInput label="到期日（可空）" type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={!!form.is_pinned} onChange={e => set('is_pinned', e.target.checked)} />
            置頂
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
          <h1 className="text-2xl font-bold text-white">最新消息</h1>
          <p className="text-zinc-500 text-sm mt-1">管理公告：草稿 / 發布 / 下架、置頂、到期</p>
        </div>
        <Button size="sm" onClick={openNew}>＋ 新增公告</Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading && !list ? (
          <div className="p-8 text-center text-zinc-500 text-sm">載入中…</div>
        ) : !list || list.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">尚無公告，點右上角新增。</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">標題</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">狀態</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">分類</th>
                <th className="text-right px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(n => (
                <tr key={n.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-5 py-4">
                    <div className="text-white font-medium flex items-center gap-2">
                      {n.is_pinned && <Badge variant="orange">置頂</Badge>}{n.title}
                    </div>
                    <div className="text-zinc-600 text-xs">{n.slug}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <Badge variant={STATUS_VARIANT[n.status] || 'default'}>{STATUS_LABEL[n.status] || n.status}</Badge>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-zinc-400">{n.category || '—'}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(n)} className="text-zinc-400 hover:text-white text-xs mr-4">編輯</button>
                    {n.status !== 'archived' && (
                      <button onClick={() => handleArchive(n)} className="text-zinc-500 hover:text-red-400 text-xs">封存</button>
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
