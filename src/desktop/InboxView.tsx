import { useState } from 'react'
import {
  areaName,
  areas,
  inboxItems,
  useStore,
} from '../model/store'
import type { Action, AreaId } from '../model/types'
import { suggestFor } from '../model/ai'
import { dayName, formatDuration } from '../model/time'
import { SourceBadge } from '../ui/bits'
import { IconCheck, IconSpark, IconX } from '../ui/icons'

/* The inbox is where interpretation happens — after capture, not during.
   Every AI suggestion is a proposal with a reason, never a silent move. */

export default function InboxView() {
  const { state } = useStore()
  const items = inboxItems(state)

  return (
    <div className="view view-enter inbox">
      <header className="inbox-head">
        <h1 className="view-title">Inbox</h1>
        <p className="view-sub">
          {items.length === 0
            ? 'Nothing waiting.'
            : `${items.length} captured — decide where they belong, or leave them for later.`}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="inbox-clear why-line">
          Everything you’ve caught has a place. Go do something that matters.
        </p>
      ) : (
        <div className="inbox-list">
          {items.map((a) => (
            <InboxRow key={a.id} action={a} />
          ))}
        </div>
      )}
    </div>
  )
}

function InboxRow({ action }: { action: Action }) {
  const { state, dispatch } = useStore()
  const [adjusting, setAdjusting] = useState(false)
  const suggestion = suggestFor(action)
  const goal = suggestion?.goalId ? state.goals.find((g) => g.id === suggestion.goalId) : undefined

  function fileAsSuggested() {
    if (!suggestion) return
    dispatch({
      type: 'file-inbox',
      id: action.id,
      areaId: suggestion.areaId,
      goalId: suggestion.goalId,
      day: suggestion.day,
      duration: suggestion.duration,
    })
  }

  function fileTo(areaId: AreaId, goalId?: string) {
    dispatch({ type: 'file-inbox', id: action.id, areaId, goalId })
  }

  return (
    <div className="inbox-row">
      <div className="inbox-row-main">
        <span className="inbox-source" title={action.sourceDetail ?? action.source}>
          <SourceBadge action={action} />
        </span>
        <div className="inbox-row-text">
          <span className="inbox-title">{action.title}</span>
          {action.sourceDetail && <span className="inbox-detail">{action.sourceDetail}</span>}
        </div>
        <button
          className="inbox-dismiss"
          onClick={() => dispatch({ type: 'dismiss-inbox', id: action.id })}
          title="Let it go"
        >
          <IconX />
        </button>
      </div>

      {adjusting ? (
        <div className="inbox-adjust">
          {areas.map((ar) => {
            const goals = state.goals.filter((g) => g.areaId === ar.id)
            return (
              <div key={ar.id} className="inbox-adjust-area">
                <button className="adjust-chip adjust-area" onClick={() => fileTo(ar.id)}>
                  {ar.name}
                </button>
                {goals.map((g) => (
                  <button
                    key={g.id}
                    className="adjust-chip adjust-goal"
                    onClick={() => fileTo(ar.id, g.id)}
                  >
                    {g.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="inbox-row-foot">
          {suggestion ? (
            <>
              <span className="inbox-hint">
                <IconSpark />
                <span>
                  {goal ? goal.title : areaName(suggestion.areaId)}
                  {suggestion.day ? ` · ${dayName(suggestion.day)}` : ''}
                  {suggestion.duration ? ` · ${formatDuration(suggestion.duration)}` : ''}
                </span>
                <span className="inbox-reason">— {suggestion.reason}</span>
              </span>
              <div className="inbox-buttons">
                <button className="btn btn-primary inbox-file" onClick={fileAsSuggested}>
                  <IconCheck size={12} /> File it
                </button>
                <button className="btn btn-quiet" onClick={() => setAdjusting(true)}>
                  Somewhere else
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="inbox-hint quiet">Where does this belong?</span>
              <div className="inbox-buttons">
                <button className="btn btn-ghost" onClick={() => setAdjusting(true)}>
                  Choose a place
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
