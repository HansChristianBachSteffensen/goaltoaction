import type { Action, Suggestion } from './types'
import { TODAY } from './time'

/* Contextual intelligence, prototyped as transparent heuristics.
   Every suggestion carries a human-readable reason and is only ever
   applied by the user — visible, understandable, reversible. */

const RULES: Array<{
  match: RegExp
  suggestion: Suggestion
}> = [
  {
    match: /dentist|doctor|physio|checkup|gym|training|run\b/i,
    suggestion: { areaId: 'health', duration: 10, reason: 'Sounds like a health errand' },
  },
  {
    match: /invoice|tobias/i,
    suggestion: {
      areaId: 'work',
      day: '2026-09-11',
      duration: 20,
      reason: 'Mentions the August invoice, due Friday',
    },
  },
  {
    match: /steering|scope|aurora|proposal|client/i,
    suggestion: {
      areaId: 'work',
      day: TODAY,
      duration: 30,
      reason: 'The Aurora steering group meets today at 14:00',
    },
  },
  {
    match: /presentation|deck|expenses/i,
    suggestion: { areaId: 'work', duration: 30, reason: 'Looks like work admin' },
  },
  {
    match: /rug|lamp|sofa|armchair|living room|paint|curtain/i,
    suggestion: {
      areaId: 'home',
      goalId: 'g-livingroom',
      duration: 15,
      reason: 'Looks connected to the living room',
    },
  },
  {
    match: /electrician|plumber|repair|garage/i,
    suggestion: { areaId: 'home', duration: 15, reason: 'Sounds like a home errand' },
  },
  {
    match: /kids|swim|school|birthday/i,
    suggestion: { areaId: 'family', duration: 15, reason: 'Sounds like family logistics' },
  },
  {
    match: /insurance|tax|vat|bank|savings|pension/i,
    suggestion: { areaId: 'money', duration: 15, reason: 'Looks like money admin' },
  },
  {
    match: /passport|licence|license|haircut/i,
    suggestion: { areaId: 'personal', duration: 20, reason: 'Sounds like personal admin' },
  },
]

export function suggestFor(action: Pick<Action, 'title' | 'source'>): Suggestion | undefined {
  for (const rule of RULES) {
    if (rule.match.test(action.title)) return rule.suggestion
  }
  return undefined
}

/* Goal sharpening — from a vague wish to a goal with meaning. */

export interface GoalAssist {
  title: string
  why: string
  evidence: string[]
}

const GOAL_PRESETS: Array<{ match: RegExp; assist: GoalAssist }> = [
  {
    match: /lose weight|get fit|in shape|fitness|stronger|work out/i,
    assist: {
      title: "Build a body I'm proud of",
      why: 'I want to feel strong, energetic and confident.',
      evidence: ['15% body fat', '10 strict pull-ups'],
    },
  },
  {
    match: /money|save|finances|debt/i,
    assist: {
      title: 'Feel calm about money',
      why: 'I want money to be a quiet part of life, not a source of dread.',
      evidence: ['Three months of expenses saved', 'No card debt'],
    },
  },
  {
    match: /read|book/i,
    assist: {
      title: 'Get my evenings back from the phone',
      why: 'I want to end days with something that actually restores me.',
      evidence: ['A book finished each month'],
    },
  },
  {
    match: /business|freelance|side|startup|income/i,
    assist: {
      title: 'Build a business I can live from',
      why: 'I want autonomy over my time and work I actually care about.',
      evidence: ['€10k MRR', 'Five paying customers'],
    },
  },
]

export function assistGoal(input: string): GoalAssist | undefined {
  const trimmed = input.trim()
  if (trimmed.length < 3) return undefined
  for (const preset of GOAL_PRESETS) {
    if (preset.match.test(trimmed)) return preset.assist
  }
  return undefined
}
