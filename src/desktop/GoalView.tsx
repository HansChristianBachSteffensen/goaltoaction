import { useMemo, useState } from 'react'
import { useNav } from '../app/nav'
import { areaName, goalActions, goalById, plannedMinutes, useStore } from '../model/store'
import type { Action } from '../model/types'
import { dayShort, formatDuration, formatTime } from '../model/time'
import { CheckButton } from '../ui/bits'
import { IconFocus, IconPlus, IconRepeat } from '../ui/icons'

export default function GoalView({ goalId }: { goalId: string }) {
  const { state, dispatch } = useStore()
  const { go } = useNav()
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
    <div className="view view-enter goal">
      <div
        className="goal-hero"
        style={
          goal.image
            ? {
                backgroundImage: `linear-gradient(75deg, rgba(18,15,12,0.93) 30%, rgba(18,15,12,0.55) 65%, rgba(18,15,12,0.25)), url(${goal.image})`,
              }
            : undefined
        }
      >
        <button className="goal-area" onClick={() => go({ view: 'area', areaId: goal.areaId })}>
          {areaName(goal.areaId)}
        </button>
        <h1 className="goal-title">{goal.title}</h1>
        {goal.why && <p className="goal-why why-line">{goal.why}</p>}
        <div className="goal-hero-foot">
          {goal.evidence && goal.evidence.length > 0 && (
            <div className="goal-evidence">
              <span className="k-label goal-evidence-label">How I’ll know</span>
              <div className="goal-evidence-chips">
                {goal.evidence.map((e) => (
                  <span key={e} className="evidence-chip">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="goal-hero-actions">
            {goal.focus ? (
              <span className="goal-focus-tag">
                <IconFocus size={13} /> In focus · {formatDuration(planned)} of ~
                {goal.hoursPerWeek}h this week
              </span>
            ) : (
              <button className="btn btn-ghost goal-focus-cta" onClick={() => go({ view: 'focus' })}>
                <IconFocus size={13} /> Give it focus
              </button>
            )}
            <button
              className="btn btn-quiet goal-edit"
              onClick={() => go({ view: 'goal-new', areaId: goal.areaId, goalId: goal.id })}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="goal-body">
        {scheduled.length > 0 && (
          <section className="goal-section">
            <span className="k-label">This week</span>
            <div className="rows">
              {scheduled.map((a) => (
                <div key={a.id} className="row action-row">
                  <CheckButton
                    done={false}
                    onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                  />
                  <span className="row-time goal-row-day">
                    {dayShort(a.day!)}
                    {a.time ? ` ${formatTime(a.time)}` : ''}
                  </span>
                  <span className="row-title">{a.title}</span>
                  <span />
                  <span className="row-dur">{a.duration ? formatDuration(a.duration) : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {next.length > 0 && (
          <section className="goal-section">
            <span className="k-label">Up next</span>
            <div className="rows">
              {next.map((a) => (
                <div key={a.id} className="row action-row">
                  <CheckButton
                    done={false}
                    onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                  />
                  <span className="row-time goal-row-day">—</span>
                  <span className="row-title">
                    {a.title}
                    {a.note && <span className="row-note"> · {a.note}</span>}
                  </span>
                  <span />
                  <span className="row-dur">{a.duration ? formatDuration(a.duration) : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {rhythms.length > 0 && (
          <section className="goal-section">
            <span className="k-label">Rhythms</span>
            <div className="rows">
              {rhythms.map((a) => (
                <div key={a.id} className="row action-row">
                  <span className="rhythm-icon">
                    <IconRepeat />
                  </span>
                  <span className="row-time goal-row-day" />
                  <span className="row-title">{a.title}</span>
                  <span className="row-context">{a.rhythm}</span>
                  <span className="row-dur">{a.duration ? formatDuration(a.duration) : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section className="goal-section">
            <span className="k-label">Done this week</span>
            <div className="rows">
              {done.map((a) => (
                <div key={a.id} className="row action-row row-done">
                  <CheckButton
                    done
                    onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                  />
                  <span className="row-time goal-row-day">{a.day ? dayShort(a.day) : ''}</span>
                  <span className="row-title strike">{a.title}</span>
                  <span />
                  <span className="row-dur" />
                </div>
              ))}
            </div>
          </section>
        )}

        <AddActionInline goalId={goal.id} areaId={goal.areaId} />
      </div>
    </div>
  )
}

export function AddActionInline({
  goalId,
  areaId,
}: {
  goalId?: string
  areaId: Action['areaId']
}) {
  const { dispatch } = useStore()
  const [text, setText] = useState('')
  return (
    <div className="add-inline">
      <span className="add-inline-icon">
        <IconPlus size={14} />
      </span>
      <input
        className="add-inline-input"
        placeholder="Add an action…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && text.trim()) {
            dispatch({ type: 'add-action', title: text.trim(), goalId, areaId })
            setText('')
          }
        }}
      />
    </div>
  )
}
