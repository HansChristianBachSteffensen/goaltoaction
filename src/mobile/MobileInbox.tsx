import { useNav } from '../app/nav'
import { areaName, areas, inboxItems, useStore } from '../model/store'
import type { AreaId } from '../model/types'
import { suggestFor } from '../model/ai'
import { dayName, formatDuration } from '../model/time'
import { SourceBadge } from '../ui/bits'
import { IconArrowLeft, IconCheck, IconSpark, IconX } from '../ui/icons'
import { useState } from 'react'

/* Mobile processing: one thing at a time. Decide, and the next appears. */

export default function MobileInbox() {
  const { state, dispatch } = useStore()
  const { back } = useNav()
  const items = inboxItems(state)
  const [adjusting, setAdjusting] = useState(false)

  const current = items[0]
  const suggestion = current ? suggestFor(current) : undefined
  const goal = suggestion?.goalId ? state.goals.find((g) => g.id === suggestion.goalId) : undefined

  return (
    <div className="m-view view-enter">
      <header className="m-day-head m-area-head">
        <button className="m-back m-back-plain" onClick={back} aria-label="Back">
          <IconArrowLeft size={18} />
        </button>
        <h1 className="m-day-title">Inbox</h1>
        {items.length > 0 && <span className="m-inbox-count">{items.length} left</span>}
      </header>

      {!current ? (
        <p className="m-inbox-done why-line">
          All sorted. Everything you caught has a place.
        </p>
      ) : (
        <div className="m-inbox-card" key={current.id}>
          <div className="m-inbox-item">
            <span className="inbox-source">
              <SourceBadge action={current} />
            </span>
            <div className="inbox-row-text">
              <span className="m-inbox-title">{current.title}</span>
              {current.sourceDetail && (
                <span className="inbox-detail">{current.sourceDetail}</span>
              )}
            </div>
          </div>

          {adjusting ? (
            <div className="m-inbox-adjust">
              {areas.map((ar) => {
                const goals = state.goals.filter((g) => g.areaId === ar.id)
                return (
                  <div key={ar.id} className="inbox-adjust-area">
                    <button
                      className="adjust-chip adjust-area"
                      onClick={() => {
                        dispatch({ type: 'file-inbox', id: current.id, areaId: ar.id })
                        setAdjusting(false)
                      }}
                    >
                      {ar.name}
                    </button>
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        className="adjust-chip adjust-goal"
                        onClick={() => {
                          dispatch({
                            type: 'file-inbox',
                            id: current.id,
                            areaId: ar.id,
                            goalId: g.id,
                          })
                          setAdjusting(false)
                        }}
                      >
                        {g.title}
                      </button>
                    ))}
                  </div>
                )
              })}
              <button className="btn btn-quiet" onClick={() => setAdjusting(false)}>
                Never mind
              </button>
            </div>
          ) : (
            <>
              {suggestion && (
                <p className="m-inbox-hint">
                  <IconSpark />
                  <span>
                    {goal ? goal.title : areaName(suggestion.areaId)}
                    {suggestion.day ? ` · ${dayName(suggestion.day)}` : ''}
                    {suggestion.duration ? ` · ${formatDuration(suggestion.duration)}` : ''}
                    <span className="inbox-reason"> — {suggestion.reason}</span>
                  </span>
                </p>
              )}
              <div className="m-inbox-buttons">
                {suggestion ? (
                  <button
                    className="btn btn-primary m-inbox-primary"
                    onClick={() =>
                      dispatch({
                        type: 'file-inbox',
                        id: current.id,
                        areaId: suggestion.areaId,
                        goalId: suggestion.goalId,
                        day: suggestion.day,
                        duration: suggestion.duration,
                      })
                    }
                  >
                    <IconCheck size={13} /> File it
                  </button>
                ) : (
                  <button
                    className="btn btn-primary m-inbox-primary"
                    onClick={() => setAdjusting(true)}
                  >
                    Choose a place
                  </button>
                )}
                <button className="btn btn-ghost" onClick={() => setAdjusting(true)}>
                  Somewhere else
                </button>
                <button
                  className="btn btn-quiet"
                  onClick={() => dispatch({ type: 'dismiss-inbox', id: current.id })}
                >
                  <IconX /> Let it go
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
