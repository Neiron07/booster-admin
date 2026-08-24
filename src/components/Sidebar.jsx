import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, ClipboardList, Gamepad2,
  ShoppingBag, Shirt, Trophy, BookOpen, LogOut, ChevronRight, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from './UI'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Дашборд',       perm: null },
  { to: '/registrations', icon: ClipboardList,  label: 'Заявки',         perm: 'registrations.view', badge: 'pending' },
  { to: '/users',         icon: Users,           label: 'Пользователи',   perm: 'users.view' },
  { to: '/quiz',          icon: BookOpen,        label: 'Квиз',           perm: 'quiz.view' },
  { to: '/games',         icon: Gamepad2,        label: 'Мини-игры',      perm: null },
  { to: '/shop',          icon: ShoppingBag,     label: 'Магазин',        perm: 'shop.view' },
  { to: '/skins',         icon: Shirt,           label: 'Образы',         perm: 'skins.view' },
  { to: '/leaderboard',   icon: Trophy,          label: 'Лидерборд',      perm: 'leaderboard.view' },
]

const roleLabels = {
  admin: 'Администратор',
  teacher: 'Учитель',
  marketer: 'Маркетолог',
  moderator: 'Модератор',
}

export default function Sidebar({ pendingCount, open, onClose }) {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.info('Вы вышли из системы')
  }

  const visibleItems = navItems.filter(item =>
    !item.perm || hasPermission(item.perm) || user?.role === 'admin'
  )

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={clsx(
        'w-64 shrink-0 bg-surface-card border-r border-surface-border flex flex-col h-screen',
        'fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out',
        'lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-fox-500 flex items-center justify-center text-lg">
              🦊
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">Booster</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-hover text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx('sidebar-link group',
                  isActive
                    ? 'bg-brand-600/20 text-white border border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-surface-hover border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={17} className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === 'pending' && pendingCount > 0 && (
                    <span className="bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {pendingCount}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} className="text-brand-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="px-3 py-3 border-t border-surface-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-hover">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-500">{roleLabels[user?.role] || user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Выйти"
              className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
