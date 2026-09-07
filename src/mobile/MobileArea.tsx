import { useNav } from '../app/nav'
import {
  areaGoals,
  areaName,
  areaStandaloneActions,
  goalActions,
  useStore,
} from '../model/store'
import type { AreaId } from '../model/types'
import { dayShort, formatTime } from '../model/time'
import { MActionRow } from './MobileToday'
import { IconArrowLeft, IconChevronRight, IconFocus } from '../ui/icons'

export default function MobileArea({ areaId }: { areaId: AreaId }) {
  const { state, dispatch } = useStore()
  const { back, go } = useNav()
  const goals = areaGoals(state, areaId)
  const standalone = areaStandaloneActions(state, areaId)

  return (
    <div className="m-view view-enter">
      <header className="m-day-head m-area-head">
        <button className="m-back m-back-plain" onClick={back} aria-label="Back">
          <IconArrowLeft size={18} />
        </button>
        <h1 className="m-day-title">{areaName(areaId)}</h1>
      </header>

      {goals.length > 0 && (
        <section className="m-list">
          <span className="k-label">Goals</span>
          <div className="m-rows">
            {goals.map((g) => (
              <button
                key={g.id}
                className="m-area-row"
                onClick={() => go({ view: 'goal', goalId: g.id })}
              >
                <div className="m-area-text">
                  <span className="m-area-name">
                    {g.title}
                    {g.focus && (
                      <span className="area-goal-focus">
                        {' '}
                        <IconFocus size={11} /> Focus
                      </span>
                    )}
                  </span>
                  {g.why && <span className="m-area-meta why-line">{g.why}</span>}
                </div>
                <IconChevronRight />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="m-list">
        <span className="k-label">{goals.length > 0 ? 'Everything else' : 'To stay on top of'}</span>
        {standalone.length === 0 ? (
          <p className="m-day-empty">Nothing here needs you right now.</p>
        ) : (
          <div className="m-rows">
            {standalone.map((a) => (
              <MActionRow
                key={a.id}
                action={a}
                when={
                  a.day ? `${dayShort(a.day)}${a.time ? ` ${formatTime(a.time)}` : ''}` : undefined
                }
                onToggle={() => dispatch({ type: 'toggle-done', id: a.id })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
