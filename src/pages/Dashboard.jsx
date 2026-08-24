import { useEffect, useState } from 'react'
import { Users, ClipboardList, Trophy, BookOpen, TrendingUp, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi, registrationsApi } from '../services/api'
import { StatCard, Spinner, Badge } from '../components/UI'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

// Fake sparkline data для демонстрации
const mockActivity = [
  { day: 'Пн', users: 12, foxes: 3200 },
  { day: 'Вт', users: 19, foxes: 4800 },
  { day: 'Ср', users: 15, foxes: 3900 },
  { day: 'Чт', users: 28, foxes: 7100 },
  { day: 'Пт', users: 35, foxes: 8900 },
  { day: 'Сб', users: 22, foxes: 5600 },
  { day: 'Вс', users: 18, foxes: 4200 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      registrationsApi.getAll({ status: 'pending', limit: 5 }),
    ]).then(([s, r]) => {
      setStats(s.data.data)
      setPending(r.data.requests)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} className="text-brand-500" />
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="text-slate-500 text-sm mt-1">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: ru })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Всего студентов"
          value={stats?.users?.total?.toLocaleString() ?? '—'}
          sub={`${stats?.users?.active ?? 0} активных`}
          color="brand"
        />
        <StatCard
          icon={ClipboardList}
          label="Новых заявок"
          value={stats?.pendingRegistrations ?? '—'}
          sub="ожидают одобрения"
          color="amber"
        />
        <StatCard
          icon={Zap}
          label="Фоксов в обороте"
          value={stats?.foxesInCirculation?.toLocaleString() ?? '—'}
          sub="FOX у всех студентов"
          color="fox"
        />
        <StatCard
          icon={BookOpen}
          label="Квиз сегодня"
          value={stats?.quizScheduledToday ? 'Запланирован' : 'Не задан'}
          sub={stats?.quizScheduledToday ? 'всё готово' : 'нужно настроить'}
          color={stats?.quizScheduledToday ? 'emerald' : 'red'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Activity chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-white">Активность за неделю</h2>
              <p className="text-xs text-slate-500 mt-0.5">Активные пользователи и начисленные Фоксы</p>
            </div>
            <TrendingUp size={18} className="text-brand-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockActivity} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFoxes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Пользователи" stroke="#6366f1" strokeWidth={2} fill="url(#gradUsers)" dot={false} />
              <Area type="monotone" dataKey="foxes" name="Фоксы" stroke="#f97316" strokeWidth={2} fill="url(#gradFoxes)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            {[
              { label: 'Запланировать квиз', href: '/quiz', color: 'text-brand-400', icon: BookOpen },
              { label: 'Добавить товар',      href: '/shop', color: 'text-fox-400', icon: Zap },
              { label: 'Новый образ',         href: '/skins', color: 'text-violet-400', icon: Trophy },
            ].map(item => (
              <a key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover border border-surface-border hover:border-brand-600/40 transition-all group">
                <item.icon size={16} className={item.color} />
                <span className="text-sm text-slate-300 group-hover:text-white">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Shop orders */}
          <div className="mt-4 pt-4 border-t border-surface-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Заявки в магазин</span>
              <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {stats?.pendingShopOrders ?? 0} новых
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Registrations Preview */}
      {pending.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h2 className="font-semibold text-white">Последние заявки на регистрацию</h2>
            <a href="/registrations" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Все заявки →
            </a>
          </div>
          <div className="divide-y divide-surface-border">
            {pending.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-sm font-bold text-brand-400">
                  {r.full_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{r.full_name}</p>
                  <p className="text-xs text-slate-500">{r.parent_phone} · {r.grade}</p>
                </div>
                <Badge value="pending" />
                <a href="/registrations" className="btn-primary text-xs px-3 py-1.5">Рассмотреть</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
