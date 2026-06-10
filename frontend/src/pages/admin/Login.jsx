import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FormInput from '../../components/forms/FormInput'
import Button from '../../components/ui/Button'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true })
  }, [user, authLoading, navigate, from])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-orange-500 text-3xl font-black">▲</span>
          <h1 className="text-xl font-bold text-white mt-2">管理後台</h1>
          <p className="text-zinc-500 text-sm mt-1">職人自造</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <FormInput
            label="Email"
            type="email"
            required
            placeholder="admin@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <FormInput
            label="密碼"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-1">
            登入
          </Button>
        </form>
      </div>
    </div>
  )
}
