import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Spinner() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Forbidden() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center px-4">
      <div>
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">權限不足</h2>
        <p className="text-zinc-400 text-sm">此頁面需要管理員權限</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (requiredRole === 'admin' && user.role !== 'admin') return <Forbidden />

  return children
}
