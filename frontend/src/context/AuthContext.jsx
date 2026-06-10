import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { setLoading(false); return }
    api.getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password)
    localStorage.setItem('admin_token', res.access_token)
    const user = await api.getMe()
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
