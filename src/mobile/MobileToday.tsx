import { useMemo } from 'react'
import { useNav } from '../app/nav'
import {
  actionsForDay,
  eventsForDay,
  goalById,
  inboxItems,
  openMinutesToday,
  useStore,
} from '../model/store'
import type { Action, CalendarEvent } from '../model/types'
import { NOW_MINUTES, TODAY, formatDuration, formatTime, toMinutes } from '../model/time'
import { CheckButton } from '../ui/bits'
import { IconArrowRight, IconChevronRight, IconRepeat } from '../ui/icons'

export default function MobileToday() {
  const { state, dispatch } = useStore()
  const { go } = useNav()

  const actions = actionsForDay(state, TODAY)
  const events = eventsForDay(state, TODAY)
  const meetings = events.filter((e) => e.kind === 'meeting')
  const openMin = openMinutesToday(state)
  const inbox = inboxItems(state)

  const matters = actions.filter((a) => {
    const g = goalById(state, a.goalId)
    return g?.focus && a.status !== 'done' && (a.duration ?? 30) >= 30
  })
  const hero = matters[0]
  const heroGoal = goalById(state, hero?.goalId)
  const mattersIds = new Set(matters.map((a) => a.id))

  const rest = useMemo(() => {
    const items: Array<{ at: number; kind: 'event' | 'action'; event?: CalendarEvent; action?: Action }> = []
    for (const e of events) items.push({ at: toMinutes(e.start), kind: 'event', event: e })
    for (const a of actions) {
      if (mattersIds.has(a.id)) continue
      items.push({ at: a.time ? toMinutes(a.time) : 24 * 60, kind: 'action', action: a })
    }
    return items.sort((x, y) => x.at - y.at)
  }, [events, actions, state])

  const rhythms = state.actions.filter(
    (a) => a.rhythm && !a.day && a.status === 'open' && a.rhythm.includes('evening'),
  )

  const openLabel =
    openMin >= 60 ? `${Math.round((openMin / 60) * 2) / 2}h open`.replace('.5', '½') : `${openMin} min open`

  return (
    <div className="m-view view-enter">
      <header className="m-day-head">
        <h1 className="m-day-title">Tuesday</h1>
        <p className="m-day-meta">
          8 September · {meetings.length} meetings · {openLabel}
        </p>
      </header>

      {inbox.length > 0 && (
        <button className="m-inbox-pill" onClick={() => go({ view: 'inbox' })}>
          <span>
            {inbox.length} captured · sort {inbox.length === 1 ? 'it' : 'them'} when you’re ready
          </span>
          <IconChevronRight />
        </button>
      )}

      {hero && heroGoal && (
        <section className="m-matters">
          <span className="k-label m-matters-label">What matters today</span>
          <div
            className="m-hero"
            style={
              heroGoal.image
                ? {
                    backgroundImage: `linear-gradient(180deg, rgba(16,14,12,0.5), rgba(16,14,12,0.9) 70%), url(${heroGoal.image})`,
                  }
                : undefined
            }
            onClick={() => go({ view: 'goal', goalId: heroGoal.id })}
            role="button"
          >
            <div className="m-hero-check">
              <CheckButton
                done={false}
                size={26}
                onToggle={() => dispatch({ type: 'toggle-done', id: hero.id })}
              />
            </div>
            <p className="m-hero-time">
              {hero.time ? formatTime(hero.time) : 'Anytime'}
              {hero.duration ? ` · ${formatDuration(hero.duration)}` : ''}
            </p>
            <h2 className="m-hero-title">{hero.title}</h2>
            {heroGoal.why && <p className="m-hero-why why-line">{heroGoal.why}</p>}
          </div>

          {matters.slice(1).map((a) => {
            const g = goalById(state, a.goalId)!
            return (
              <div key={a.id} className="m-matters-row">
                <CheckButton
                  done={false}
                  size={24}
                  onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                />
                <div className="m-matters-row-text">
                  <span className="m-row-title">
                    {a.time ? `${formatTime(a.time)} · ` : ''}
                    {a.title}
                  </span>
                  {g.why && <span className="m-matters-row-why why-line">{g.why}</span>}
                </div>
              </div>
            )
          })}
        </section>
      )}

      <section className="m-list">
        <span className="k-label">Today</span>
        <div className="m-rows">
          {rest.map((item) =>
            item.kind === 'event' ? (
              <MEventRow key={item.event!.id} event={item.event!} />
            ) : (
              <MActionRow
                key={item.action!.id}
                action={item.action!}
                onToggle={() => dispatch({ type: 'toggle-done', id: item.action!.id })}
              />
            ),
          )}
        </div>
      </section>

      {rhythms.length > 0 && (
        <section className="m-list">
          <span className="k-label">This evening</span>
          {rhythms.map((a) => (
            <div key={a.id} className="rhythm-chip m-rhythm">
              <IconRepeat />
              <span>{a.title}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function MEventRow({ event }: { event: CalendarEvent }) {
  const past = toMinutes(event.end) < NOW_MINUTES
  return (
    <div className={`m-row m-event ${past ? 'm-past' : ''}`}>
      <span className="m-row-spacer" />
      <div className="m-row-text">
        <span className="m-row-title">{event.title}</span>
      </div>
      <span className="m-row-time">{formatTime(event.start)}</span>
    </div>
  )
}

export function MActionRow({
  action,
  onToggle,
  when,
}: {
  action: Action
  onToggle: () => void
  when?: string
}) {
  const done = action.status === 'done'
  return (
    <div className={`m-row ${done ? 'm-done' : ''}`}>
      <CheckButton done={done} size={24} onToggle={onToggle} />
      <div className="m-row-text">
        <span className={`m-row-title ${done ? 'strike' : ''}`}>{action.title}</span>
        {action.note && <span className="m-row-note">{action.note}</span>}
      </div>
      <span className="m-row-time">
        {when ?? (action.time ? formatTime(action.time) : action.duration ? formatDuration(action.duration) : '')}
      </span>
    </div>
  )
}
