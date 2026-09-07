import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AreaId } from '../model/types'

export type Route =
  | { view: 'today' }
  | { view: 'week' }
  | { view: 'inbox' }
  | { view: 'focus' }
  | { view: 'area'; areaId: AreaId }
  | { view: 'goal'; goalId: string }
  | { view: 'goal-new'; areaId?: AreaId; goalId?: string }
  | { view: 'goals' } // mobile: focus + areas overview

interface Nav {
  route: Route
  go: (route: Route) => void
  back: () => void
}

const NavContext = createContext<Nav | null>(null)

export function NavProvider({ initial, children }: { initial: Route; children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([initial])
  const nav: Nav = {
    route: stack[stack.length - 1],
    go: (route) => setStack((s) => [...s, route]),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
  }
  return <NavContext.Provider value={nav}>{children}</NavContext.Provider>
}

export function useNav(): Nav {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav outside NavProvider')
  return ctx
}
