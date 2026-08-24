import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer, Spinner } from './components/UI'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Registrations from './pages/Registrations'
import Users from './pages/Users'
import Quiz from './pages/Quiz'
import { Shop, Skins } from './pages/ShopAndSkins'
import { Leaderboard, Games } from './pages/LeaderboardAndGames'
import { useEffect, useState } from 'react'
import { registrationsApi } from './services/api'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'moderator') {
      registrationsApi.getAll({ status: 'pending', limit: 1 })
        .then(r => setPendingCount(r.data.total))
        .catch(() => {})
    }
  }, [user])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl">🦊</div>
        <Spinner size={24} className="text-brand-500" />
        <p className="text-sm text-slate-500">Загрузка...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return (
    <div className="flex min-h-screen">
      <Sidebar pendingCount={pendingCount} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/users"         element={<Users />} />
          <Route path="/quiz"          element={<Quiz />} />
          <Route path="/games"         element={<Games />} />
          <Route path="/shop"          element={<Shop />} />
          <Route path="/skins"         element={<Skins />} />
          <Route path="/leaderboard"   element={<Leaderboard />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function AuthGuard() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthGuard />} />
          <Route path="/*"     element={<ProtectedLayout />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  )
}
