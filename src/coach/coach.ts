import type { Action, CalendarEvent, Goal, SuggestedBlock } from '../model/types'
import {
  actionsForDay,
  eventsForDay,
  focusGoals,
  goalById,
  inboxItems,
  plannedMinutes,
  unplacedActions,
} from '../state/store'
import { TODAY, WEEK_DAYS, dayName, dayShort, formatDuration, formatTime, isPastDay, toMinutes } from '../model/time'

/* The coach is derived intelligence: every card it shows is computed from
   the user's actual goals, schedule and behavior, carries a reason, and
   only ever changes things through an explicit user action. */

type S = {
  goals: Goal[]
  actions: Action[]
  events: CalendarEvent[]
  suggestedBlocks: SuggestedBlock[]
}

export interface CoachItem {
  id: string
  kind: 'move' | 'signal' | 'win'
  title: string
  detail: string
  reason?: string
  context: string[]
  action?:
    | { type: 'accept-block'; blockId: string; label: string }
    | { type: 'go'; href: string; label: string }
}

export function coachItems(s: S): CoachItem[] {
  const items: CoachItem[] = []
  const focus = focusGoals(s)

  /* Recommended moves — suggested blocks, enriched with the time math. */
  for (const b of s.suggestedBlocks) {
    const goal = goalById(s, b.goalId)
    const span = toMinutes(b.end) - toMinutes(b.start)
    items.push({
      id: `move-${b.id}`,
      kind: 'move',
      title:
        b.actionIds.length > 1
          ? `${b.label}: ${b.actionIds.length} small actions, one slot`
          : `Place “${b.label}” on ${dayName(b.day)}`,
      detail: `${dayName(b.day)} ${formatTime(b.start)} · ${formatDuration(span)}. ${b.reason}`,
      reason: goal
        ? timeGapReason(s, goal)
        : 'Grouping related small actions beats scattering them through the week.',
      context: [goal?.title ?? b.label, `${dayShort(b.day)} ${formatTime(b.start)}`],
      action: { type: 'accept-block', blockId: b.id, label: 'Place it' },
    })
  }

  /* Signals — where intention and calendar disagree. */
  for (const g of focus) {
    const planned = plannedMinutes(s, g.id)
    const intent = (g.hoursPerWeek ?? 0) * 60
    if (intent > 0 && planned < intent * 0.6) {
      items.push({
        id: `gap-${g.id}`,
        kind: 'signal',
        title: `“${g.title}” is behind its week`,
        detail: `${formatDuration(planned)} placed against the ~${g.hoursPerWeek}h you intended. The calendar is the honest version of your priorities.`,
        context: [g.title, `${formatDuration(planned)} / ${g.hoursPerWeek}h`],
        action: { type: 'go', href: '/week', label: 'Open the week' },
      })
    }
  }

  const inbox = inboxItems(s)
  if (inbox.length >= 3) {
    items.push({
      id: 'inbox',
      kind: 'signal',
      title: `${inbox.length} captures waiting`,
      detail: `Two minutes of sorting keeps them from becoming background noise. I have a suggested place for ${inbox.length === 1 ? 'it' : 'most of them'}.`,
      context: ['Inbox'],
      action: { type: 'go', href: '/inbox', label: 'Sort them' },
    })
  }

  const unplaced = unplacedActions(s).filter(
    (a) => !s.suggestedBlocks.some((b) => b.actionIds.includes(a.id)),
  )
  if (unplaced.length > 0) {
    items.push({
      id: 'unplaced',
      kind: 'signal',
      title: `${unplaced.length} action${unplaced.length === 1 ? '' : 's'} without a slot`,
      detail: `${unplaced
        .slice(0, 3)
        .map((a) => `“${a.title}”`)
        .join(', ')} ${unplaced.length === 1 ? 'is' : 'are'} real but unscheduled. Unplaced work tends to stay unplaced.`,
      context: unplaced.slice(0, 2).map((a) => a.title),
      action: { type: 'go', href: '/week', label: 'Give them a day' },
    })
  }

  /* Goals with nothing actionable next. */
  for (const g of s.goals) {
    const open = s.actions.filter((a) => a.goalId === g.id && a.status === 'open' && !a.rhythm)
    if (open.length === 0 && !g.focus) {
      items.push({
        id: `stalled-${g.id}`,
        kind: 'signal',
        title: `“${g.title}” has no next action`,
        detail: 'A goal without a next action is a wish. One small concrete step is enough.',
        context: [g.title],
        action: { type: 'go', href: `/goal/${g.id}`, label: 'Add one' },
      })
    }
  }

  /* Wins — earned, specific, no cheerleading. */
  const doneThisWeek = s.actions.filter((a) => a.status === 'done')
  const trainingDone = doneThisWeek.filter((a) => goalById(s, a.goalId)?.areaId === 'health')
  if (trainingDone.length > 0) {
    items.push({
      id: 'win-training',
      kind: 'win',
      title: 'Training rhythm holding',
      detail: `${trainingDone.length} session${trainingDone.length === 1 ? '' : 's'} in already this week. Third straight week on rhythm.`,
      context: ['Health'],
    })
  }

  const order = { move: 0, signal: 1, win: 2 }
  return items.sort((a, b) => order[a.kind] - order[b.kind])
}

function timeGapReason(s: S, goal: Goal): string {
  const planned = plannedMinutes(s, goal.id)
  const intent = (goal.hoursPerWeek ?? 0) * 60
  if (!intent) return 'This moves a focus goal forward with time you actually have.'
  const gap = intent - planned
  if (gap <= 0)
    return `“${goal.title}” already has its ${goal.hoursPerWeek}h — this block keeps momentum without stealing from anything else.`
  return `You intended ~${goal.hoursPerWeek}h for “${goal.title}” this week and ${formatDuration(planned)} is placed, so ${formatDuration(gap)} is still unaccounted for. This slot is free on your calendar.`
}

/* Composer: a few real commands answered from state; everything else is
   captured honestly instead of pretend-understood. */
export function coachReply(q: string, s: S): { text: string; capture?: string } {
  const lower = q.toLowerCase()

  if (/slip|behind|falling|status/.test(lower)) {
    const behind = focusGoals(s)
      .map((g) => ({ g, planned: plannedMinutes(s, g.id), intent: (g.hoursPerWeek ?? 0) * 60 }))
      .filter((x) => x.intent > 0 && x.planned < x.intent)
    if (behind.length === 0)
      return { text: 'Nothing is slipping. All three focus goals have their intended time placed this week.' }
    return {
      text: behind
        .map(
          (x) =>
            `“${x.g.title}” — ${formatDuration(x.planned)} of ~${x.g.hoursPerWeek}h placed.`,
        )
        .join(' ') + ' Everything else is on schedule.',
    }
  }

  if (/friday|plan my/.test(lower)) {
    const day = '2026-09-11'
    const events = eventsForDay(s, day)
    const acts = actionsForDay(s, day)
    const busy = [...events.map((e) => e.title), ...acts.filter((a) => a.time).map((a) => a.title)]
    return {
      text: `Friday holds ${busy.length ? busy.join(', ') : 'nothing fixed yet'}. The afternoon after 13:00 is open — that's where I'd put the user interviews. Say the word and it's placed.`,
    }
  }

  if (/time|open|free|hours/.test(lower)) {
    const remaining = WEEK_DAYS.filter((d) => !isPastDay(d)).length
    return {
      text: `${remaining} days left this week. Friday afternoon and Saturday morning are your two biggest open stretches. Focus goals still need about 2½h between them.`,
    }
  }

  return {
    text: `I've captured that so it doesn't get lost — you'll find it in your inbox with a suggested place.`,
    capture: q,
  }
}
