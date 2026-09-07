import { create } from 'zustand'
import type { Action, AreaId, CalendarEvent, Goal, SuggestedBlock } from '../model/types'
import { ACTIONS, AREAS, EVENTS, GOALS, SUGGESTED_BLOCKS } from '../model/data'
import { NOW_MINUTES, TODAY, toMinutes } from '../model/time'

let seq = 0
export function nextId(prefix: string): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

export interface Store {
  goals: Goal[]
  actions: Action[]
  events: CalendarEvent[]
  suggestedBlocks: SuggestedBlock[]

  toggleDone: (id: string) => void
  schedule: (id: string, day?: string, time?: string, duration?: number) => void
  acceptBlock: (id: string) => void
  dismissBlock: (id: string) => void
  capture: (title: string) => void
  fileInbox: (
    id: string,
    where: { areaId?: AreaId; goalId?: string; day?: string; duration?: number },
  ) => void
  dismissInbox: (id: string) => void
  toggleFocus: (id: string) => void
  setHours: (id: string, hours: number) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  addGoal: (goal: Goal) => void
  addAction: (title: string, where?: { areaId?: AreaId; goalId?: string; day?: string }) => void
}

export const useStore = create<Store>((set) => ({
  goals: GOALS,
  actions: ACTIONS,
  events: EVENTS,
  suggestedBlocks: SUGGESTED_BLOCKS,

  toggleDone: (id) =>
    set((s) => ({
      actions: s.actions.map((a) =>
        a.id === id ? { ...a, status: a.status === 'done' ? 'open' : 'done' } : a,
      ),
    })),

  schedule: (id, day, time, duration) =>
    set((s) => ({
      actions: s.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'inbox' ? 'open' : a.status,
              day,
              time,
              duration: duration ?? a.duration,
            }
          : a,
      ),
    })),

  acceptBlock: (id) =>
    set((s) => {
      const block = s.suggestedBlocks.find((b) => b.id === id)
      if (!block) return s
      const span = toMinutes(block.end) - toMinutes(block.start)
      return {
        suggestedBlocks: s.suggestedBlocks.filter((b) => b.id !== id),
        actions: s.actions.map((a) => {
          const i = block.actionIds.indexOf(a.id)
          if (i < 0) return a
          return {
            ...a,
            status: a.status === 'inbox' ? ('open' as const) : a.status,
            day: block.day,
            time: i === 0 ? block.start : undefined,
            duration: block.actionIds.length === 1 ? span : a.duration,
          }
        }),
      }
    }),

  dismissBlock: (id) =>
    set((s) => ({ suggestedBlocks: s.suggestedBlocks.filter((b) => b.id !== id) })),

  capture: (title) =>
    set((s) => ({
      actions: [
        { id: nextId('cap'), title: title.trim(), status: 'inbox', source: 'capture' },
        ...s.actions,
      ],
    })),

  fileInbox: (id, where) =>
    set((s) => ({
      actions: s.actions.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'open',
              areaId: where.areaId ?? a.areaId,
              goalId: where.goalId,
              day: where.day,
              duration: where.duration ?? a.duration,
            }
          : a,
      ),
    })),

  dismissInbox: (id) => set((s) => ({ actions: s.actions.filter((a) => a.id !== id) })),

  toggleFocus: (id) =>
    set((s) => {
      const goal = s.goals.find((g) => g.id === id)
      if (!goal) return s
      if (!goal.focus && s.goals.filter((g) => g.focus).length >= 3) return s
      return { goals: s.goals.map((g) => (g.id === id ? { ...g, focus: !g.focus } : g)) }
    }),

  setHours: (id, hours) =>
    set((s) => ({
      goals: s.goals.map((g) =>
        g.id === id ? { ...g, hoursPerWeek: Math.max(1, Math.min(20, hours)) } : g,
      ),
    })),

  updateGoal: (id, patch) =>
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

  addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),

  addAction: (title, where) =>
    set((s) => ({
      actions: [
        ...s.actions,
        {
          id: nextId('act'),
          title,
          areaId: where?.areaId,
          goalId: where?.goalId,
          day: where?.day,
          status: 'open',
        },
      ],
    })),
}))

/* ————— Pure selectors over store slices ————— */

export const areas = AREAS

export function areaName(id?: AreaId): string {
  return AREAS.find((a) => a.id === id)?.name ?? ''
}

type S = Pick<Store, 'goals' | 'actions' | 'events' | 'suggestedBlocks'>

export function goalById(s: S, id?: string): Goal | undefined {
  return s.goals.find((g) => g.id === id)
}

export function focusGoals(s: S): Goal[] {
  return s.goals.filter((g) => g.focus)
}

export function inboxItems(s: S): Action[] {
  return s.actions.filter((a) => a.status === 'inbox')
}

export function actionsForDay(s: S, day: string): Action[] {
  return s.actions
    .filter((a) => a.status !== 'inbox' && a.day === day)
    .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'))
}

export function eventsForDay(s: S, day: string): CalendarEvent[] {
  return s.events.filter((e) => e.day === day).sort((a, b) => a.start.localeCompare(b.start))
}

export function goalActions(s: S, goalId: string): Action[] {
  return s.actions.filter((a) => a.goalId === goalId && a.status !== 'inbox')
}

export function areaGoals(s: S, areaId: AreaId): Goal[] {
  return s.goals.filter((g) => g.areaId === areaId)
}

export function areaStandaloneActions(s: S, areaId: AreaId): Action[] {
  return s.actions.filter((a) => a.areaId === areaId && !a.goalId && a.status !== 'inbox')
}

/** Minutes scheduled this week toward a goal. */
export function plannedMinutes(s: S, goalId: string): number {
  return s.actions
    .filter((a) => a.goalId === goalId && a.day && a.status !== 'inbox')
    .reduce((sum, a) => sum + (a.duration ?? 30), 0)
}

/** Open actions that belong to the week's intent but have no slot yet. */
export function unplacedActions(s: S): Action[] {
  return s.actions.filter((a) => a.status === 'open' && !a.day && !a.rhythm)
}

/** Rough open time left today between now and 22:00. */
export function openMinutesToday(s: S): number {
  const dayEnd = 22 * 60
  let busy = 0
  for (const e of eventsForDay(s, TODAY)) {
    const start = Math.max(toMinutes(e.start), NOW_MINUTES)
    const end = toMinutes(e.end)
    if (end > start) busy += end - start
  }
  for (const a of actionsForDay(s, TODAY)) {
    if (!a.time || a.status === 'done') continue
    const start = Math.max(toMinutes(a.time), NOW_MINUTES)
    const end = toMinutes(a.time) + (a.duration ?? 30)
    if (end > start) busy += end - start
  }
  return Math.max(0, dayEnd - NOW_MINUTES - busy)
}
