import type { Action, Area, CalendarEvent, Goal, SuggestedBlock } from './types'

export const AREAS: Area[] = [
  { id: 'health', name: 'Health' },
  { id: 'work', name: 'Work' },
  { id: 'home', name: 'Home' },
  { id: 'family', name: 'Family' },
  { id: 'money', name: 'Money' },
  { id: 'personal', name: 'Personal' },
]

export const GOALS: Goal[] = [
  {
    id: 'g-body',
    areaId: 'health',
    title: "Build a body I'm proud of",
    why: "I want to feel strong, energetic and confident and know I'm looking after myself.",
    evidence: ['15% body fat', '10 strict pull-ups', '3.0 W/kg'],
    focus: true,
    hoursPerWeek: 6,
    image: 'body',
  },
  {
    id: 'g-business',
    areaId: 'work',
    title: 'Build a business I can live from',
    why: 'I want autonomy over my time and the freedom to work on things I actually care about.',
    evidence: ['€10k MRR', 'Five paying customers'],
    focus: true,
    hoursPerWeek: 5,
    image: 'business',
  },
  {
    id: 'g-livingroom',
    areaId: 'home',
    title: 'Make the living room somewhere we actually want to sit',
    why: "It's where every evening ends — it should feel like us, not like a waiting room.",
    evidence: ['Finished before Christmas'],
    focus: true,
    hoursPerWeek: 2,
    image: 'livingroom',
  },
  {
    id: 'g-kids',
    areaId: 'family',
    title: 'Be someone my kids want to talk to',
    why: "They're only this age once.",
    focus: false,
    image: 'family',
  },
]

export const ACTIONS: Action[] = [
  /* ————— Health · Build a body I'm proud of ————— */
  {
    id: 'a-strength-tue',
    title: 'Strength training',
    areaId: 'health',
    goalId: 'g-body',
    status: 'open',
    day: '2026-09-08',
    time: '17:30',
    duration: 60,
    rhythm: 'Tue · Thu · Sat',
  },
  {
    id: 'a-strength-thu',
    title: 'Strength training',
    areaId: 'health',
    goalId: 'g-body',
    status: 'open',
    day: '2026-09-10',
    time: '17:30',
    duration: 60,
    rhythm: 'Tue · Thu · Sat',
  },
  {
    id: 'a-strength-sat',
    title: 'Strength training',
    areaId: 'health',
    goalId: 'g-body',
    status: 'open',
    day: '2026-09-12',
    time: '16:00',
    duration: 60,
    rhythm: 'Tue · Thu · Sat',
  },
  {
    id: 'a-cycle-mon',
    title: 'Cycle — endurance',
    areaId: 'health',
    goalId: 'g-body',
    status: 'done',
    day: '2026-09-07',
    time: '06:45',
    duration: 60,
    rhythm: 'Mon · Wed · Fri',
  },
  {
    id: 'a-cycle-wed',
    title: 'Cycle — intervals',
    areaId: 'health',
    goalId: 'g-body',
    status: 'open',
    day: '2026-09-09',
    time: '06:45',
    duration: 60,
    rhythm: 'Mon · Wed · Fri',
  },
  {
    id: 'a-cycle-fri',
    title: 'Cycle — easy spin',
    areaId: 'health',
    goalId: 'g-body',
    status: 'open',
    day: '2026-09-11',
    time: '06:45',
    duration: 60,
    rhythm: 'Mon · Wed · Fri',
  },
  {
    id: 'a-shoes',
    title: 'Buy running shoes',
    areaId: 'health',
    goalId: 'g-body',
    status: 'open',
    duration: 30,
  },

  /* ————— Work · Build a business I can live from ————— */
  {
    id: 'a-proto',
    title: 'Prototype onboarding',
    areaId: 'work',
    goalId: 'g-business',
    status: 'open',
    day: '2026-09-08',
    time: '09:00',
    duration: 90,
  },
  {
    id: 'a-testgoal',
    title: 'Test Goal creation flow',
    areaId: 'work',
    goalId: 'g-business',
    status: 'open',
    day: '2026-09-10',
    time: '09:00',
    duration: 90,
  },
  {
    id: 'a-users',
    title: 'Talk to five users',
    areaId: 'work',
    goalId: 'g-business',
    status: 'open',
    duration: 150,
    note: 'Two done — Marta and Jens. Three to go.',
  },
  {
    id: 'a-landing',
    title: 'Draft landing page copy',
    areaId: 'work',
    goalId: 'g-business',
    status: 'done',
    day: '2026-09-07',
    time: '13:30',
    duration: 60,
  },

  /* ————— Work · standalone ————— */
  {
    id: 'a-expenses',
    title: 'Submit expenses',
    areaId: 'work',
    status: 'open',
    day: '2026-09-11',
    duration: 20,
  },
  {
    id: 'a-tobias',
    title: 'Reply to Tobias',
    areaId: 'work',
    status: 'open',
    day: '2026-09-08',
    time: '11:30',
    duration: 15,
    source: 'email',
    sourceDetail: 'Re: August invoice',
  },
  {
    id: 'a-present',
    title: 'Review presentation',
    areaId: 'work',
    status: 'open',
    day: '2026-09-09',
    time: '08:50',
    duration: 40,
    note: 'Before the Nordfelt workshop.',
  },

  /* ————— Home · living room ————— */
  {
    id: 'a-measure',
    title: 'Measure the corner',
    areaId: 'home',
    goalId: 'g-livingroom',
    status: 'open',
    duration: 15,
  },
  {
    id: 'a-armchair',
    title: 'Research armchair',
    areaId: 'home',
    goalId: 'g-livingroom',
    status: 'open',
    duration: 45,
  },
  {
    id: 'a-lamp',
    title: 'Order the lamp',
    areaId: 'home',
    goalId: 'g-livingroom',
    status: 'open',
    duration: 15,
  },
  {
    id: 'a-electrician',
    title: 'Call the electrician',
    areaId: 'home',
    goalId: 'g-livingroom',
    status: 'open',
    day: '2026-09-08',
    time: '15:30',
    duration: 10,
    note: 'Two new sockets by the reading corner.',
  },
  {
    id: 'a-paint',
    title: 'Pick up paint samples',
    areaId: 'home',
    goalId: 'g-livingroom',
    status: 'done',
    day: '2026-09-07',
    duration: 20,
  },

  /* ————— Family ————— */
  {
    id: 'a-phones',
    title: 'Phones away 17–20',
    areaId: 'family',
    goalId: 'g-kids',
    status: 'open',
    rhythm: 'Every evening',
  },
  {
    id: 'a-satmorning',
    title: 'Saturday breakfast together',
    areaId: 'family',
    goalId: 'g-kids',
    status: 'open',
    day: '2026-09-12',
    time: '08:30',
    duration: 90,
    rhythm: 'Saturdays',
  },

  /* ————— Money / Personal · maintenance ————— */
  {
    id: 'a-vat',
    title: 'Pay VAT',
    areaId: 'money',
    status: 'open',
    day: '2026-09-10',
    duration: 10,
  },
  {
    id: 'a-insurance',
    title: 'Renew travel insurance',
    areaId: 'money',
    status: 'open',
    duration: 15,
  },
  {
    id: 'a-passport',
    title: 'Renew passport',
    areaId: 'personal',
    status: 'open',
    duration: 30,
  },

  /* ————— Inbox — captured, not yet decided ————— */
  {
    id: 'i-dentist',
    title: 'Book dentist',
    status: 'inbox',
    source: 'capture',
  },
  {
    id: 'i-invoice',
    title: 'Send August invoice to Tobias by Friday',
    status: 'inbox',
    source: 'email',
    sourceDetail: 'Tobias — Re: August invoice',
  },
  {
    id: 'i-scope',
    title: 'Send revised scope to the steering group',
    status: 'inbox',
    source: 'meeting',
    sourceDetail: 'Aurora weekly sync · Monday',
  },
  {
    id: 'i-rug',
    title: 'Look at the wool rug Nina mentioned',
    status: 'inbox',
    source: 'capture',
  },
  {
    id: 'i-swim',
    title: 'Sign the kids up for swim class',
    status: 'inbox',
    source: 'capture',
  },
]

export const EVENTS: CalendarEvent[] = [
  /* Monday */
  { id: 'e-mon-school', title: 'School run', day: '2026-09-07', start: '08:00', end: '08:40', kind: 'fixed' },
  { id: 'e-mon-sync', title: 'Aurora weekly sync', day: '2026-09-07', start: '10:00', end: '11:00', kind: 'meeting' },
  { id: 'e-mon-lunch', title: 'Lunch with Emil', day: '2026-09-07', start: '12:00', end: '13:00', kind: 'meeting' },

  /* Tuesday — today */
  { id: 'e-tue-school', title: 'School run', day: '2026-09-08', start: '08:00', end: '08:40', kind: 'fixed' },
  { id: 'e-tue-prep', title: 'Aurora steering prep', day: '2026-09-08', start: '10:30', end: '11:15', kind: 'meeting' },
  { id: 'e-tue-nordfelt', title: 'Client call — Nordfelt', day: '2026-09-08', start: '13:00', end: '13:45', kind: 'meeting' },
  { id: 'e-tue-steering', title: 'Aurora steering group', day: '2026-09-08', start: '14:00', end: '15:00', kind: 'meeting' },
  { id: 'e-tue-pickup', title: 'Pick up the kids', day: '2026-09-08', start: '16:00', end: '16:40', kind: 'fixed' },

  /* Wednesday */
  { id: 'e-wed-school', title: 'School run', day: '2026-09-09', start: '08:00', end: '08:40', kind: 'fixed' },
  { id: 'e-wed-workshop', title: 'Nordfelt workshop', day: '2026-09-09', start: '09:30', end: '12:00', kind: 'meeting' },

  /* Thursday */
  { id: 'e-thu-school', title: 'School run', day: '2026-09-10', start: '08:00', end: '08:40', kind: 'fixed' },
  { id: 'e-thu-sync', title: 'Aurora sync', day: '2026-09-10', start: '11:00', end: '11:30', kind: 'meeting' },
  { id: 'e-thu-accountant', title: 'Accountant', day: '2026-09-10', start: '14:00', end: '14:30', kind: 'meeting' },
  { id: 'e-thu-pickup', title: 'Pick up the kids', day: '2026-09-10', start: '16:00', end: '16:40', kind: 'fixed' },

  /* Friday */
  { id: 'e-fri-school', title: 'School run', day: '2026-09-11', start: '08:00', end: '08:40', kind: 'fixed' },
  { id: 'e-fri-demo', title: 'Aurora demo', day: '2026-09-11', start: '11:00', end: '12:00', kind: 'meeting' },

  /* Weekend */
  { id: 'e-sat-football', title: 'Football (kids)', day: '2026-09-12', start: '12:30', end: '14:00', kind: 'fixed' },
  { id: 'e-sun-dinner', title: 'Dinner at Mum & Dad’s', day: '2026-09-13', start: '17:30', end: '20:00', kind: 'fixed' },
]

/* Blocks the app proposes — dashed on the week until accepted. */
export const SUGGESTED_BLOCKS: SuggestedBlock[] = [
  {
    id: 'sb-livingroom',
    actionIds: ['a-measure', 'a-armchair', 'a-lamp'],
    label: 'Living room',
    goalId: 'g-livingroom',
    areaId: 'home',
    day: '2026-09-12',
    start: '10:00',
    end: '10:45',
    reason: 'Three small living-room actions fit one quiet Saturday slot.',
  },
  {
    id: 'sb-users',
    actionIds: ['a-users'],
    label: 'Talk to users',
    goalId: 'g-business',
    areaId: 'work',
    day: '2026-09-11',
    start: '13:30',
    end: '15:30',
    reason: 'Your business goal is short of its 5h this week. Friday afternoon is open.',
  },
]
