import { useNav } from '../app/nav'
import {
  actionsForDay,
  eventsForDay,
  focusGoals,
  plannedMinutes,
  useStore,
} from '../model/store'
import {
  TODAY,
  WEEK_DAYS,
  dayName,
  dayOfMonth,
  dayShort,
  formatDuration,
  formatTime,
  isPastDay,
  isToday,
  toMinutes,
} from '../model/time'
import { MActionRow } from './MobileToday'
import { IconCheck, IconX } from '../ui/icons'

export default function MobileWeek() {
  const { state, dispatch } = useStore()
  const { go } = useNav()

  return (
    <div className="m-view view-enter">
      <header className="m-day-head">
        <h1 className="m-day-title">This week</h1>
        <p className="m-day-meta">Mon 7 – Sun 13 September</p>
      </header>

      <section className="m-week-focus">
        <span className="k-label">What this week gets</span>
        {focusGoals(state).map((g) => {
          const planned = plannedMinutes(state, g.id)
          const intent = (g.hoursPerWeek ?? 0) * 60
          return (
            <button
              key={g.id}
              className="m-week-goal"
              onClick={() => go({ view: 'goal', goalId: g.id })}
            >
              <span className="m-week-goal-line">
                <span className="m-week-goal-title">{g.title}</span>
                <span className="m-week-goal-meta">
                  {formatDuration(planned)} / ~{g.hoursPerWeek}h
                </span>
              </span>
              <span className="meter">
                <span
                  className="meter-fill"
                  style={{ width: `${Math.min(100, intent ? (planned / intent) * 100 : 0)}%` }}
                />
              </span>
            </button>
          )
        })}
      </section>

      {state.suggestedBlocks.length > 0 && (
        <section className="m-list">
          <span className="k-label">Suggestions</span>
          {state.suggestedBlocks.map((b) => (
            <div key={b.id} className="suggestion-card">
              <div className="suggestion-line">
                <span className="suggestion-label">{b.label}</span>
                <span className="suggestion-when">
                  {dayShort(b.day)} {formatTime(b.start)} ·{' '}
                  {formatDuration(toMinutes(b.end) - toMinutes(b.start))}
                </span>
              </div>
              <p className="suggestion-reason">{b.reason}</p>
              <div className="suggestion-actions">
                <button
                  className="btn btn-primary suggestion-accept"
                  onClick={() => dispatch({ type: 'accept-block', id: b.id })}
                >
                  <IconCheck size={12} /> Add to week
                </button>
                <button
                  className="btn btn-quiet"
                  onClick={() => dispatch({ type: 'dismiss-block', id: b.id })}
                  aria-label="Dismiss"
                >
                  <IconX />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="m-week-days">
        {WEEK_DAYS.map((day) => (
          <DaySection key={day} day={day} />
        ))}
      </section>
    </div>
  )
}

function DaySection({ day }: { day: string }) {
  const { state, dispatch } = useStore()
  const events = eventsForDay(state, day)
  const actions = actionsForDay(state, day)
  const past = isPastDay(day)
  const today = isToday(day)

  if (past) {
    const doneCount = actions.filter((a) => a.status === 'done').length
    return (
      <div className="m-day m-day-past">
        <div className="m-day-header">
          <span className="m-day-name">{dayName(day)}</span>
          <span className="m-day-summary">
            {doneCount > 0 ? `${doneCount} done` : 'passed'}
          </span>
        </div>
      </div>
    )
  }

  const merged: Array<{ at: number; kind: 'event' | 'action'; id: string }> = [
    ...events.map((e) => ({ at: toMinutes(e.start), kind: 'event' as const, id: e.id })),
    ...actions.map((a) => ({
      at: a.time ? toMinutes(a.time) : 24 * 60,
      kind: 'action' as const,
      id: a.id,
    })),
  ].sort((x, y) => x.at - y.at)

  return (
    <div className={`m-day ${today ? 'm-day-today' : ''}`}>
      <div className="m-day-header">
        <span className="m-day-name">
          {today ? 'Today' : dayName(day)}
        </span>
        <span className="m-day-date">{dayOfMonth(day)} September</span>
      </div>
      {merged.length === 0 ? (
        <p className="m-day-empty">Nothing planned. Good.</p>
      ) : (
        <div className="m-rows">
          {merged.map((item) => {
            if (item.kind === 'event') {
              const e = events.find((x) => x.id === item.id)!
              return (
                <div key={e.id} className="m-row m-event">
                  <span className="m-row-spacer" />
                  <div className="m-row-text">
                    <span className="m-row-title">{e.title}</span>
                  </div>
                  <span className="m-row-time">{formatTime(e.start)}</span>
                </div>
              )
            }
            const a = actions.find((x) => x.id === item.id)!
            return (
              <MActionRow
                key={a.id}
                action={a}
                onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
