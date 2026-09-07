/* The prototype lives in a fixed demo week so the data always tells
   a coherent story: Monday 7 – Sunday 13 September 2026.
   "Today" is Tuesday 8 September, 07:40. */

export const WEEK_DAYS = [
  '2026-09-07',
  '2026-09-08',
  '2026-09-09',
  '2026-09-10',
  '2026-09-11',
  '2026-09-12',
  '2026-09-13',
] as const

export const TODAY = '2026-09-08'
export const NOW_MINUTES = 7 * 60 + 40

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function dayIndex(day: string): number {
  return WEEK_DAYS.indexOf(day as (typeof WEEK_DAYS)[number])
}

export function dayName(day: string): string {
  const i = dayIndex(day)
  return i >= 0 ? DAY_NAMES[i] : day
}

export function dayShort(day: string): string {
  const i = dayIndex(day)
  return i >= 0 ? DAY_SHORT[i] : day
}

export function dayOfMonth(day: string): number {
  return parseInt(day.slice(8), 10)
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatTime(hhmm: string): string {
  return hhmm.startsWith('0') ? hhmm.slice(1) : hhmm
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = min / 60
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1).replace('.0', '')}h`
}

/** 'Tuesday 8 September' */
export function formatDayLong(day: string): string {
  return `${dayName(day)} ${dayOfMonth(day)} September`
}

export function isPastDay(day: string): boolean {
  return dayIndex(day) < dayIndex(TODAY)
}

export function isToday(day: string): boolean {
  return day === TODAY
}
