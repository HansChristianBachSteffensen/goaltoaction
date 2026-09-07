import { useMemo } from 'react'
import { useNav } from '../app/nav'
import { areaName, goalActions, goalById, plannedMinutes, useStore } from '../model/store'
import type { Action } from '../model/types'
import { dayShort, formatDuration, formatTime } from '../model/time'
import { MActionRow } from './MobileToday'
import { IconArrowLeft, IconFocus, IconRepeat } from '../ui/icons'

export default function MobileGoal({ goalId }: { goalId: string }) {
  const { state, dispatch } = useStore()
  const { back } = useNav()
  const goal = goalById(state, goalId)
  const all = goalActions(state, goalId)

  const { scheduled, rhythms, next, done } = useMemo(() => {
    const scheduled: Action[] = []
    const next: Action[] = []
    const done: Action[] = []
    const rhythmMap = new Map<string, Action>()
    for (const a of all) {
      if (a.rhythm && !rhythmMap.has(a.rhythm))
        rhythmMap.set(a.rhythm, { ...a, title: a.title.split(' — ')[0] })
      if (a.status === 'done') done.push(a)
      else if (a.day) scheduled.push(a)
      else if (!a.rhythm) next.push(a)
    }
    scheduled.sort((x, y) => `${x.day}${x.time ?? '99'}`.localeCompare(`${y.day}${y.time ?? '99'}`))
    return { scheduled, rhythms: [...rhythmMap.values()], next, done }
  }, [all])

  if (!goal) return null
  const planned = plannedMinutes(state, goalId)

  return (
    <div className="m-view m-view-flush view-enter">
      <div
        className="m-goal-hero"
        style={
          goal.image
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(16,14,12,0.42), rgba(16,14,12,0.92) 78%), url(${goal.image})`,
              }
            : undefined
        }
      >
        <button className="m-back" onClick={back} aria-label="Back">
          <IconArrowLeft size={18} />
        </button>
        <span className="m-goal-area">{areaName(goal.areaId)}</span>
        <h1 className="m-goal-title">{goal.title}</h1>
        {goal.why && <p className="m-goal-why why-line">{goal.why}</p>}
        {goal.focus && (
          <span className="goal-focus-tag">
            <IconFocus size={13} /> In focus · {formatDuration(planned)} of ~{goal.hoursPerWeek}h
            this week
          </span>
        )}
      </div>

      <div className="m-goal-body">
        {goal.evidence && goal.evidence.length > 0 && (
          <div className="m-goal-evidence">
            {goal.evidence.map((e) => (
              <span key={e} className="m-evidence-chip">
                {e}
              </span>
            ))}
          </div>
        )}

        {scheduled.length > 0 && (
          <section className="m-list">
            <span className="k-label">This week</span>
            <div className="m-rows">
              {scheduled.map((a) => (
                <MActionRow
                  key={a.id}
                  action={a}
                  when={`${dayShort(a.day!)}${a.time ? ` ${formatTime(a.time)}` : ''}`}
                  onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                />
              ))}
            </div>
          </section>
        )}

        {next.length > 0 && (
          <section className="m-list">
            <span className="k-label">Up next</span>
            <div className="m-rows">
              {next.map((a) => (
                <MActionRow
                  key={a.id}
                  action={a}
                  onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                />
              ))}
            </div>
          </section>
        )}

        {rhythms.length > 0 && (
          <section className="m-list">
            <span className="k-label">Rhythms</span>
            <div className="m-rows">
              {rhythms.map((a) => (
                <div key={a.id} className="m-row">
                  <span className="m-rhythm-icon">
                    <IconRepeat />
                  </span>
                  <div className="m-row-text">
                    <span className="m-row-title">{a.title}</span>
                  </div>
                  <span className="m-row-time">{a.rhythm}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section className="m-list">
            <span className="k-label">Done this week</span>
            <div className="m-rows">
              {done.map((a) => (
                <MActionRow
                  key={a.id}
                  action={a}
                  when={a.day ? dayShort(a.day) : ''}
                  onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
