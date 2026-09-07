import { useState } from 'react'
import { useNav } from '../app/nav'
import { inboxItems, useStore } from '../model/store'
import { IconGoals, IconPlus, IconSun, IconWeek } from '../ui/icons'
import MobileToday from './MobileToday'
import MobileWeek from './MobileWeek'
import MobileGoals from './MobileGoals'
import MobileGoal from './MobileGoal'
import MobileArea from './MobileArea'
import MobileInbox from './MobileInbox'
import MobileFocus from './MobileFocus'
import MobileCapture from './MobileCapture'
/* Shared component styles (rows, meters, suggestion cards, focus takeover)
   live with the desktop stylesheet; mobile.css layers its own shell on top. */
import '../desktop/desktop.css'
import './mobile.css'

export default function MobileShell() {
  const { route, go } = useNav()
  const { state } = useStore()
  const [capturing, setCapturing] = useState(false)

  const tab =
    route.view === 'today'
      ? 'today'
      : route.view === 'week'
        ? 'week'
        : 'goals'

  const immersive = route.view === 'focus'

  return (
    <div className="m-shell">
      <main className="m-main">
        {route.view === 'today' && <MobileToday />}
        {route.view === 'week' && <MobileWeek />}
        {route.view === 'goals' && <MobileGoals />}
        {route.view === 'goal' && <MobileGoal goalId={route.goalId} />}
        {route.view === 'area' && <MobileArea areaId={route.areaId} />}
        {route.view === 'inbox' && <MobileInbox />}
        {route.view === 'focus' && <MobileFocus />}
        {(route.view === 'goal-new') && <MobileGoals />}
      </main>

      {!immersive && (
        <>
          <button className="m-fab" onClick={() => setCapturing(true)} aria-label="Capture">
            <IconPlus size={22} strokeWidth={2.2} />
          </button>
          <nav className="m-nav">
            <button
              className={`m-tab ${tab === 'today' ? 'on' : ''}`}
              onClick={() => go({ view: 'today' })}
            >
              <IconSun size={20} />
              <span>Today</span>
            </button>
            <button
              className={`m-tab ${tab === 'week' ? 'on' : ''}`}
              onClick={() => go({ view: 'week' })}
            >
              <IconWeek size={20} />
              <span>Week</span>
            </button>
            <button
              className={`m-tab ${tab === 'goals' ? 'on' : ''}`}
              onClick={() => go({ view: 'goals' })}
            >
              <IconGoals size={20} />
              <span>Goals</span>
              {inboxItems(state).length > 0 && <span className="m-tab-dot" />}
            </button>
          </nav>
        </>
      )}

      {capturing && <MobileCapture onClose={() => setCapturing(false)} />}
    </div>
  )
}
