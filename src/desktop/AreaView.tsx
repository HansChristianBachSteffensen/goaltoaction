import { useNav } from '../app/nav'
import {
  areaGoals,
  areaName,
  areaStandaloneActions,
  goalActions,
  useStore,
} from '../model/store'
import type { AreaId } from '../model/types'
import { dayShort, formatDuration, formatTime } from '../model/time'
import { CheckButton } from '../ui/bits'
import { IconChevronRight, IconFocus, IconPlus } from '../ui/icons'
import { AddActionInline } from './GoalView'

/* An Area is a place, not a goal. It holds a few things being moved
   forward — and everything simply being stayed on top of. */

export default function AreaView({ areaId }: { areaId: AreaId }) {
  const { state, dispatch } = useStore()
  const { go } = useNav()
  const goals = areaGoals(state, areaId)
  const standalone = areaStandaloneActions(state, areaId)
  const open = standalone.filter((a) => a.status === 'open')
  const done = standalone.filter((a) => a.status === 'done')

  return (
    <div className="view view-enter area">
      <header className="area-head">
        <h1 className="view-title">{areaName(areaId)}</h1>
      </header>

      <div className="area-body">
        {goals.length > 0 && (
          <section className="area-section">
            <div className="rows-heading">
              <span className="k-label">Goals</span>
            </div>
            <div className="area-goals">
              {goals.map((g) => {
                const count = goalActions(state, g.id).filter((a) => a.status === 'open').length
                return (
                  <button
                    key={g.id}
                    className="area-goal-card"
                    onClick={() => go({ view: 'goal', goalId: g.id })}
                  >
                    <div className="area-goal-text">
                      <span className="area-goal-title">
                        {g.title}
                        {g.focus && (
                          <span className="area-goal-focus">
                            <IconFocus size={12} /> Focus
                          </span>
                        )}
                      </span>
                      {g.why && <span className="area-goal-why why-line">{g.why}</span>}
                      <span className="area-goal-meta">
                        {count} open action{count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <span className="area-goal-go">
                      <IconChevronRight />
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              className="area-new-goal"
              onClick={() => go({ view: 'goal-new', areaId })}
            >
              <IconPlus size={13} /> New goal
            </button>
          </section>
        )}

        <section className="area-section">
          <div className="rows-heading">
            <span className="k-label">{goals.length > 0 ? 'Everything else' : 'To stay on top of'}</span>
          </div>
          {open.length === 0 && done.length === 0 && (
            <p className="area-empty">Nothing here needs you right now.</p>
          )}
          <div className="rows">
            {open.map((a) => (
              <div key={a.id} className="row action-row">
                <CheckButton
                  done={false}
                  onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
                />
                <span className="row-time goal-row-day">
                  {a.day ? `${dayShort(a.day)}${a.time ? ` ${formatTime(a.time)}` : ''}` : '—'}
                </span>
                <span className="row-title">{a.title}</span>
                <span />
                <span className="row-dur">{a.duration ? formatDuration(a.duration) : ''}</span>
              </div>
            ))}
            {done.map((a) => (
              <div key={a.id} className="row action-row row-done">
                <CheckButton done onToggle={() => dispatch({ type: 'toggle-done', id: a.id })} />
                <span className="row-time goal-row-day">{a.day ? dayShort(a.day) : ''}</span>
                <span className="row-title strike">{a.title}</span>
                <span />
                <span className="row-dur" />
              </div>
            ))}
          </div>
          <AddActionInline areaId={areaId} />
          {goals.length === 0 && (
            <button className="area-new-goal" onClick={() => go({ view: 'goal-new', areaId })}>
              <IconPlus size={13} /> Something you want to change here? Start a goal
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
