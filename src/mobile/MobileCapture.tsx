import { useEffect, useRef, useState } from 'react'
import { areaName, useStore } from '../model/store'
import { suggestFor } from '../model/ai'
import { IconSpark } from '../ui/icons'

export default function MobileCapture({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [text, setText] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const suggestion = text.trim().length > 2 ? suggestFor({ title: text }) : undefined
  const suggestedGoal = suggestion?.goalId
    ? state.goals.find((g) => g.id === suggestion.goalId)
    : undefined

  function save() {
    const t = text.trim()
    if (!t) return
    dispatch({ type: 'capture', title: t })
    setSaved(t)
    setText('')
    setTimeout(onClose, 800)
  }

  return (
    <div className="m-sheet-backdrop" onClick={onClose}>
      <div className="m-sheet" onClick={(e) => e.stopPropagation()}>
        {saved ? (
          <div className="capture-saved">
            <span className="capture-saved-title">{saved}</span>
            <span className="capture-saved-note">Captured. It’s safe in your inbox.</span>
          </div>
        ) : (
          <>
            <textarea
              ref={inputRef}
              className="m-capture-input"
              placeholder="What’s on your mind?"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  save()
                }
              }}
            />
            <div className="m-capture-foot">
              {suggestion ? (
                <span className="capture-hint">
                  <IconSpark />
                  {suggestedGoal
                    ? `Looks like ${suggestedGoal.title}`
                    : `Looks like ${areaName(suggestion.areaId)}`}
                </span>
              ) : (
                <span className="capture-hint quiet">Nothing else to decide</span>
              )}
              <button className="btn btn-primary m-capture-save" onClick={save} disabled={!text.trim()}>
                Capture
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
