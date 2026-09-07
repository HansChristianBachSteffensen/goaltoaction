import { useEffect, useRef, useState } from 'react'
import { useStore, areaName } from '../model/store'
import { suggestFor } from '../model/ai'
import { IconSpark } from '../ui/icons'

/* Capture asks for nothing but the thought itself.
   Interpretation happens later, in the inbox. */

export default function CaptureOverlay({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [text, setText] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
    setTimeout(onClose, 900)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="capture-panel" onClick={(e) => e.stopPropagation()}>
        {saved ? (
          <div className="capture-saved">
            <span className="capture-saved-title">{saved}</span>
            <span className="capture-saved-note">Captured. It’s safe in your inbox.</span>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              className="capture-input"
              placeholder="What’s on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
              }}
            />
            <div className="capture-foot">
              {suggestion ? (
                <span className="capture-hint">
                  <IconSpark />
                  {suggestedGoal
                    ? `Looks like ${suggestedGoal.title}`
                    : `Looks like ${areaName(suggestion.areaId)}`}
                  {' — you can sort it later'}
                </span>
              ) : (
                <span className="capture-hint quiet">Enter to capture · nothing else to decide</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
