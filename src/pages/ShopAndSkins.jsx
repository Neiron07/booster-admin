// ─── Shop Page ────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { ShoppingBag, Plus, Edit2, Trash2 } from 'lucide-react'
import { shopApi, skinsApi } from '../services/api'
import { Table, Modal, Confirm, Empty, Spinner, Field, Badge, toast } from '../components/UI'

function ShopItemForm({ item, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    image_url: item?.image_url || '',
    price_foxes: item?.price_foxes || '',
    whatsapp_link: item?.whatsapp_link || '',
    category: item?.category || '',
    is_active: item?.is_active ?? true,
    sort_order: item?.sort_order || 0,
  })
  const [loading, setLoading] = useState(false)
  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      const payload = { ...form, price_foxes: parseInt(form.price_foxes) }
      if (item?.id) {
        await shopApi.updateItem(item.id, payload)
        toast.success('Товар обновлён')
      } else {
        await shopApi.createItem(payload)
        toast.success('Товар добавлен')
      }
      onSaved?.()
      onClose?.()
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Название">
          <input className="input" placeholder="iPhone 15 Pro"
            value={form.name} onChange={e => f('name')(e.target.value)} />
        </Field>
        <Field label="Цена (FOX)">
          <input className="input" type="number" min="1" placeholder="80000"
            value={form.price_foxes} onChange={e => f('price_foxes')(e.target.value)} />
        </Field>
      </div>
      <Field label="Описание">
        <textarea className="input h-16 resize-none" placeholder="Краткое описание товара..."
          value={form.description} onChange={e => f('description')(e.target.value)} />
      </Field>
      <Field label="URL картинки">
        <input className="input" placeholder="https://..."
          value={form.image_url} onChange={e => f('image_url')(e.target.value)} />
      </Field>
      {form.image_url && (
        <img src={form.image_url} alt="" className="w-20 h-20 object-contain rounded-lg border border-surface-border bg-surface" />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Категория">
          <input className="input" placeholder="Техника, Подписки..."
            value={form.category} onChange={e => f('category')(e.target.value)} />
        </Field>
        <Field label="WhatsApp ссылка">
          <input className="input" placeholder="https://wa.me/77..."
            value={form.whatsapp_link} onChange={e => f('whatsapp_link')(e.target.value)} />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-brand-500"
            checked={form.is_active} onChange={e => f('is_active')(e.target.checked)} />
          <span className="text-sm text-slate-300">Активен (виден пользователям)</span>
        </label>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button className="btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn-primary" onClick={submit}
          disabled={loading || !form.name || !form.price_foxes}>
          {loading ? <Spinner size={14} /> : <Plus size={14} />}
          {item?.id ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </div>
  )
}

export function Shop() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | item
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await shopApi.getItems()
      setItems(res.data.data)
    } catch { toast.error('Не удалось загрузить товары') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleteLoading(true)
    try {
      await shopApi.deleteItem(deleteConfirm.id)
      toast.success('Товар удалён')
      setDeleteConfirm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка удаления')
    } finally { setDeleteLoading(false) }
  }

  const columns = [
    { key: 'name', label: 'Товар', render: r => (
      <div className="flex items-center gap-3">
        {r.image_url
          ? <img src={r.image_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-surface border border-surface-border" />
          : <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center text-xl">📦</div>
        }
        <div>
          <p className="font-medium text-white">{r.name}</p>
          <p className="text-xs text-slate-500">{r.category || 'Без категории'}</p>
        </div>
      </div>
    )},
    { key: 'price_foxes', label: 'Цена', render: r => (
      <span className="font-mono text-fox-400 font-bold">{r.price_foxes?.toLocaleString()} FOX</span>
    )},
    { key: 'whatsapp_link', label: 'WhatsApp', render: r => (
      r.whatsapp_link
        ? <a href={r.whatsapp_link} target="_blank" className="text-xs text-emerald-400 hover:underline">Ссылка →</a>
        : <span className="text-slate-600 text-xs">Не указана</span>
    )},
    { key: 'is_active', label: 'Статус', render: r => (
      <Badge value={r.is_active ? 'active' : 'blocked'} custom={r.is_active ? 'Активен' : 'Скрыт'} />
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-1.5">
        <button className="btn-ghost text-xs px-2 py-1" onClick={() => setModal(r)}>
          <Edit2 size={13} /> Изменить
        </button>
        <button className="btn-danger text-xs px-2 py-1" onClick={() => setDeleteConfirm(r)}>
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Магазин</h1>
          <p className="text-slate-500 text-sm mt-1">Товары за Фоксы · {items.length} позиций</p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={() => setModal('create')}>
          <Plus size={15} /> Добавить товар
        </button>
      </div>

      <div className="card">
        <Table columns={columns} data={items} loading={loading}
          empty={<Empty icon={ShoppingBag} title="Товаров нет" description="Добавьте первый товар в магазин"
            action={<button className="btn-primary" onClick={() => setModal('create')}><Plus size={14} />Добавить</button>} />}
        />
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Новый товар' : 'Редактировать товар'} width="max-w-xl">
        <ShopItemForm
          item={modal !== 'create' ? modal : null}
          onSaved={load}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Confirm
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Удалить товар"
        message={`Удалить товар "${deleteConfirm?.name}" из магазина? Если по нему уже есть заявки — бэкенд откажет и подскажет вместо этого скрыть товар (снять «Активен» в редактировании).`}
        danger
        loading={deleteLoading}
      />
    </div>
  )
}

// ─── Skins (Outfits) Page ───────────────────────────────────────────────────────
// Образ — цельный костюм без категорий/слотов; у пользователя надет максимум один образ.
function SkinForm({ skin, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: skin?.name || '',
    description: skin?.description || '',
    image_url: skin?.image_url || '',
    price_foxes: skin?.price_foxes || '',
    level_req: skin?.level_req || 1,
    exp_bonus: skin?.exp_bonus || 0,
    is_active: skin?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      const payload = { ...form, price_foxes: parseInt(form.price_foxes), level_req: parseInt(form.level_req), exp_bonus: parseInt(form.exp_bonus) || 0 }
      if (skin?.id) {
        await skinsApi.update(skin.id, payload)
        toast.success('Образ обновлён')
      } else {
        await skinsApi.create(payload)
        toast.success('Образ добавлен')
      }
      onSaved?.()
      onClose?.()
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <Field label="Название">
        <input className="input" placeholder="Образ 3"
          value={form.name} onChange={e => f('name')(e.target.value)} />
      </Field>
      <Field label="Описание">
        <textarea className="input h-16 resize-none" placeholder="Краткое описание образа..."
          value={form.description} onChange={e => f('description')(e.target.value)} />
      </Field>
      <Field label="URL картинки">
        <input className="input" placeholder="https://..."
          value={form.image_url} onChange={e => f('image_url')(e.target.value)} />
      </Field>
      {form.image_url && (
        <div className="flex items-center gap-3">
          <img src={form.image_url} alt="" className="w-16 h-16 object-contain rounded-lg border border-surface-border bg-surface" />
          <p className="text-xs text-slate-500">Превью образа</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Цена (FOX)">
          <input className="input" type="number" min="0" placeholder="500"
            value={form.price_foxes} onChange={e => f('price_foxes')(e.target.value)} />
        </Field>
        <Field label="Требуемый уровень">
          <input className="input" type="number" min="1" max="50" placeholder="1"
            value={form.level_req} onChange={e => f('level_req')(e.target.value)} />
        </Field>
        <Field label="EXP-бонус за покупку">
          <input className="input" type="number" min="0" placeholder="0"
            value={form.exp_bonus} onChange={e => f('exp_bonus')(e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-brand-500"
          checked={form.is_active} onChange={e => f('is_active')(e.target.checked)} />
        <span className="text-sm text-slate-300">Активен (виден в гардеробе)</span>
      </label>
      <div className="flex gap-2 justify-end pt-2">
        <button className="btn-ghost" onClick={onClose}>Отмена</button>
        <button className="btn-primary" onClick={submit}
          disabled={loading || !form.name || !form.price_foxes}>
          {loading ? <Spinner size={14} /> : <Plus size={14} />}
          {skin?.id ? 'Сохранить' : 'Добавить образ'}
        </button>
      </div>
    </div>
  )
}

export function Skins() {
  const [skins, setSkins] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await skinsApi.getAll()
      setSkins(res.data.data)
    } catch { toast.error('Не удалось загрузить образы') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const columns = [
    { key: 'name', label: 'Образ', render: r => (
      <div className="flex items-center gap-3">
        {r.image_url
          ? <img src={r.image_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-surface border border-surface-border" />
          : <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center text-xl">👕</div>
        }
        <div>
          <p className="font-medium text-white">{r.name}</p>
          <p className="text-xs text-slate-500">{r.description || '—'}</p>
        </div>
      </div>
    )},
    { key: 'price_foxes', label: 'Цена', render: r => (
      <span className="font-mono text-fox-400 font-bold">{r.price_foxes?.toLocaleString()} FOX</span>
    )},
    { key: 'level_req', label: 'Мин. уровень', render: r => (
      r.level_req > 1
        ? <Badge value="pending" custom={`Ур. ${r.level_req}+`} />
        : <span className="text-slate-500 text-xs">Любой</span>
    )},
    { key: 'exp_bonus', label: 'EXP-бонус', render: r => (
      r.exp_bonus > 0
        ? <span className="font-mono text-brand-400 font-medium">+{r.exp_bonus}</span>
        : <span className="text-slate-600 text-xs">—</span>
    )},
    { key: 'is_active', label: 'Статус', render: r => (
      <Badge value={r.is_active ? 'active' : 'blocked'} custom={r.is_active ? 'Активен' : 'Скрыт'} />
    )},
    { key: 'actions', label: '', render: r => (
      <button className="btn-ghost text-xs px-2 py-1" onClick={() => setModal(r)}>
        <Edit2 size={13} /> Изменить
      </button>
    )},
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Образы / Гардероб</h1>
          <p className="text-slate-500 text-sm mt-1">
            {skins.length} образов · у пользователя надет максимум один образ одновременно
          </p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={() => setModal('create')}>
          <Plus size={15} /> Добавить образ
        </button>
      </div>

      <div className="card">
        <Table columns={columns} data={skins} loading={loading}
          empty={<Empty icon={Plus} title="Образов нет" description="Добавьте первый образ в гардероб"
            action={<button className="btn-primary" onClick={() => setModal('create')}><Plus size={14} />Добавить</button>} />}
        />
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Новый образ' : 'Редактировать образ'} width="max-w-lg">
        <SkinForm
          skin={modal !== 'create' ? modal : null}
          onSaved={load}
          onClose={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
