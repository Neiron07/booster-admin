import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://booster-back-production.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Attach token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refreshToken')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refresh })
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:          (login, password) => api.post('/auth/login', { login, password }),
  logout:         (refreshToken) => api.post('/auth/logout', { refreshToken }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
}

// ── Registrations ─────────────────────────────────────────────
export const registrationsApi = {
  getAll:   (params) => api.get('/admin/registrations', { params }),
  approve:  (id) => api.post(`/admin/registrations/${id}/approve`),
  reject:   (id, reason) => api.post(`/admin/registrations/${id}/reject`, { reason }),
}

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  getAll:        (params) => api.get('/admin/users', { params }),
  create:        (data) => api.post('/admin/users', data),
  setStatus:     (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  grantFoxes:    (id, amount, description) => api.post(`/admin/users/${id}/grant-foxes`, { amount, description }),
  grantExp:      (id, amount, description) => api.post(`/admin/users/${id}/grant-exp`, { amount, description }),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  getTransactions: (params) => api.get('/me/transactions', { params }),
}

// ── Quiz ──────────────────────────────────────────────────────
export const quizApi = {
  getQuestions: (params) => api.get('/admin/quiz/questions', { params }),
  create:       (data) => api.post('/admin/quiz/questions', data),
  update:       (id, data) => api.put(`/admin/quiz/questions/${id}`, data),
  delete:       (id) => api.delete(`/admin/quiz/questions/${id}`),
  schedule:     (quiz_date, question_ids) => api.post('/admin/quiz/schedule', { quiz_date, question_ids }),
}

// ── Games ─────────────────────────────────────────────────────
export const gamesApi = {
  getAll: () => api.get('/games'),
}

// ── Shop ──────────────────────────────────────────────────────
export const shopApi = {
  getItems:   () => api.get('/shop'),
  createItem: (data) => api.post('/admin/shop/items', data),
  updateItem: (id, data) => api.put(`/admin/shop/items/${id}`, data),
  deleteItem: (id) => api.delete(`/admin/shop/items/${id}`),
}

// ── Skins ─────────────────────────────────────────────────────
export const skinsApi = {
  getAll:  (params) => api.get('/skins', { params }),
  create:  (data) => api.post('/admin/skins', data),
  update:  (id, data) => api.put(`/admin/skins/${id}`, data),
}

// ── Leaderboard ───────────────────────────────────────────────
export const leaderboardApi = {
  get: () => api.get('/leaderboard'),
}

export default api
