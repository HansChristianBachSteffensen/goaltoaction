/* The product model is deliberately tiny: Area, Goal, Action.
   Focus is a property of a Goal, not another object.
   Everything else (Today, This Week, Inbox) is a view of time. */

export type AreaId = 'health' | 'work' | 'home' | 'family' | 'money' | 'personal'

export interface Area {
  id: AreaId
  name: string
}

export interface Goal {
  id: string
  areaId: AreaId
  title: string
  /** One emotionally meaningful sentence. */
  why?: string
  /** Optional concrete evidence the goal is becoming true. */
  evidence?: string[]
  focus: boolean
  /** Approximate weekly time intention while in focus, hours. */
  hoursPerWeek?: number
  /** Atmospheric image for aspirational moments. */
  image?: string
}

export type ActionStatus = 'inbox' | 'open' | 'done'

export interface Action {
  id: string
  title: string
  areaId?: AreaId
  goalId?: string
  status: ActionStatus
  /** ISO day 'YYYY-MM-DD' when scheduled or dated. */
  day?: string
  /** 'HH:MM' when it has a time. */
  time?: string
  /** Minutes. */
  duration?: number
  /** Human rhythm label, e.g. 'Tue · Thu · Sat'. */
  rhythm?: string
  /** Where it came from. */
  source?: 'capture' | 'email' | 'meeting' | 'note'
  sourceDetail?: string
  note?: string
}

export interface CalendarEvent {
  id: string
  title: string
  day: string
  start: string
  end: string
  kind: 'meeting' | 'fixed'
}

/** A block the app proposes on the week — visible, understandable, reversible. */
export interface SuggestedBlock {
  id: string
  actionIds: string[]
  /** What the block is for — a goal, or a named batch. */
  label: string
  goalId?: string
  areaId?: AreaId
  day: string
  start: string
  end: string
  reason: string
}

export interface Suggestion {
  areaId?: AreaId
  goalId?: string
  duration?: number
  day?: string
  time?: string
  reason: string
}
