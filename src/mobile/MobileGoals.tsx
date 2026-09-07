import { useNav } from '../app/nav'
import {
  areaGoals,
  areaStandaloneActions,
  areas,
  focusGoals,
  goalActions,
  plannedMinutes,
  useStore,
} from '../model/store'
import { formatDuration } from '../model/time'
import { IconChevronRight, IconFocus } from '../ui/icons'

export default function MobileGoals() {
  const { state } = useStore()
  const { go } = useNav()
  const focus = focusGoals(state)

  return (
    <div className="m-view view-enter">
      <header className="m-day-head">
        <h1 className="m-day-title">Goals</h1>
      </header>

      <section className="m-list">
        <div className="m-list-heading">
          <span className="k-label m-matters-label">Focus</span>
          <button className="m-quiet-link" onClick={() => go({ view: 'focus' })}>
            Change
          </button>
        </div>
        <div className="m-focus-cards">
          {focus.map((g) => {
            const planned = plannedMinutes(state, g.id)
            return (
              <button
                key={g.id}
                className="m-focus-card"
                style={
                  g.image
                    ? {
                        backgroundImage: `linear-gradient(180deg, rgba(16,14,12,0.45), rgba(16,14,12,0.88) 75%), url(${g.image})`,
                      }
                    : undefined
                }
                onClick={() => go({ view: 'goal', goalId: g.id })}
              >
                <span className="m-focus-card-title">{g.title}</span>
                {g.why && <span className="m-focus-card-why why-line">{g.why}</span>}
                <span className="m-focus-card-meta">
                  {formatDuration(planned)} of ~{g.hoursPerWeek}h this week
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="m-list">
        <span className="k-label">Life</span>
        <div className="m-rows">
          {areas.map((ar) => {
            const goals = areaGoals(state, ar.id)
            const open =
              areaStandaloneActions(state, ar.id).filter((a) => a.status === 'open').length +
              goals.reduce(
                (n, g) => n + goalActions(state, g.id).filter((a) => a.status === 'open').length,
                0,
              )
            const quiet = goals.filter((g) => !g.focus)
            return (
              <button
                key={ar.id}
                className="m-area-row"
                onClick={() => go({ view: 'area', areaId: ar.id })}
              >
                <div className="m-area-text">
                  <span className="m-area-name">{ar.name}</span>
                  <span className="m-area-meta">
                    {goals.length > 0 &&
                      `${goals.length} goal${goals.length === 1 ? '' : 's'}${
                        goals.some((g) => g.focus) ? ' · in focus' : ''
                      } · `}
                    {open} open
                  </span>
                </div>
                <IconChevronRight />
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
