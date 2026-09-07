import { useNav } from '../app/nav'
import { areaName, focusGoals, useStore } from '../model/store'
import { IconCheck, IconMinus, IconPlus } from '../ui/icons'

/* Choosing focus is the product's most deliberate moment.
   Not a settings checkbox — a quiet, full-attention decision. */

export default function FocusView() {
  const { state, dispatch } = useStore()
  const { back, go } = useNav()
  const chosen = focusGoals(state)
  const full = chosen.length >= 3

  return (
    <div className="focus-takeover view-enter">
      <div className="focus-inner">
        <header className="focus-head">
          <h1 className="focus-question why-line">What deserves more of you right now?</h1>
          <p className="focus-sub">
            Choose up to three. Nothing else disappears — it just waits its turn.
          </p>
        </header>

        <div className="focus-list">
          {state.goals.map((g) => {
            const active = g.focus
            const disabled = !active && full
            return (
              <div key={g.id} className={`focus-row ${active ? 'chosen' : ''} ${disabled ? 'dimmed' : ''}`}>
                <button
                  className="focus-row-main"
                  onClick={() => dispatch({ type: 'toggle-focus', id: g.id })}
                  disabled={disabled}
                >
                  <span className={`focus-ring ${active ? 'on' : ''}`}>
                    {active && <IconCheck size={13} />}
                  </span>
                  <span className="focus-row-text">
                    <span className="focus-row-area">{areaName(g.areaId)}</span>
                    <span className="focus-row-title">{g.title}</span>
                    {g.why && <span className="focus-row-why why-line">{g.why}</span>}
                  </span>
                </button>
                {active && (
                  <div className="focus-hours">
                    <button
                      className="hours-step"
                      onClick={() =>
                        dispatch({ type: 'set-hours', id: g.id, hours: (g.hoursPerWeek ?? 2) - 1 })
                      }
                      aria-label="Less time"
                    >
                      <IconMinus size={13} />
                    </button>
                    <span className="hours-value">~{g.hoursPerWeek ?? 2}h a week</span>
                    <button
                      className="hours-step"
                      onClick={() =>
                        dispatch({ type: 'set-hours', id: g.id, hours: (g.hoursPerWeek ?? 2) + 1 })
                      }
                      aria-label="More time"
                    >
                      <IconPlus size={13} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <footer className="focus-foot">
          <span className="focus-count">
            {chosen.length === 0
              ? 'Nothing chosen yet'
              : `${chosen.length} of 3 chosen`}
          </span>
          <button className="btn btn-primary focus-done" onClick={() => go({ view: 'week' })}>
            That’s my focus
          </button>
        </footer>
      </div>
    </div>
  )
}
