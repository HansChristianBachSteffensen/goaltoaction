import { useMemo } from 'react'
import { useNav } from '../app/nav'
import {
  actionsForDay,
  areaName,
  eventsForDay,
  focusGoals,
  goalById,
  inboxItems,
  openMinutesToday,
  plannedMinutes,
  useStore,
} from '../model/store'
import type { Action, CalendarEvent } from '../model/types'
import { TODAY, formatDuration, formatTime, toMinutes, NOW_MINUTES } from '../model/time'
import { CheckButton } from '../ui/bits'
import { IconArrowRight, IconRepeat } from '../ui/icons'

export default function TodayView() {
  const { state, dispatch } = useStore()
  const { go } = useNav()

  const actions = actionsForDay(state, TODAY)
  const events = eventsForDay(state, TODAY)
  const meetings = events.filter((e) => e.kind === 'meeting')
  const openMin = openMinutesToday(state)

  /* Focus-goal actions with real weight are the day's meaningful
     commitments; small errands stay in the ordinary list. */
  const matters = actions.filter((a) => {
    const g = goalById(state, a.goalId)
    return g?.focus && a.status !== 'done' && (a.duration ?? 30) >= 30
  })
  const mattersDone = actions.filter(
    (a) => goalById(state, a.goalId)?.focus && a.status === 'done' && (a.duration ?? 30) >= 30,
  )
  const hero = matters[0]
  const heroGoal = goalById(state, hero?.goalId)

  /* Everything else today, in time order: meetings and remaining actions. */
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

  const allDone =
    actions.filter((a) => a.status === 'open').length === 0 && matters.length === 0

  const openHours =
    openMin >= 60 ? `${Math.round((openMin / 60) * 2) / 2}h open`.replace('.5', '½') : `${openMin} min open`

  return (
    <div className="view view-enter today">
      <div className="today-cols">
        <div className="today-main">
          <header className="day-head">
            <h1 className="day-title">Tuesday</h1>
            <p className="day-meta">
              8 September · {meetings.length} meetings · {openHours}
            </p>
          </header>

          {hero && heroGoal ? (
            <section className="matters">
              <span className="k-label">What matters today</span>
              <div
                className="hero-card"
                style={
                  heroGoal.image
                    ? { backgroundImage: `linear-gradient(90deg, rgba(16,14,12,0.96) 32%, rgba(16,14,12,0.45) 70%, rgba(16,14,12,0.15)), url(${heroGoal.image})` }
                    : undefined
                }
                onClick={() => go({ view: 'goal', goalId: heroGoal.id })}
                role="button"
              >
                <div className="hero-body">
                  <p className="hero-time">
                    {hero.time ? formatTime(hero.time) : 'Anytime'}
                    {hero.duration ? ` · ${formatDuration(hero.duration)}` : ''}
                  </p>
                  <h2 className="hero-title">{hero.title}</h2>
                  {heroGoal.why && <p className="hero-why why-line">{heroGoal.why}</p>}
                  <p className="hero-goal">
                    {heroGoal.title} <IconArrowRight size={13} />
                  </p>
                </div>
                <div className="hero-check">
                  <CheckButton
                    done={false}
                    size={28}
                    onToggle={() => dispatch({ type: 'toggle-done', id: hero.id })}
                  />
                </div>
              </div>

              {matters.slice(1).map((a) => {
                const g = goalById(state, a.goalId)!
                return (
                  <div key={a.id} className="matters-row">
                    <CheckButton
                      done={false}
                      onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                    />
                    <div className="matters-row-body">
                      <div className="matters-row-line">
                        <span className="row-time">{a.time ? formatTime(a.time) : ''}</span>
                        <span className="row-title">{a.title}</span>
                        <span className="row-dur">{a.duration ? formatDuration(a.duration) : ''}</span>
                      </div>
                      {g.why && <p className="matters-row-why why-line">{g.why}</p>}
                    </div>
                  </div>
                )
              })}
              {mattersDone.map((a) => (
                <div key={a.id} className="matters-row row-done">
                  <CheckButton done onToggle={() => dispatch({ type: 'toggle-done', id: a.id })} />
                  <div className="matters-row-body">
                    <div className="matters-row-line">
                      <span className="row-time">{a.time ? formatTime(a.time) : ''}</span>
                      <span className="row-title strike">{a.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            mattersDone.length > 0 && (
              <section className="matters">
                <span className="k-label">What matters today</span>
                <p className="matters-clear">
                  Done. {mattersDone.length === 1 ? 'The thing that mattered most today is behind you.' : 'Everything meaningful today is behind you.'}
                </p>
              </section>
            )
          )}

          <section className="today-list">
            <span className="k-label">Today</span>
            {allDone ? (
              <p className="day-clear">That’s the day. Nothing else needs you.</p>
            ) : (
              <div className="rows">
                {rest.map((item) =>
                  item.kind === 'event' ? (
                    <EventRow key={item.event!.id} event={item.event!} />
                  ) : (
                    <ActionRow
                      key={item.action!.id}
                      action={item.action!}
                      onToggle={() => dispatch({ type: 'toggle-done', id: item.action!.id })}
                      context={contextLabel(item.action!, state)}
                      onContext={() => {
                        const a = item.action!
                        if (a.goalId) go({ view: 'goal', goalId: a.goalId })
                        else if (a.areaId) go({ view: 'area', areaId: a.areaId })
                      }}
                    />
                  ),
                )}
              </div>
            )}
          </section>

          {rhythms.length > 0 && (
            <section className="today-rhythms">
              <span className="k-label">This evening</span>
              {rhythms.map((a) => (
                <div key={a.id} className="rhythm-chip">
                  <IconRepeat />
                  <span>{a.title}</span>
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className="today-rail">
          <button className="rail-week" onClick={() => go({ view: 'week' })}>
            <span className="k-label">This week</span>
            {focusGoals(state).map((g) => {
              const planned = plannedMinutes(state, g.id)
              const intent = (g.hoursPerWeek ?? 0) * 60
              return (
                <div key={g.id} className="rail-goal">
                  <span className="rail-goal-title">{g.title}</span>
                  <span className="rail-goal-meta">
                    {formatDuration(planned)} of {g.hoursPerWeek}h placed
                  </span>
                  <span className="meter">
                    <span
                      className="meter-fill"
                      style={{ width: `${Math.min(100, intent ? (planned / intent) * 100 : 0)}%` }}
                    />
                  </span>
                </div>
              )
            })}
          </button>
          {inboxItems(state).length > 0 && (
            <button className="rail-inbox" onClick={() => go({ view: 'inbox' })}>
              {inboxItems(state).length} captured, waiting to be sorted{' '}
              <IconArrowRight size={13} />
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}

function contextLabel(a: Action, state: ReturnType<typeof useStore>['state']): string {
  const g = goalById(state, a.goalId)
  if (g) return g.title
  return areaName(a.areaId)
}

function EventRow({ event }: { event: CalendarEvent }) {
  const past = toMinutes(event.end) < NOW_MINUTES
  return (
    <div className={`row event-row ${past ? 'row-past' : ''}`}>
      <span className="row-spacer" />
      <span className="row-time">{formatTime(event.start)}</span>
      <span className="row-title">{event.title}</span>
      <span className="row-dur">
        {formatDuration(toMinutes(event.end) - toMinutes(event.start))}
      </span>
    </div>
  )
}

export function ActionRow({
  action,
  onToggle,
  context,
  onContext,
}: {
  action: Action
  onToggle: () => void
  context?: string
  onContext?: () => void
}) {
  const done = action.status === 'done'
  return (
    <div className={`row action-row ${done ? 'row-done' : ''}`}>
      <CheckButton done={done} onToggle={onToggle} />
      <span className="row-time">{action.time ? formatTime(action.time) : ''}</span>
      <span className={`row-title ${done ? 'strike' : ''}`}>{action.title}</span>
      {context && (
        <button className="row-context" onClick={onContext}>
          {context}
        </button>
      )}
      <span className="row-dur">{action.duration ? formatDuration(action.duration) : ''}</span>
    </div>
  )
}
