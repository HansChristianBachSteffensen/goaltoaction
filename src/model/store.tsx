import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { Action, AreaId, CalendarEvent, Goal, SuggestedBlock } from './types'
import { ACTIONS, AREAS, EVENTS, GOALS, SUGGESTED_BLOCKS } from './data'
import { NOW_MINUTES, TODAY, toMinutes } from './time'

export interface State {
  goals: Goal[]
  actions: Action[]
  events: CalendarEvent[]
  suggestedBlocks: SuggestedBlock[]
}

export type Msg =
  | { type: 'toggle-done'; id: string }
  | { type: 'schedule'; id: string; day?: string; time?: string; duration?: number }
  | { type: 'accept-block'; id: string }
  | { type: 'dismiss-block'; id: string }
  | { type: 'capture'; title: string }
  | {
      type: 'file-inbox'
      id: string
      areaId?: AreaId
      goalId?: string
      day?: string
      duration?: number
    }
  | { type: 'dismiss-inbox'; id: string }
  | { type: 'toggle-focus'; id: string }
  | { type: 'set-hours'; id: string; hours: number }
  | { type: 'update-goal'; id: string; patch: Partial<Goal> }
  | { type: 'add-goal'; goal: Goal }
  | { type: 'add-action'; title: string; areaId?: AreaId; goalId?: string; day?: string }

let seq = 0
export function nextId(prefix: string): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

function reducer(state: State, msg: Msg): State {
  switch (msg.type) {
    case 'toggle-done':
      return {
        ...state,
        actions: state.actions.map((a) =>
          a.id === msg.id ? { ...a, status: a.status === 'done' ? 'open' : 'done' } : a,
        ),
      }
    case 'schedule':
      return {
        ...state,
        actions: state.actions.map((a) =>
          a.id === msg.id
            ? {
                ...a,
                status: a.status === 'inbox' ? 'open' : a.status,
                day: msg.day,
                time: msg.time,
                duration: msg.duration ?? a.duration,
              }
            : a,
        ),
      }
    case 'accept-block': {
      const block = state.suggestedBlocks.find((b) => b.id === msg.id)
      if (!block) return state
      const start = toMinutes(block.start)
      return {
        ...state,
        suggestedBlocks: state.suggestedBlocks.filter((b) => b.id !== msg.id),
        actions: state.actions.map((a) => {
          const i = block.actionIds.indexOf(a.id)
          if (i < 0) return a
          /* All actions in a batch share the block; only the first carries the time. */
          return {
            ...a,
            status: a.status === 'inbox' ? 'open' : a.status,
            day: block.day,
            time: i === 0 ? block.start : undefined,
            duration:
              block.actionIds.length === 1
                ? toMinutes(block.end) - start
                : a.duration,
          }
        }),
      }
    }
    case 'dismiss-block':
      return {
        ...state,
        suggestedBlocks: state.suggestedBlocks.filter((b) => b.id !== msg.id),
      }
    case 'capture':
      return {
        ...state,
        actions: [
          { id: nextId('cap'), title: msg.title.trim(), status: 'inbox', source: 'capture' },
          ...state.actions,
        ],
      }
    case 'file-inbox':
      return {
        ...state,
        actions: state.actions.map((a) =>
          a.id === msg.id
            ? {
                ...a,
                status: 'open',
                areaId: msg.areaId ?? a.areaId,
                goalId: msg.goalId,
                day: msg.day,
                duration: msg.duration ?? a.duration,
              }
            : a,
        ),
      }
    case 'dismiss-inbox':
      return { ...state, actions: state.actions.filter((a) => a.id !== msg.id) }
    case 'toggle-focus': {
      const goal = state.goals.find((g) => g.id === msg.id)
      if (!goal) return state
      const focusCount = state.goals.filter((g) => g.focus).length
      if (!goal.focus && focusCount >= 3) return state
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === msg.id ? { ...g, focus: !g.focus } : g)),
      }
    }
    case 'set-hours':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === msg.id ? { ...g, hoursPerWeek: Math.max(1, Math.min(20, msg.hours)) } : g,
        ),
      }
    case 'update-goal':
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === msg.id ? { ...g, ...msg.patch } : g)),
      }
    case 'add-goal':
      return { ...state, goals: [...state.goals, msg.goal] }
    case 'add-action':
      return {
        ...state,
        actions: [
          ...state.actions,
          {
            id: nextId('act'),
            title: msg.title,
            areaId: msg.areaId,
            goalId: msg.goalId,
            day: msg.day,
            status: 'open',
          },
        ],
      }
    default:
      return state
  }
}

const INITIAL: State = {
  goals: GOALS,
  actions: ACTIONS,
  events: EVENTS,
  suggestedBlocks: SUGGESTED_BLOCKS,
}

const StoreContext = createContext<{ state: State; dispatch: (msg: Msg) => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}

/* ————— Selectors ————— */

export const areas = AREAS

export function areaName(id?: AreaId): string {
  return AREAS.find((a) => a.id === id)?.name ?? ''
}

export function goalById(state: State, id?: string): Goal | undefined {
  return state.goals.find((g) => g.id === id)
}

export function focusGoals(state: State): Goal[] {
  return state.goals.filter((g) => g.focus)
}

export function inboxItems(state: State): Action[] {
  return state.actions.filter((a) => a.status === 'inbox')
}

export function actionsForDay(state: State, day: string): Action[] {
  return state.actions
    .filter((a) => a.status !== 'inbox' && a.day === day)
    .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
}

export function eventsForDay(state: State, day: string): CalendarEvent[] {
  return state.events.filter((e) => e.day === day).sort((a, b) => a.start.localeCompare(b.start))
}

export function goalActions(state: State, goalId: string): Action[] {
  return state.actions.filter((a) => a.goalId === goalId && a.status !== 'inbox')
}

export function areaGoals(state: State, areaId: AreaId): Goal[] {
  return state.goals.filter((g) => g.areaId === areaId)
}

export function areaStandaloneActions(state: State, areaId: AreaId): Action[] {
  return state.actions.filter((a) => a.areaId === areaId && !a.goalId && a.status !== 'inbox')
}

/** Minutes scheduled this week toward a goal (any day with a slot). */
export function plannedMinutes(state: State, goalId: string): number {
  return state.actions
    .filter((a) => a.goalId === goalId && a.day && a.status !== 'inbox')
    .reduce((sum, a) => sum + (a.duration ?? 30), 0)
}

/** Actions that belong to this week's intent but have no slot yet. */
export function unplacedActions(state: State): Action[] {
  return state.actions.filter((a) => a.status === 'open' && !a.day && !a.rhythm)
}

/** Rough open time left today between now and 22:00, minus events and timed actions. */
export function openMinutesToday(state: State): number {
  const dayEnd = 22 * 60
  let busy = 0
  for (const e of eventsForDay(state, TODAY)) {
    const s = Math.max(toMinutes(e.start), NOW_MINUTES)
    const end = toMinutes(e.end)
    if (end > s) busy += end - s
  }
  for (const a of actionsForDay(state, TODAY)) {
    if (!a.time || a.status === 'done') continue
    const s = Math.max(toMinutes(a.time), NOW_MINUTES)
    const end = toMinutes(a.time) + (a.duration ?? 30)
    if (end > s) busy += end - s
  }
  return Math.max(0, dayEnd - NOW_MINUTES - busy)
}
