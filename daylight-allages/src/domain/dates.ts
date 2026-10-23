const DAY = 86400000

export const TODAY = '2026-10-23' // Friday

export function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function iso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function shift(isoDate: string, days: number): string {
  return iso(new Date(parse(isoDate).getTime() + days * DAY))
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / DAY)
}

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function weekdayLong(isoDate: string) {
  return WEEKDAY[parse(isoDate).getDay()]
}
export function weekdayShort(isoDate: string) {
  return WEEKDAY[parse(isoDate).getDay()].slice(0, 3)
}
export function monthDay(isoDate: string) {
  const d = parse(isoDate)
  return `${MONTH[d.getMonth()]} ${d.getDate()}`
}
export function dayNumber(isoDate: string) {
  return parse(isoDate).getDate()
}

/** "Today", "Tomorrow", "Saturday", "Oct 31" — the way a person would say it. */
export function relativeDay(isoDate: string, today = TODAY): string {
  const n = daysBetween(today, isoDate)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n > 1 && n < 7) return weekdayLong(isoDate)
  if (n < -1 && n > -7) return `Last ${weekdayLong(isoDate)}`
  return monthDay(isoDate)
}

/** Lowercased for mid-sentence use — but a weekday keeps its capital. */
export function relativeDayInline(isoDate: string, today = TODAY): string {
  const d = relativeDay(isoDate, today)
  return ['Today', 'Tomorrow', 'Yesterday'].includes(d) ? d.toLowerCase() : d
}

/** Minutes since midnight, for placing something on a band or sorting a day. */
export function minutes(time?: string): number | null {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** "4:15 PM" from "16:15". */
export function clock(time?: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}

/** Just the digits, for a column where the AM/PM sits separately. */
export function clockParts(time?: string): { t: string; ampm: string } {
  if (!time) return { t: '—', ampm: '' }
  const [h, m] = time.split(':').map(Number)
  const hh = h % 12 === 0 ? 12 : h % 12
  return { t: `${hh}:${String(m).padStart(2, '0')}`, ampm: h >= 12 ? 'PM' : 'AM' }
}

/** 24-hour, for the Departures world, which sets times the way a sign does. */
export function clock24(time?: string): string {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "1h 32m ago" — how long an unanswered ask has been unanswered. */
export function elapsed(fromIsoDateTime: string, now = `${TODAY}T09:42`): string {
  const ms = new Date(now).getTime() - new Date(fromIsoDateTime).getTime()
  if (ms < 0) return 'just now'
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  const rem = mins % 60
  if (h < 24) return rem ? `${h}h ${rem}m ago` : `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

/** The Monday-to-Sunday week containing a date. */
export function weekOf(isoDate: string): string[] {
  const d = parse(isoDate)
  const dow = (d.getDay() + 6) % 7
  const monday = shift(isoDate, -dow)
  return Array.from({ length: 7 }, (_, i) => shift(monday, i))
}

export const SUNRISE = '07:21'
export const SUNSET = '18:09'
