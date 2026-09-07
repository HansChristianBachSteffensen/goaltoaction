import { useMemo, useState } from 'react'
import { useNav } from '../app/nav'
import {
  actionsForDay,
  areaName,
  eventsForDay,
  focusGoals,
  goalById,
  plannedMinutes,
  unplacedActions,
  useStore,
} from '../model/store'
import type { Action, SuggestedBlock } from '../model/types'
import {
  NOW_MINUTES,
  TODAY,
  WEEK_DAYS,
  dayOfMonth,
  dayShort,
  formatDuration,
  formatTime,
  isPastDay,
  isToday,
  toMinutes,
} from '../model/time'
import { IconCheck, IconPlus, IconX } from '../ui/icons'

const GRID_START = 6 * 60
const GRID_END = 22 * 60
const GRID_SPAN = GRID_END - GRID_START

function pct(min: number): string {
  return `${((min - GRID_START) / GRID_SPAN) * 100}%`
}

function heightPct(from: number, to: number): string {
  return `${((to - from) / GRID_SPAN) * 100}%`
}

export default function WeekView() {
  const { state, dispatch } = useStore()
  const { go } = useNav()
  const focus = focusGoals(state)
  const unplaced = useMemo(() => {
    const inSuggestion = new Set(state.suggestedBlocks.flatMap((b) => b.actionIds))
    return unplacedActions(state).filter((a) => !inSuggestion.has(a.id) && !a.rhythm)
  }, [state])

  return (
    <div className="view view-enter week">
      <header className="week-head">
        <div>
          <h1 className="view-title">This week</h1>
          <p className="view-sub">Monday 7 – Sunday 13 September</p>
        </div>
        <button className="btn btn-ghost" onClick={() => go({ view: 'focus' })}>
          Choose focus
        </button>
      </header>

      <div className="week-body">
        <aside className="week-rail">
          <section className="week-rail-section">
            <span className="k-label">What this week gets</span>
            <div className="week-focus-list">
              {focus.map((g) => {
                const planned = plannedMinutes(state, g.id)
                const intent = (g.hoursPerWeek ?? 0) * 60
                return (
                  <button
                    key={g.id}
                    className="week-focus-goal"
                    onClick={() => go({ view: 'goal', goalId: g.id })}
                  >
                    <span className="week-focus-title">{g.title}</span>
                    <span className="week-focus-meta">
                      {intent
                        ? `${formatDuration(planned)} of ~${g.hoursPerWeek}h placed`
                        : `${formatDuration(planned)} placed`}
                    </span>
                    <span className="meter">
                      <span
                        className="meter-fill"
                        style={{ width: `${Math.min(100, intent ? (planned / intent) * 100 : 100)}%` }}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {state.suggestedBlocks.length > 0 && (
            <section className="week-rail-section">
              <span className="k-label">Suggestions</span>
              {state.suggestedBlocks.map((b) => (
                <SuggestionCard key={b.id} block={b} />
              ))}
            </section>
          )}

          {unplaced.length > 0 && (
            <section className="week-rail-section">
              <span className="k-label">Still to place</span>
              <div className="unplaced-list">
                {unplaced.map((a) => (
                  <UnplacedRow key={a.id} action={a} />
                ))}
              </div>
            </section>
          )}
        </aside>

        <div className="week-grid-wrap">
          <div className="week-grid">
            <div className="grid-hours">
              {[8, 12, 16, 20].map((h) => (
                <span key={h} className="grid-hour" style={{ top: pct(h * 60) }}>
                  {h}:00
                </span>
              ))}
            </div>
            {WEEK_DAYS.map((day) => (
              <DayColumn key={day} day={day} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SuggestionCard({ block }: { block: SuggestedBlock }) {
  const { dispatch } = useStore()
  return (
    <div className="suggestion-card">
      <div className="suggestion-line">
        <span className="suggestion-label">{block.label}</span>
        <span className="suggestion-when">
          {dayShort(block.day)} {formatTime(block.start)} ·{' '}
          {formatDuration(toMinutes(block.end) - toMinutes(block.start))}
        </span>
      </div>
      <p className="suggestion-reason">{block.reason}</p>
      <div className="suggestion-actions">
        <button
          className="btn btn-primary suggestion-accept"
          onClick={() => dispatch({ type: 'accept-block', id: block.id })}
        >
          <IconCheck size={12} /> Add to week
        </button>
        <button
          className="btn btn-quiet"
          onClick={() => dispatch({ type: 'dismiss-block', id: block.id })}
          aria-label="Dismiss suggestion"
        >
          <IconX />
        </button>
      </div>
    </div>
  )
}

function UnplacedRow({ action }: { action: Action }) {
  const { state, dispatch } = useStore()
  const [picking, setPicking] = useState(false)
  const goal = goalById(state, action.goalId)
  return (
    <div className="unplaced-row">
      <button className="unplaced-main" onClick={() => setPicking((p) => !p)}>
        <span className="unplaced-title">{action.title}</span>
        <span className="unplaced-meta">
          {goal ? goal.title : areaName(action.areaId)}
          {action.duration ? ` · ${formatDuration(action.duration)}` : ''}
        </span>
      </button>
      {picking ? (
        <div className="day-picker">
          {WEEK_DAYS.filter((d) => !isPastDay(d)).map((d) => (
            <button
              key={d}
              className="day-pick"
              onClick={() => {
                dispatch({ type: 'schedule', id: action.id, day: d })
                setPicking(false)
              }}
            >
              {dayShort(d)}
            </button>
          ))}
        </div>
      ) : (
        <span className="unplaced-add">
          <IconPlus size={13} />
        </span>
      )}
    </div>
  )
}

function DayColumn({ day }: { day: string }) {
  const { state, dispatch } = useStore()
  const { go } = useNav()
  const events = eventsForDay(state, day)
  const actions = actionsForDay(state, day)
  const timed = actions.filter((a) => a.time)
  const untimed = actions.filter((a) => !a.time)
  const suggestions = state.suggestedBlocks.filter((b) => b.day === day)
  const past = isPastDay(day)
  const today = isToday(day)

  return (
    <div className={`day-col ${past ? 'day-past' : ''} ${today ? 'day-today' : ''}`}>
      <button
        className="day-col-head"
        onClick={() => (today ? go({ view: 'today' }) : undefined)}
      >
        <span className="day-col-name">{dayShort(day)}</span>
        <span className="day-col-date">{dayOfMonth(day)}</span>
      </button>
      <div className="day-col-chips">
        {untimed.map((a) => (
          <button
            key={a.id}
            className={`day-chip ${a.status === 'done' ? 'day-chip-done' : ''}`}
            onClick={() => dispatch({ type: 'toggle-done', id: a.id })}
            title={a.status === 'done' ? 'Done — click to undo' : 'Click to complete'}
          >
            {a.status === 'done' && <IconCheck size={10} />}
            {a.title}
          </button>
        ))}
      </div>
      <div className="day-col-grid">
        {[8, 10, 12, 14, 16, 18, 20].map((h) => (
          <span key={h} className="grid-line" style={{ top: pct(h * 60) }} />
        ))}
        {today && <span className="now-line" style={{ top: pct(NOW_MINUTES) }} />}
        {events.map((e) => {
          const s = toMinutes(e.start)
          const end = toMinutes(e.end)
          return (
            <div
              key={e.id}
              className={`block block-${e.kind}`}
              style={{ top: pct(s), height: heightPct(s, end) }}
            >
              <span className="block-title">{e.title}</span>
              {end - s >= 60 && <span className="block-time">{formatTime(e.start)}</span>}
            </div>
          )
        })}
        {timed.map((a) => {
          const s = toMinutes(a.time!)
          const end = s + (a.duration ?? 30)
          const g = goalById(state, a.goalId)
          const inFocus = g?.focus
          return (
            <button
              key={a.id}
              className={`block block-action ${inFocus ? 'block-focus' : ''} ${a.status === 'done' ? 'block-done' : ''}`}
              style={{ top: pct(s), height: heightPct(s, Math.max(end, s + 25)) }}
              onClick={() => (g ? go({ view: 'goal', goalId: g.id }) : undefined)}
              title={g ? `${a.title} — ${g.title}` : a.title}
            >
              <span className="block-title">{a.title}</span>
              {end - s >= 60 && <span className="block-time">{formatTime(a.time!)}</span>}
            </button>
          )
        })}
        {suggestions.map((b) => {
          const s = toMinutes(b.start)
          const end = toMinutes(b.end)
          return (
            <button
              key={b.id}
              className="block block-suggested"
              style={{ top: pct(s), height: heightPct(s, Math.max(end, s + 25)) }}
              onClick={() => dispatch({ type: 'accept-block', id: b.id })}
              title={`${b.reason} — click to add`}
            >
              <span className="block-title">{b.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
