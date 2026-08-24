import { useEffect, useState } from 'react'
import { BookOpen, Plus, Calendar, CheckCircle, Edit2, Trash2 } from 'lucide-react'
import { quizApi } from '../services/api'
import { Table, Modal, Confirm, Empty, Spinner, Field, Badge, toast } from '../components/UI'
import { format } from 'date-fns'

function QuestionForm({ question, onSaved, onClose }) {
  const [form, setForm] = useState({
    question: question?.question || '',
    option_a: question?.option_a || '',
    option_b: question?.option_b || '',
    option_c: question?.option_c || '',
    option_d: question?.option_d || '',
    correct: question?.correct || 'a',
    category: question?.category || '',
    difficulty: question?.difficulty || 'medium',
    is_active: question?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      if (question?.id) {
        await quizApi.update(question.id, form)
        toast.success('Вопрос обновлён')
      } else {
        const { is_active, ...createForm } = form
        await quizApi.create(createForm)
        toast.success('Вопрос добавлен')
      }
      onSaved?.()
      onClose?.()
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  const options = [
    { key: 'option_a', label: 'Вариант A' },
    { key: 'option_b', label: 'Вариант B' },
    { key: 'option_c', label: 'Вариант C' },
    { key: 'option_d', label: 'Вариант D' },
  ]

  return (
    <div className="space-y-4">
      <Field label="Вопрос">
        <textarea className="input h-20 resize-none" placeholder="Текст вопроса..."
          value={form.question} onChange={e => f('question')(e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(o => (
          <div key={o.key}>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="label mb-0">{o.label}</label>
              <button
                onClick={() => f('correct')(o.key.slice(-1))}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                  form.correct === o.key.slice(-1)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-surface-hover text-slate-500 hover:text-slate-300'
                }`}
              >
                {form.correct === o.key.slice(-1) ? '✓ Верный' : 'Выбрать'}
              </button>
            </div>
            <input className="input" placeholder={`Текст варианта ${o.key.slice(-1).toUpperCase()}...`}
              value={form[o.key]} onChange={e => f(o.key)(e.target.value)} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Категория">
          <input className="input" placeholder="IT, История, Математика..."
            value={form.category} onChange={e => f('category')(e.target.value)} />
        </Field>
        <Field label="Сложность">
          <select className="input" value={form.difficulty} onChange={e => f('difficulty')(e.target.value)}>
            <option value="easy">Лёгкий</option>
            <option value="medium">Средний</option>
            <option value="hard">Сложный</option>
          </select>
        </Field>
      </div>

      {question?.id && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-brand-500"
            checked={form.is_active} onChange={e => f('is_active')(e.target.checked)} />
          <span className="text-sm text-slate-300">Активен (виден студентам и доступен для планирования)</span>
        </label>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button className="btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn-primary" onClick={submit}
          disabled={loading || !form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d}>
          {loading ? <Spinner size={14} /> : <Plus size={14} />}
          {question?.id ? 'Сохранить' : 'Добавить вопрос'}
        </button>
      </div>
    </div>
  )
}

function ScheduleModal({ questions, open, initialQuestionId, onClose, onScheduled }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const MAX_QUESTIONS = 5

  useEffect(() => {
    if (open) setSelectedIds(initialQuestionId ? [initialQuestionId] : [])
  }, [open, initialQuestionId])

  const toggleQuestion = (id) => {
    setSelectedIds(ids => {
      if (ids.includes(id)) return ids.filter(x => x !== id)
      if (ids.length >= MAX_QUESTIONS) return ids
      return [...ids, id]
    })
  }

  const submit = async () => {
    if (!selectedIds.length || !date) return
    setLoading(true)
    try {
      await quizApi.schedule(date, selectedIds)
      toast.success(`Квиз запланирован на ${date} (${selectedIds.length} вопрос(ов))`)
      onScheduled?.()
      onClose?.()
      setSelectedIds([])
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Запланировать квиз" width="max-w-xl">
      <div className="space-y-4">
        <Field label="Дата">
          <input className="input" type="date" value={date}
            onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </Field>
        <Field label={`Вопросы (до ${MAX_QUESTIONS}, порядок выбора = порядок показа)`}>
          <div className="max-h-64 overflow-y-auto space-y-1.5 border border-surface-border rounded-lg p-2">
            {questions.map(q => {
              const pos = selectedIds.indexOf(q.id)
              const checked = pos !== -1
              return (
                <label key={q.id}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-brand-600/15 border border-brand-500/30' : 'hover:bg-surface-hover border border-transparent'}`}>
                  <input type="checkbox" className="w-4 h-4 accent-brand-500" checked={checked}
                    disabled={!checked && selectedIds.length >= MAX_QUESTIONS}
                    onChange={() => toggleQuestion(q.id)} />
                  {checked && <span className="text-xs font-bold text-brand-400 w-4 shrink-0">{pos + 1}</span>}
                  <span className="text-sm text-slate-300 truncate">
                    [{q.category || 'Без категории'}] {q.question}
                  </span>
                </label>
              )
            })}
          </div>
        </Field>
        <div className="bg-surface rounded-lg p-3 text-xs text-slate-400">
          💡 Если не запланировать — система автоматически выберет случайный вопрос в 08:00. Повторный вызов на ту же дату полностью заменяет ранее запланированные вопросы.
        </div>
        <div className="flex gap-2 justify-end">
          <button className="btn-ghost" onClick={onClose}>Отмена</button>
          <button className="btn-primary" onClick={submit} disabled={loading || !selectedIds.length || !date}>
            {loading ? <Spinner size={14} /> : <Calendar size={14} />}
            Запланировать ({selectedIds.length})
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState(null) // null | 'create' | question
  const [scheduleModal, setScheduleModal] = useState(null) // null | true | question (preselects that question)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await quizApi.getQuestions()
      setQuestions(res.data.data)
    } catch { toast.error('Не удалось загрузить вопросы') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      await quizApi.delete(deleteConfirm.id)
      toast.success('Вопрос удалён')
      setDeleteConfirm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка удаления')
    } finally { setDeleteLoading(false) }
  }

  const diffLabels = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' }

  const columns = [
    { key: 'question', label: 'Вопрос', render: r => (
      <p className="max-w-xs text-sm text-white truncate" title={r.question}>{r.question}</p>
    )},
    { key: 'category', label: 'Категория', render: r => (
      r.category ? <Badge value="student" custom={r.category} /> : <span className="text-slate-600">—</span>
    )},
    { key: 'correct', label: 'Ответ', render: r => (
      <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono uppercase">
        {r.correct}
      </span>
    )},
    { key: 'difficulty', label: 'Сложность', render: r => (
      <Badge value={r.difficulty === 'easy' ? 'approved' : r.difficulty === 'hard' ? 'rejected' : 'pending'}
        custom={diffLabels[r.difficulty] || r.difficulty} />
    )},
    { key: 'created_at', label: 'Добавлен', render: r => (
      <span className="text-xs text-slate-500">{format(new Date(r.created_at), 'dd.MM.yyyy')}</span>
    )},
    { key: 'is_active', label: 'Статус', render: r => (
      <Badge value={r.is_active ? 'active' : 'blocked'} custom={r.is_active ? 'Активен' : 'Скрыт'} />
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-1.5">
        {r.is_active !== false && (
          <button className="btn-ghost text-xs px-2 py-1"
            onClick={() => setScheduleModal(r)} title="Запланировать этот вопрос">
            <Calendar size={13} />
          </button>
        )}
        <button className="btn-ghost text-xs px-2 py-1"
          onClick={() => setFormModal(r)} title="Редактировать">
          <Edit2 size={13} />
        </button>
        <button className="btn-danger text-xs px-2 py-1"
          onClick={() => setDeleteConfirm(r)} title="Удалить">
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Quiz</h1>
          <p className="text-slate-500 text-sm mt-1">
            {questions.length} вопросов в базе · до 5 вопросов в день · до 100 FOX / 250 EXP суммарно
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost flex-1 sm:flex-none justify-center" onClick={() => setScheduleModal(true)}>
            <Calendar size={15} /> Запланировать квиз
          </button>
          <button className="btn-primary flex-1 sm:flex-none justify-center" onClick={() => setFormModal('create')}>
            <Plus size={15} /> Добавить вопрос
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-brand-600/10 border border-brand-600/30 rounded-xl p-4 flex gap-3">
        <CheckCircle size={18} className="text-brand-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-white font-medium">Как работает Daily Quiz</p>
          <p className="text-slate-400 mt-0.5">
            Каждый день студенты видят до 5 вопросов, каждый даёт награду независимо: верный ответ = 20 FOX + 50 EXP,
            неверный = 0 FOX + 10 EXP (за участие). Система автоматически выбирает вопрос в 08:00, если не запланировать вручную.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-white">Все вопросы</h2>
          <span className="text-xs text-slate-500">{questions.length} шт.</span>
        </div>
        <Table columns={columns} data={questions} loading={loading}
          empty={<Empty icon={BookOpen} title="Вопросов нет" description="Добавьте первый вопрос для квиза"
            action={<button className="btn-primary" onClick={() => setFormModal('create')}><Plus size={14} />Добавить</button>} />}
        />
      </div>

      <Modal open={!!formModal} onClose={() => setFormModal(null)}
        title={formModal === 'create' ? 'Новый вопрос' : 'Редактировать вопрос'} width="max-w-2xl">
        <QuestionForm
          question={formModal !== 'create' ? formModal : null}
          onSaved={load}
          onClose={() => setFormModal(null)}
        />
      </Modal>

      <ScheduleModal
        questions={questions.filter(q => q.is_active !== false)}
        open={!!scheduleModal}
        initialQuestionId={scheduleModal && scheduleModal !== true ? scheduleModal.id : null}
        onClose={() => setScheduleModal(null)}
        onScheduled={load}
      />

      <Confirm
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Удалить вопрос"
        message={`Удалить вопрос "${deleteConfirm?.question}"? Если по нему уже есть ответы учеников или он стоит в расписании — бэкенд откажет и подскажет вместо этого скрыть его (снять «Активен» в редактировании).`}
        danger
        loading={deleteLoading}
      />
    </div>
  )
}
