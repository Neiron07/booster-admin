import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, ClipboardList, RefreshCw } from 'lucide-react'
import { registrationsApi } from '../services/api'
import { Table, Badge, Modal, Confirm, CredentialsModal, Empty, Spinner, Pagination, toast } from '../components/UI'
import { format } from 'date-fns'

export default function Registrations() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('pending')
  const [page, setPage]       = useState(1)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const LIMIT = 20

  const load = async () => {
    setLoading(true)
    try {
      const res = await registrationsApi.getAll({ status, limit: LIMIT, offset: (page - 1) * LIMIT })
      setData(res.data.requests)
      setTotal(res.data.total)
    } catch { toast.error('Не удалось загрузить заявки') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [status, page])

  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      const res = await registrationsApi.approve(id)
      setConfirm(null)
      setCredentials(res.data.data)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка одобрения')
    } finally { setActionLoading(false) }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(true)
    try {
      await registrationsApi.reject(rejectModal.id, rejectReason)
      toast.success('Заявка отклонена')
      setRejectModal(null)
      setRejectReason('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка отклонения')
    } finally { setActionLoading(false) }
  }

  const tabs = [
    { key: 'pending',  label: 'Ожидают' },
    { key: 'approved', label: 'Одобрены' },
    { key: 'rejected', label: 'Отклонены' },
  ]

  const columns = [
    { key: 'full_name', label: 'ФИО', render: r => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
          {r.full_name[0]}
        </div>
        <span className="font-medium text-white">{r.full_name}</span>
      </div>
    )},
    { key: 'parent_phone', label: 'Телефон родителя', render: r => (
      <span className="font-mono text-sm">{r.parent_phone}</span>
    )},
    { key: 'grade', label: 'Класс', render: r => (
      <Badge value="student" custom={r.grade} />
    )},
    { key: 'created_at', label: 'Дата', render: r => (
      <span className="text-slate-500 text-xs">{format(new Date(r.created_at), 'dd.MM.yyyy HH:mm')}</span>
    )},
    { key: 'status', label: 'Статус', render: r => <Badge value={r.status} /> },
    { key: 'actions', label: '', render: r => r.status === 'pending' ? (
      <div className="flex gap-2">
        <button className="btn-success text-xs px-2.5 py-1" onClick={() => setConfirm(r)}>
          <CheckCircle size={13} /> Одобрить
        </button>
        <button className="btn-danger text-xs px-2.5 py-1" onClick={() => setRejectModal(r)}>
          <XCircle size={13} /> Отклонить
        </button>
      </div>
    ) : null },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Заявки на регистрацию</h1>
          <p className="text-slate-500 text-sm mt-1">Рассматривайте и одобряйте заявки студентов</p>
        </div>
        <button onClick={load} className="btn-ghost self-start sm:self-auto" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Обновить
        </button>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-surface-border overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setStatus(t.key); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                status === t.key
                  ? 'bg-brand-600/20 text-white border border-brand-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-surface-hover'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={data}
          loading={loading}
          empty={
            <Empty
              icon={ClipboardList}
              title="Заявок нет"
              description={`Нет заявок со статусом "${tabs.find(t=>t.key===status)?.label}"`}
            />
          }
        />
        <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
      </div>

      {/* Approve Confirm */}
      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleApprove(confirm?.id)}
        title="Одобрить заявку"
        message={`Одобрить заявку от ${confirm?.full_name}? Пользователь будет создан, логин и пароль нужно будет передать родителю вручную.`}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="Отклонить заявку">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Отклоняете заявку от <strong className="text-white">{rejectModal?.full_name}</strong>.
            Автоуведомления нет — при необходимости сообщите причину родителю самостоятельно.
          </p>
          <div>
            <label className="label">Причина отклонения (необязательно)</label>
            <textarea
              className="input h-20 resize-none"
              placeholder="Например: номер телефона не найден в базе..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-ghost" onClick={() => setRejectModal(null)}>Отмена</button>
            <button className="btn-danger" onClick={handleReject} disabled={actionLoading}>
              {actionLoading && <Spinner size={14} />}
              Отклонить
            </button>
          </div>
        </div>
      </Modal>

      {/* Credentials after approve */}
      <CredentialsModal
        open={!!credentials}
        onClose={() => setCredentials(null)}
        title="Заявка одобрена"
        login={credentials?.login}
        password={credentials?.rawPassword}
        hint={`Автоотправки нет — передайте логин и пароль родителю (${credentials?.parentName}, ${credentials?.parentPhone}) вручную.`}
      />
    </div>
  )
}
