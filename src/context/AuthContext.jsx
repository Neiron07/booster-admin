import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

// Role permissions — на будущее для маркетологов, учителей и т.д.
export const PERMISSIONS = {
  admin:      ['*'],                                          // всё
  teacher:    ['users.view', 'quiz.*', 'leaderboard.view'],
  marketer:   ['shop.*', 'skins.*', 'users.view'],
  moderator:  ['registrations.*', 'users.view', 'users.block'],
}

export const can = (role, action) => {
  const perms = PERMISSIONS[role] || []
  if (perms.includes('*')) return true
  if (perms.includes(action)) return true
  const [ns] = action.split('.')
  return perms.includes(`${ns}.*`)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (loginId, password) => {
    const { data } = await authApi.login(loginId, password)
    const { user, accessToken, refreshToken } = data.data

    // Только admin и выше могут войти в админку
    if (!['admin', 'teacher', 'marketer', 'moderator'].includes(user.role)) {
      throw new Error('Нет доступа к административной панели')
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refreshToken')
    await authApi.logout(refresh).catch(() => {})
    localStorage.clear()
    setUser(null)
  }

  const hasPermission = (action) => user ? can(user.role, action) : false

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
