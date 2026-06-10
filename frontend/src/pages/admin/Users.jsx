import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { api } from '../../services/api'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormInput from '../../components/forms/FormInput'
import FormSelect from '../../components/forms/FormSelect'

const ROLE_OPTIONS = [
  { value: 'viewer', label: '檢視者 — 只能查看' },
  { value: 'staff', label: '員工 — 可更新狀態和備註' },
  { value: 'admin', label: '管理員 — 完整權限' },
]

const ROLE_VARIANT = { admin: 'orange', staff: 'blue', viewer: 'default' }
const ROLE_LABEL = { admin: '管理員', staff: '員工', viewer: '檢視者' }

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const { data: users, execute: fetchUsers, loading } = useApi(api.getUsers)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'viewer' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
    setFormError('')
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setFormError('Email 和密碼為必填'); return }
    setFormLoading(true)
    try {
      await api.createUser(form)
      setShowForm(false)
      setForm({ email: '', password: '', name: '', role: 'viewer' })
      fetchUsers()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function toggleActive(user) {
    try {
      await api.updateUser(user.id, { is_active: !user.is_active })
      fetchUsers()
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">帳號管理</h1>
          <p className="text-zinc-500 text-sm mt-1">管理後台使用者帳號</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '取消' : '＋ 新增帳號'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">新增帳號</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormInput label="姓名" placeholder="顯示名稱" value={form.name} onChange={e => setField('name', e.target.value)} />
            <FormInput label="Email" required type="email" placeholder="user@example.com" value={form.email} onChange={e => setField('email', e.target.value)} />
            <FormInput label="密碼" required type="password" placeholder="至少 8 字元" value={form.password} onChange={e => setField('password', e.target.value)} />
            <FormSelect label="角色" options={ROLE_OPTIONS} value={form.role} onChange={e => setField('role', e.target.value)} />
          </div>
          {formError && <p className="text-red-400 text-sm mb-3">{formError}</p>}
          <Button type="submit" loading={formLoading} size="sm">建立帳號</Button>
        </form>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">載入中…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">帳號</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">角色</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">狀態</th>
                <th className="text-right px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map(u => (
                <tr key={u.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-5 py-4">
                    <div className="text-white font-medium">{u.name || '—'}</div>
                    <div className="text-zinc-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <Badge variant={ROLE_VARIANT[u.role] || 'default'}>{ROLE_LABEL[u.role] || u.role}</Badge>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-zinc-500'}`}>
                      {u.is_active ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => toggleActive(u)}
                        className={`text-xs transition-colors ${
                          u.is_active
                            ? 'text-zinc-500 hover:text-red-400'
                            : 'text-zinc-500 hover:text-green-400'
                        }`}
                      >
                        {u.is_active ? '停用' : '啟用'}
                      </button>
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
