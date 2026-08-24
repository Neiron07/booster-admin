import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/UI'
import { Eye, EyeOff, Zap } from 'lucide-react'

export default function Login() {
  const [login, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: doLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await doLogin(login, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-fox-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-fox-500 flex items-center justify-center text-2xl mb-4 shadow-glow">
            🦊
          </div>
          <h1 className="text-xl font-bold text-white">Booster Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Административная панель</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Логин</label>
              <input
                className="input"
                type="text"
                placeholder="Логин администратора"
                value={login}
                onChange={e => setLoginId(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Пароль</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? <Spinner size={16} /> : <Zap size={16} />}
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Доступ только для сотрудников Booster
        </p>
      </div>
    </div>
  )
}
