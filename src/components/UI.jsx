import { clsx } from 'clsx'
import { Loader2, X, AlertTriangle, CheckCircle, Info, Copy, Check } from 'lucide-react'
import { useState } from 'react'

// ── Spinner ────────────────────────────────────────────────────
export function Spinner({ size = 16, className }) {
  return <Loader2 size={size} className={clsx('animate-spin', className)} />
}

// ── Badge ──────────────────────────────────────────────────────
const badgeVariants = {
  active:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  pending:  'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  blocked:  'bg-red-500/15 text-red-400 border border-red-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
  admin:    'bg-brand-500/15 text-brand-400 border border-brand-500/30',
  student:  'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  teacher:  'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  marketer: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
}

const badgeLabels = {
  active: 'Активен', pending: 'Ожидает', blocked: 'Заблокирован',
  approved: 'Одобрен', rejected: 'Отклонён',
  admin: 'Админ', student: 'Студент', teacher: 'Учитель', marketer: 'Маркетолог',
}

export function Badge({ value, custom }) {
  return (
    <span className={clsx('badge', badgeVariants[value] || 'bg-slate-500/15 text-slate-400')}>
      {custom || badgeLabels[value] || value}
    </span>
  )
}

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg', closeOnBackdrop = true }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeOnBackdrop ? onClose : undefined} />
      <div className={clsx('relative card w-full flex flex-col max-h-[92vh] sm:max-h-[90vh] rounded-b-none sm:rounded-b-xl', width)}>
        <div className="flex items-center justify-between p-5 border-b border-surface-border shrink-0">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Modal ──────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, danger, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <div className="flex gap-3 mb-5">
        <AlertTriangle size={20} className={danger ? 'text-red-400 shrink-0 mt-0.5' : 'text-amber-400 shrink-0 mt-0.5'} />
        <p className="text-sm text-slate-300">{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button className="btn-ghost" onClick={onClose} disabled={loading}>Отмена</button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Spinner size={14} />}
          Подтвердить
        </button>
      </div>
    </Modal>
  )
}

// ── Credentials Display ──────────────────────────────────────────
// Логин/пароль отдаются бэкендом только один раз в ответе — если их не
// показать так, чтобы куратор успел скопировать/переписать, они теряются
// безвозвратно (сбросить можно, но старый пароль узнать уже нельзя).
function CopyField({ label, value, highlight }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(value ?? '').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }
  return (
    <div>
      <p className="label mb-1">{label}</p>
      <div className="flex gap-2">
        <div className={clsx(
          'input font-mono select-all flex-1 truncate',
          highlight && 'text-fox-400 font-bold'
        )}>
          {value}
        </div>
        <button
          type="button"
          onClick={copy}
          title="Скопировать"
          className={clsx('btn-ghost px-3 shrink-0', copied && 'text-emerald-400 border-emerald-600/40')}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

export function CredentialsBlock({ login, password, hint }) {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
        <div className="text-2xl mb-1">✅</div>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="space-y-3">
        <CopyField label="Логин" value={login} />
        <CopyField label="Пароль" value={password} highlight />
      </div>
      <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        ⚠️ Пароль показывается только сейчас и больше нигде не будет виден — скопируйте и передайте его вручную, прежде чем закрыть окно.
      </p>
    </div>
  )
}

export function CredentialsModal({ open, onClose, title, login, password, hint }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm" closeOnBackdrop={false}>
      <div className="space-y-4">
        <CredentialsBlock login={login} password={password} hint={hint} />
        <button className="btn-primary w-full justify-center" onClick={onClose}>Готово, сохранил(а)</button>
      </div>
    </Modal>
  )
}

// ── Toast ──────────────────────────────────────────────────────
let toastFn = null
export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error:   (msg) => toastFn?.('error', msg),
  info:    (msg) => toastFn?.('info', msg),
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  toastFn = (type, message) => {
    const id = Date.now()
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  const icons = { success: CheckCircle, error: AlertTriangle, info: Info }
  const colors = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    error:   'border-red-500/40 bg-red-500/10 text-red-300',
    info:    'border-brand-500/40 bg-brand-500/10 text-brand-300',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type]
        return (
          <div key={t.id} className={clsx('flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-card backdrop-blur-sm', colors[t.type])}>
            <Icon size={16} />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────
export function Empty({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-500" />
      </div>
      <p className="font-semibold text-slate-300 mb-1">{title}</p>
      {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────
// На узких экранах строки таблицы превращаются в карточки: первая колонка
// остаётся "заголовком" карточки, колонки с label — как строки метка/значение,
// колонки без label (обычно actions) — панель действий внизу карточки.
export function Table({ columns, data, loading, empty }) {
  if (loading) return (
    <div className="flex justify-center py-16">
      <Spinner size={28} className="text-brand-500" />
    </div>
  )
  if (!data?.length) return empty || null

  const [firstCol, ...restCols] = columns
  const infoCols = restCols.filter(c => c.label)
  const actionCols = restCols.filter(c => !c.label)

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              {columns.map(c => (
                <th key={c.key} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id || i} className="table-row">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden divide-y divide-surface-border">
        {data.map((row, i) => (
          <div key={row.id || i} className="p-4 space-y-3">
            <div className="text-sm">{firstCol.render ? firstCol.render(row) : row[firstCol.key] ?? '—'}</div>
            {infoCols.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-x-3 gap-y-2">
                {infoCols.map(c => (
                  <div key={c.key} className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-0.5">{c.label}</p>
                    <div className="text-sm text-slate-200 truncate">{c.render ? c.render(row) : row[c.key] ?? '—'}</div>
                  </div>
                ))}
              </div>
            )}
            {actionCols.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {actionCols.map(c => (
                  <div key={c.key}>{c.render ? c.render(row) : null}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ── Pagination ─────────────────────────────────────────────────
// Скользящее окно номеров вокруг текущей страницы + стрелки — раньше
// показывались всегда только страницы 1–7, дальше пойти было невозможно.
function PageButton({ p, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx('w-8 h-8 rounded-lg text-xs font-medium transition-colors shrink-0', active ? 'bg-brand-600 text-white' : 'hover:bg-surface-hover text-slate-400')}
    >
      {p}
    </button>
  )
}

export function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil(total / limit)
  if (pages <= 1) return null

  const WINDOW = 5
  let start = Math.max(1, page - Math.floor(WINDOW / 2))
  let end = Math.min(pages, start + WINDOW - 1)
  start = Math.max(1, end - WINDOW + 1)
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const arrowClass = 'w-8 h-8 rounded-lg text-sm font-medium transition-colors shrink-0 hover:bg-surface-hover text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'

  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 px-4 py-3 border-t border-surface-border text-sm text-slate-400">
      <span>Показано {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} из {total}</span>
      <div className="flex flex-wrap justify-center items-center gap-1">
        <button className={arrowClass} onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
        {start > 1 && (
          <>
            <PageButton p={1} active={false} onClick={() => onChange(1)} />
            {start > 2 && <span className="px-1 text-slate-600">…</span>}
          </>
        )}
        {nums.map(p => (
          <PageButton key={p} p={p} active={p === page} onClick={() => onChange(p)} />
        ))}
        {end < pages && (
          <>
            {end < pages - 1 && <span className="px-1 text-slate-600">…</span>}
            <PageButton p={pages} active={false} onClick={() => onChange(pages)} />
          </>
        )}
        <button className={arrowClass} onClick={() => onChange(page + 1)} disabled={page === pages}>›</button>
      </div>
    </div>
  )
}

// ── Form Field ─────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand:   'text-brand-400 bg-brand-500/10',
    fox:     'text-fox-400 bg-fox-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber:   'text-amber-400 bg-amber-500/10',
    red:     'text-red-400 bg-red-500/10',
  }
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', colors[color])}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
