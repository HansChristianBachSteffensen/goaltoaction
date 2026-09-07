import { useEffect, useState } from 'react'
import { useNav } from '../app/nav'
import { areas, focusGoals, inboxItems, useStore } from '../model/store'
import { IconFocus, IconInbox, IconPlus, IconSun, IconWeek } from '../ui/icons'
import TodayView from './TodayView'
import WeekView from './WeekView'
import InboxView from './InboxView'
import AreaView from './AreaView'
import GoalView from './GoalView'
import GoalNewView from './GoalNewView'
import FocusView from './FocusView'
import CaptureOverlay from './CaptureOverlay'
import './desktop.css'

export default function DesktopShell() {
  const { state } = useStore()
  const { route, go } = useNav()
  const [capturing, setCapturing] = useState(false)
  const inboxCount = inboxItems(state).length
  const focus = focusGoals(state)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'c') {
        e.preventDefault()
        setCapturing(true)
      } else if (e.key === '1') go({ view: 'today' })
      else if (e.key === '2') go({ view: 'week' })
      else if (e.key === '3') go({ view: 'inbox' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const isFocusTakeover = route.view === 'focus'

  return (
    <div className="shell">
      {!isFocusTakeover && (
        <aside className="sidebar">
          <div className="sidebar-top">
            <button className="wordmark" onClick={() => go({ view: 'week' })}>
              North
            </button>
            <button
              className="capture-trigger"
              onClick={() => setCapturing(true)}
              title="Capture anything — C"
            >
              <IconPlus size={14} />
              <span>Capture</span>
              <kbd>C</kbd>
            </button>
          </div>

          <nav className="side-nav">
            <SideLink
              active={route.view === 'today'}
              onClick={() => go({ view: 'today' })}
              icon={<IconSun />}
              label="Today"
            />
            <SideLink
              active={route.view === 'week'}
              onClick={() => go({ view: 'week' })}
              icon={<IconWeek />}
              label="This week"
            />
            <SideLink
              active={route.view === 'inbox'}
              onClick={() => go({ view: 'inbox' })}
              icon={<IconInbox />}
              label="Inbox"
              badge={inboxCount || undefined}
            />
          </nav>

          <div className="side-section">
            <div className="side-heading">
              <span className="k-label">Focus</span>
              <button
                className="side-edit"
                onClick={() => go({ view: 'focus' })}
                title="Choose focus"
              >
                <IconFocus size={14} />
              </button>
            </div>
            {focus.map((g) => (
              <button
                key={g.id}
                className={`side-goal ${route.view === 'goal' && route.goalId === g.id ? 'active' : ''}`}
                onClick={() => go({ view: 'goal', goalId: g.id })}
              >
                <span className="side-goal-dot" />
                <span className="side-goal-title">{g.title}</span>
              </button>
            ))}
          </div>

          <div className="side-section">
            <div className="side-heading">
              <span className="k-label">Life</span>
            </div>
            {areas.map((a) => (
              <button
                key={a.id}
                className={`side-area ${route.view === 'area' && route.areaId === a.id ? 'active' : ''}`}
                onClick={() => go({ view: 'area', areaId: a.id })}
              >
                {a.name}
              </button>
            ))}
          </div>
        </aside>
      )}

      <main className={`main ${isFocusTakeover ? 'main-full' : ''}`}>
        {route.view === 'today' && <TodayView />}
        {route.view === 'week' && <WeekView />}
        {route.view === 'inbox' && <InboxView />}
        {route.view === 'focus' && <FocusView />}
        {route.view === 'area' && <AreaView areaId={route.areaId} />}
        {route.view === 'goal' && <GoalView goalId={route.goalId} />}
        {route.view === 'goal-new' && <GoalNewView areaId={route.areaId} goalId={route.goalId} />}
        {route.view === 'goals' && <WeekView />}
      </main>

      {capturing && <CaptureOverlay onClose={() => setCapturing(false)} />}
    </div>
  )
}

function SideLink({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button className={`side-link ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="side-link-icon">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && <span className="side-badge">{badge}</span>}
    </button>
  )
}
