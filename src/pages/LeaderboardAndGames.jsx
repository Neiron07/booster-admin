import { useEffect, useState } from 'react'
import { Trophy, Gamepad2, RefreshCw, Zap } from 'lucide-react'
import { leaderboardApi, gamesApi } from '../services/api'
import { Spinner, Empty, Badge, toast } from '../components/UI'

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export function Leaderboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await leaderboardApi.get()
      setData(res.data.data)
    } catch { toast.error('Не удалось загрузить лидерборд') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Лидерборд</h1>
          <p className="text-slate-500 text-sm mt-1">Рейтинг по EXP · сбрасывается 1-го числа каждого месяца</p>
        </div>
        <button onClick={load} className="btn-ghost" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Обновить
        </button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Обновление', value: '1-го числа', sub: 'каждого месяца', icon: '📅' },
          { label: 'Показатель', value: 'EXP', sub: 'опыт игрока', icon: '⚡' },
          { label: 'Участников', value: data?.leaderboard?.length ?? '—', sub: 'в рейтинге', icon: '👥' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-600">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-white">Топ игроков</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-brand-500" /></div>
        ) : !data?.leaderboard?.length ? (
          <Empty icon={Trophy} title="Лидерборд пуст" description="Пользователи ещё не набрали EXP" />
        ) : (
          <div className="divide-y divide-surface-border">
            {data.leaderboard.map((player, i) => (
              <div key={player.id} className={`flex items-center gap-4 px-5 py-3 transition-colors ${i < 3 ? 'bg-brand-600/5' : 'hover:bg-surface-hover'}`}>
                {/* Rank */}
                <div className={`w-8 text-center font-bold ${i < 3 ? 'text-lg' : 'text-sm text-slate-500'}`}>
                  {i < 3 ? medals[i] : player.rank}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  i === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                  i === 2 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                  'bg-surface-hover text-slate-400'
                }`}>
                  {player.full_name?.[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{player.full_name}</p>
                  <p className="text-xs text-slate-500">{player.grade} · Ур. {player.level}</p>
                </div>

                {/* EXP */}
                <div className="text-right">
                  <p className="font-bold text-brand-400 font-mono">{player.exp?.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">EXP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Games Page ───────────────────────────────────────────────────────────────
const GAME_EMOJI = {
  maze: '🌀', memory: '🧠', 'math-sprint': '➗', '2048': '🔢', puzzle: '🧩', runner: '🏃',
}

export function Games() {
  const [games, setGames] = useState([])
  const [dailyLimit, setDailyLimit] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await gamesApi.getAll()
      setGames(res.data.data.games)
      setDailyLimit(res.data.data.dailyFoxesLimit)
    } catch { toast.error('Не удалось загрузить мини-игры') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Мини-игры</h1>
          <p className="text-slate-500 text-sm mt-1">{games.length} игр · лимит {dailyLimit ?? 100} FOX в день за все игры вместе</p>
        </div>
        <button onClick={load} className="btn-ghost" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Обновить
        </button>
      </div>

      {/* Limit banner */}
      <div className="bg-fox-500/10 border border-fox-500/20 rounded-xl p-4 flex gap-3">
        <Zap size={18} className="text-fox-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-white font-medium">Система дневного лимита</p>
          <p className="text-slate-400 mt-0.5">
            Суммарно за все мини-игры в день студент может заработать максимум <strong className="text-fox-400">{dailyLimit ?? 100} FOX</strong>.
            EXP при этом начисляется без ограничений. Бэкенд автоматически отслеживает лимит атомарно, без гонок при параллельных запросах.
          </p>
        </div>
      </div>

      {/* Games grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} className="text-brand-500" /></div>
      ) : !games.length ? (
        <Empty icon={Gamepad2} title="Игр нет" description="Активных мини-игр пока не добавлено" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {games.map(game => (
            <div key={game.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{game.icon_url ? <img src={game.icon_url} alt="" className="w-8 h-8 object-contain" /> : (GAME_EMOJI[game.slug] || '🎮')}</div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{game.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{game.description || '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                <div className="flex items-center gap-3">
                  <span className="text-fox-400 font-mono font-bold text-sm">🐾 {game.fox_reward} FOX</span>
                  <span className="text-brand-400 font-mono font-bold text-sm">⚡ {game.exp_reward} EXP</span>
                </div>
                <Badge value={game.is_active ? 'active' : 'blocked'} custom={game.is_active ? 'Активна' : 'Скрыта'} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-white mb-3">📋 Как добавить новую игру</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>1. Добавить запись в таблицу <code className="text-brand-400 bg-surface px-1 rounded">mini_games</code> через SQL или через API</p>
          <p>2. Разработать игру в мобильном приложении (React Native + WebView или нативно)</p>
          <p>3. По завершению игры вызвать <code className="text-brand-400 bg-surface px-1 rounded">POST /api/games/result {'{'} game_id, score {'}'}</code></p>
          <p>4. Бэкенд сам рассчитает FOX и EXP с учётом дневного лимита</p>
        </div>
      </div>
    </div>
  )
}
