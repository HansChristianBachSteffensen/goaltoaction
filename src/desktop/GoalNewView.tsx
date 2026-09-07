import { useMemo, useState } from 'react'
import { useNav } from '../app/nav'
import { areas, focusGoals, goalById, nextId, useStore } from '../model/store'
import type { AreaId } from '../model/types'
import { assistGoal } from '../model/ai'
import { IconSpark, IconX } from '../ui/icons'

/* Creating a goal starts from wanting, not from configuring.
   The AI offer sharpens language; it never overwrites without a click. */

export default function GoalNewView({
  areaId: initialArea,
  goalId,
}: {
  areaId?: AreaId
  goalId?: string
}) {
  const { state, dispatch } = useStore()
  const { go, back } = useNav()
  const existing = goalById(state, goalId)

  const [areaId, setAreaId] = useState<AreaId>(existing?.areaId ?? initialArea ?? 'personal')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [why, setWhy] = useState(existing?.why ?? '')
  const [evidence, setEvidence] = useState<string[]>(existing?.evidence ?? [])
  const [evidenceDraft, setEvidenceDraft] = useState('')
  const [focus, setFocus] = useState(existing?.focus ?? false)
  const [assistDismissed, setAssistDismissed] = useState(false)

  const assist = useMemo(() => (existing ? undefined : assistGoal(title)), [title, existing])
  const showAssist =
    assist && !assistDismissed && (assist.title !== title || (!why && assist.why))

  const focusCount = focusGoals(state).length
  const canFocus = existing?.focus || focusCount < 3

  function save() {
    const t = title.trim()
    if (!t) return
    if (existing) {
      dispatch({
        type: 'update-goal',
        id: existing.id,
        patch: { title: t, why: why.trim() || undefined, evidence, areaId, focus },
      })
      go({ view: 'goal', goalId: existing.id })
    } else {
      const id = nextId('goal')
      dispatch({
        type: 'add-goal',
        goal: {
          id,
          areaId,
          title: t,
          why: why.trim() || undefined,
          evidence: evidence.length ? evidence : undefined,
          focus: focus && canFocus,
          hoursPerWeek: focus ? 3 : undefined,
        },
      })
      go({ view: 'goal', goalId: id })
    }
  }

  return (
    <div className="view view-enter goal-new">
      <div className="goal-new-inner">
        <span className="k-label">{existing ? 'Edit goal' : 'New goal'}</span>

        <div className="goal-new-areas">
          {areas.map((a) => (
            <button
              key={a.id}
              className={`area-chip ${a.id === areaId ? 'on' : ''}`}
              onClick={() => setAreaId(a.id)}
            >
              {a.name}
            </button>
          ))}
        </div>

        <input
          className="goal-new-title"
          placeholder="What do you want to change?"
          value={title}
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value)
            setAssistDismissed(false)
          }}
        />

        {showAssist && assist && (
          <div className="assist-card">
            <div className="assist-head">
              <span className="assist-label">
                <IconSpark /> Make it yours
              </span>
              <button className="assist-dismiss" onClick={() => setAssistDismissed(true)}>
                <IconX />
              </button>
            </div>
            <button
              className="assist-suggestion"
              onClick={() => {
                setTitle(assist.title)
                if (!why) setWhy(assist.why)
                if (evidence.length === 0) setEvidence(assist.evidence)
                setAssistDismissed(true)
              }}
            >
              <span className="assist-title">“{assist.title}”</span>
              <span className="assist-why why-line">{assist.why}</span>
              <span className="assist-evidence">{assist.evidence.join(' · ')}</span>
              <span className="assist-use">Use this as a starting point</span>
            </button>
          </div>
        )}

        <label className="goal-new-field">
          <span className="k-label">Why this matters</span>
          <textarea
            className="goal-new-why why-line"
            placeholder="One honest sentence. Not a business case."
            value={why}
            rows={2}
            onChange={(e) => setWhy(e.target.value)}
          />
        </label>

        <div className="goal-new-field">
          <span className="k-label">How I’ll know · optional</span>
          <div className="evidence-editor">
            {evidence.map((e) => (
              <span key={e} className="evidence-chip editable">
                {e}
                <button
                  onClick={() => setEvidence((list) => list.filter((x) => x !== e))}
                  aria-label={`Remove ${e}`}
                >
                  <IconX size={11} />
                </button>
              </span>
            ))}
            <input
              className="evidence-input"
              placeholder={evidence.length ? 'Add another…' : 'e.g. 10 strict pull-ups'}
              value={evidenceDraft}
              onChange={(e) => setEvidenceDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && evidenceDraft.trim()) {
                  setEvidence((list) => [...list, evidenceDraft.trim()])
                  setEvidenceDraft('')
                }
              }}
            />
          </div>
        </div>

        <button
          className={`focus-toggle ${focus ? 'on' : ''}`}
          onClick={() => canFocus && setFocus((f) => !f)}
          disabled={!canFocus && !focus}
        >
          <span className={`focus-ring small ${focus ? 'on' : ''}`} />
          <span className="focus-toggle-text">
            <span>Give it focus now</span>
            <span className="focus-toggle-sub">
              {canFocus || focus
                ? 'It will get deliberate time each week.'
                : 'Three things already have your focus — swap one out first.'}
            </span>
          </span>
        </button>

        <div className="goal-new-foot">
          <button className="btn btn-primary" onClick={save} disabled={!title.trim()}>
            {existing ? 'Save' : 'Create goal'}
          </button>
          <button className="btn btn-quiet" onClick={back}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
