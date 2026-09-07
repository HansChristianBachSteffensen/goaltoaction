import { useState } from 'react'
import { IconCheck, IconMail, IconNote, IconPeople, IconSpark } from './icons'
import type { Action } from '../model/types'

export function CheckButton({
  done,
  onToggle,
  size,
}: {
  done: boolean
  onToggle: () => void
  size?: number
}) {
  const [justDone, setJustDone] = useState(false)
  return (
    <button
      type="button"
      className={`check ${done ? 'is-done' : ''} ${justDone ? 'just-done' : ''}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
      aria-pressed={done}
      onClick={(e) => {
        e.stopPropagation()
        if (!done) {
          setJustDone(true)
          setTimeout(() => setJustDone(false), 500)
        }
        onToggle()
      }}
    >
      <IconCheck />
    </button>
  )
}

export function SourceBadge({ action }: { action: Action }) {
  if (action.source === 'email') return <IconMail />
  if (action.source === 'meeting') return <IconPeople />
  if (action.source === 'note') return <IconNote />
  return <IconSpark />
}
