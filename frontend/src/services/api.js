const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || '請求失敗')
  }
  return res.json()
}

// ── 公開 API ─────────────────────────────────────────────────────
export const api = {
  health: () => request('/health'),

  submitInquiry: (data) => request('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      service_type: data.print_type || null,
      budget: data.budget || null,
      customer_note: data.description || null,
      privacy_agreed: data.privacy_agreed,
      session_id: data.session_id || null,
    }),
  }),

  trackEvent: (payload) => request('/api/analytics/event', {
    method: 'POST',
    body: JSON.stringify({
      session_id: payload.session_id,
      event_type: payload.event_type,
      page: payload.page_path || payload.page || null,
      element: payload.element || null,
      referrer: payload.referrer || null,
      duration_ms: payload.duration_ms || null,
    }),
  }).catch(() => {}),

  // ── 後台 Auth ─────────────────────────────────────────────────
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  getMe: () => request('/api/auth/me'),

  // ── 後台詢價 ─────────────────────────────────────────────────
  getInquiries: (status) => request(`/api/admin/inquiries${status ? `?status=${status}` : ''}`),
  getInquiry: (id) => request(`/api/admin/inquiries/${id}`),
  updateStatus: (id, status) => request(`/api/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  addNote: (id, content) => request(`/api/admin/inquiries/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // ── 後台 Analytics ────────────────────────────────────────────
  getAnalyticsSummary: (days = 30) => request(`/api/analytics/admin/summary?days=${days}`),
  getPopularPages: (days = 30) => request(`/api/analytics/admin/popular-pages?days=${days}`),
  getDailyTrend: (days = 30) => request(`/api/analytics/admin/daily-trend?days=${days}`),

  // ── 後台帳號 ─────────────────────────────────────────────────
  getUsers: () => request('/api/admin/users'),
  createUser: (data) => request('/api/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // ── 未來模組 placeholder ──────────────────────────────────────
  getModules: () => request('/api/admin/modules'),
  getModuleStatus: (name) => request(`/api/admin/modules/${name}/status`),
}

export { BASE_URL }
