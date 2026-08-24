import { useEffect, useState } from 'react'
import {
  Users, Search, UserPlus, Lock, Unlock, Zap, Key,
  TrendingUp, RefreshCw
} from 'lucide-react'
import { usersApi } from '../services/api'
import { Table, Badge, Modal, Confirm, Empty, Spinner, Pagination, Field, toast } from '../components/UI'
import { format } from 'date-fns'

function UserDetail({ user, onClose }) {
  const [tab, setTab] = useState('info')
  const [foxAmount, setFoxAmount] = useState('')
  const [foxDesc, setFoxDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const grantFoxes = async () => {
    if (!foxAmount) return
    setLoading(true)
    try {
      await usersApi.grantFoxes(user.id, parseInt(foxAmount), foxDesc)
      toast.success(`Начислено ${foxAmount} FOX`)
      setFoxAmount(''); setFoxDesc('')
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  const grantExp = async () => {
    if (!expAmount) return
    setLoading(true)
    try {
      await usersApi.grantExp(user.id, parseInt(expAmount), 'Начисление из админки')
      toast.success(`Начислено ${expAmount} EXP`)
      setExpAmount('')
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-lg p-1">
        {['info', 'foxes', 'exp'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${tab===t ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t === 'info' ? 'Профиль' : t === 'foxes' ? '🐾 Фоксы' : '⚡ EXP'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-3">
          {[
            ['ФИО', user.full_name],
            ['Логин', user.login],
            ['Родитель', user.parent_name],
            ['Телефон родителя', user.parent_phone],
            ['Класс', user.grade],
            ['Роль', user.role],
            ['Статус', user.status],
            ['Фоксы', `${user.foxes?.toLocaleString()} FOX`],
            ['EXP', user.exp?.toLocaleString()],
            ['Уровень дома', user.level],
            ['Дата регистрации', user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy') : '—'],
            ['Последний вход', user.last_login_at ? format(new Date(user.last_login_at), 'dd.MM.yyyy HH:mm') : 'Ещё не входил'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-surface-border last:border-0">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-sm text-slate-200 font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'foxes' && (
        <div className="space-y-4">
          <div className="bg-fox-500/10 border border-fox-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-fox-400">🐾 {user.foxes?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">текущий баланс</p>
          </div>
          <Field label="Сумма (+ начислить / − списать)">
            <input className="input" type="number" placeholder="Например: 500 или -200"
              value={foxAmount} onChange={e => setFoxAmount(e.target.value)} />
          </Field>
          <Field label="Комментарий">
            <input className="input" placeholder="Причина начисления..."
              value={foxDesc} onChange={e => setFoxDesc(e.target.value)} />
          </Field>
          <button className="btn-primary w-full justify-center" onClick={grantFoxes} disabled={loading || !foxAmount}>
            {loading ? <Spinner size={14} /> : <Zap size={14} />}
            Применить
          </button>
        </div>
      )}

      {tab === 'exp' && (
        <div className="space-y-4">
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-brand-400">⚡ {user.exp?.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">опыт · уровень {user.level}</p>
          </div>
          <Field label="EXP для начисления">
            <input className="input" type="number" min="1" placeholder="Например: 100"
              value={expAmount} onChange={e => setExpAmount(e.target.value)} />
          </Field>
          <button className="btn-primary w-full justify-center" onClick={grantExp} disabled={loading || !expAmount}>
            {loading ? <Spinner size={14} /> : <TrendingUp size={14} />}
            Начислить EXP
          </button>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-surface-border">
        <button className="btn-ghost text-xs flex-1 justify-center" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}

function CreateUserModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', grade: '', parent_name: '', parent_phone: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await usersApi.create(form)
      setResult(res.data.data)
      toast.success('Пользователь создан')
      onCreated?.()
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  const reset = () => { setForm({ full_name: '', grade: '', parent_name: '', parent_phone: '' }); setResult(null) }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title="Создать пользователя">
      {result ? (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="font-semibold text-white">Логин: {result.login}</p>
            <p className="text-xs text-slate-400 mt-1">Автоотправки нет — передайте логин и пароль родителю ({result.parentPhone}) вручную</p>
          </div>
          <div className="bg-surface rounded-lg p-3 font-mono text-sm text-center text-fox-400 border border-surface-border">
            Пароль: <strong>{result.rawPassword}</strong>
          </div>
          <button className="btn-primary w-full justify-center" onClick={() => { reset(); onClose() }}>Готово</button>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="ФИО ребёнка">
            <input className="input" placeholder="Иванов Иван Иванович"
              value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} />
          </Field>
          <Field label="Класс">
            <input className="input" placeholder="10A"
              value={form.grade} onChange={e => setForm(f => ({...f, grade: e.target.value}))} />
          </Field>
          <Field label="Имя родителя">
            <input className="input" placeholder="Иванова Мария Петровна"
              value={form.parent_name} onChange={e => setForm(f => ({...f, parent_name: e.target.value}))} />
          </Field>
          <Field label="Телефон родителя">
            <input className="input" placeholder="77001234567"
              value={form.parent_phone} onChange={e => setForm(f => ({...f, parent_phone: e.target.value}))} />
          </Field>
          <div className="flex gap-2 justify-end pt-2">
            <button className="btn-ghost" onClick={onClose}>Отмена</button>
            <button className="btn-primary" onClick={submit}
              disabled={loading || !form.full_name || !form.grade || !form.parent_name || !form.parent_phone}>
              {loading ? <Spinner size={14} /> : <UserPlus size={14} />}
              Создать
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function UsersPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]       = useState(1)
  const [selected, setSelected] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [confirmBlock, setConfirmBlock] = useState(null)
  const [confirmReset, setConfirmReset] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const LIMIT = 20

  const load = async () => {
    setLoading(true)
    try {
      const res = await usersApi.getAll({ search, status: statusFilter, limit: LIMIT, offset: (page-1)*LIMIT })
      setData(res.data.users); setTotal(res.data.total)
    } catch { toast.error('Не удалось загрузить пользователей') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, statusFilter, page])

  const toggleBlock = async () => {
    const newStatus = confirmBlock.status === 'active' ? 'blocked' : 'active'
    setActionLoading(true)
    try {
      await usersApi.setStatus(confirmBlock.id, newStatus)
      toast.success(newStatus === 'blocked' ? 'Пользователь заблокирован' : 'Пользователь разблокирован')
      setConfirmBlock(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setActionLoading(false) }
  }

  const resetPassword = async () => {
    setActionLoading(true)
    try {
      const res = await usersApi.resetPassword(confirmReset.id)
      toast.success(`Новый пароль: ${res.data.data.rawPassword}`)
      setConfirmReset(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setActionLoading(false) }
  }

  const columns = [
    { key: 'full_name', label: 'Пользователь', render: r => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {r.full_name?.[0]}
        </div>
        <div>
          <p className="font-medium text-white">{r.full_name}</p>
          <p className="text-xs text-slate-500 font-mono">{r.login}</p>
        </div>
      </div>
    )},
    { key: 'grade', label: 'Класс', render: r => <span className="text-sm">{r.grade}</span> },
    { key: 'foxes', label: '🐾 Фоксы', render: r => (
      <span className="font-mono text-fox-400 font-medium">{r.foxes?.toLocaleString()}</span>
    )},
    { key: 'exp', label: '⚡ EXP', render: r => (
      <span className="font-mono text-brand-400 font-medium">{r.exp?.toLocaleString()}</span>
    )},
    { key: 'level', label: 'Ур.', render: r => (
      <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/30">{r.level}</span>
    )},
    { key: 'status', label: 'Статус', render: r => <Badge value={r.status} /> },
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-1.5">
        <button className="btn-ghost text-xs px-2 py-1" onClick={() => setSelected(r)} title="Управление">
          <Zap size={13} />
        </button>
        <button
          className={r.status === 'blocked' ? 'btn-success text-xs px-2 py-1' : 'btn-danger text-xs px-2 py-1'}
          onClick={() => setConfirmBlock(r)}
          title={r.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
        >
          {r.status === 'blocked' ? <Unlock size={13} /> : <Lock size={13} />}
        </button>
        <button className="btn-ghost text-xs px-2 py-1" onClick={() => setConfirmReset(r)} title="Сбросить пароль">
          <Key size={13} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-slate-500 text-sm mt-1">Всего: {total.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost"><RefreshCw size={15} /></button>
          <button className="btn-primary" onClick={() => setCreateModal(true)}>
            <UserPlus size={15} /> Создать
          </button>
        </div>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex gap-3 p-4 border-b border-surface-border">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-9" placeholder="Поиск по имени, логину или телефону родителя..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input w-40"
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="blocked">Заблокированные</option>
          </select>
        </div>

        <Table columns={columns} data={data} loading={loading}
          empty={<Empty icon={Users} title="Пользователей нет" description="Попробуйте изменить параметры поиска" />}
        />
        <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
      </div>

      {/* User Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}
        title={selected?.full_name} width="max-w-md">
        {selected && <UserDetail user={selected} onClose={() => setSelected(null)} />}
      </Modal>

      {/* Create User Modal */}
      <CreateUserModal open={createModal} onClose={() => setCreateModal(false)} onCreated={load} />

      {/* Block Confirm */}
      <Confirm
        open={!!confirmBlock}
        onClose={() => setConfirmBlock(null)}
        onConfirm={toggleBlock}
        title={confirmBlock?.status === 'active' ? 'Заблокировать пользователя' : 'Разблокировать пользователя'}
        message={`${confirmBlock?.status === 'active' ? 'Заблокировать' : 'Разблокировать'} пользователя ${confirmBlock?.full_name}?`}
        danger={confirmBlock?.status === 'active'}
        loading={actionLoading}
      />

      {/* Reset Password Confirm */}
      <Confirm
        open={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={resetPassword}
        title="Сбросить пароль"
        message={`Сбросить пароль для ${confirmReset?.full_name}? Это разлогинит все его устройства. Новый пароль нужно будет передать родителю вручную.`}
        loading={actionLoading}
      />
    </div>
  )
}
