import type {
  Assignment, Conflict, Item, Leg, Person, PersonId, Plan, Status,
} from './types'
import { minutes, TODAY } from './dates'

/* ── reading state ──────────────────────────────────────────── */

/**
 * A ride has two legs and therefore two answers. Its headline state is the
 * least settled of them: one unanswered leg leaves the whole ride unanswered.
 */
const RANK: Record<Status, number> = {
  unowned: 0, declined: 1, waiting: 2, 'asked-out': 3, accepted: 4, handled: 5,
}

export function itemStatus(item: Item): Status {
  if (item.handledAt) return 'handled'
  if (!item.legs) return item.assignment.status
  const legs = [item.legs.dropoff, item.legs.pickup]
  return legs.reduce<Status>(
    (worst, leg) => (RANK[leg.status] < RANK[worst] ? leg.status : worst),
    'handled',
  )
}

/**
 * The assignment that decides the headline status. On a ride, the leg that is
 * still open owns the headline — so a ride never reports the name of someone
 * who already said yes.
 */
export function deciding(item: Item): Assignment {
  if (!item.legs) return item.assignment
  const legs = [item.legs.dropoff, item.legs.pickup]
  return legs.reduce((worst, leg) => (RANK[leg.status] < RANK[worst.status] ? leg : worst), legs[0])
}

export function decidingOwner(item: Item): PersonId | null {
  return deciding(item).owner
}

export function assignmentsOf(item: Item): Assignment[] {
  return item.legs ? [item.legs.dropoff, item.legs.pickup] : [item.assignment]
}

export function ownersOf(item: Item): PersonId[] {
  return assignmentsOf(item)
    .map((a) => a.owner)
    .filter((o): o is PersonId => o !== null)
}

export function isOpen(item: Item): boolean {
  return !item.handledAt
}

/** The two states that need a human to do something next. */
export function needsAnswer(item: Item): boolean {
  const s = itemStatus(item)
  return isOpen(item) && (s === 'unowned' || s === 'waiting' || s === 'declined')
}

/** Is this viewer the one being waited on? */
export function waitingOn(item: Item, who: PersonId): boolean {
  return isOpen(item) && assignmentsOf(item).some(
    (a) => a.status === 'waiting' && a.owner === who,
  )
}

export const LEG_LABEL: Record<Leg, string> = { dropoff: 'Drop-off', pickup: 'Pickup' }

/* ── the words. Every world prints these, none of them invents its own. ── */

export const STATUS_WORD: Record<Status, string> = {
  unowned: 'No one',
  waiting: 'Waiting',
  accepted: 'Taken',
  declined: 'Said no',
  'asked-out': 'Asked out',
  handled: 'Handled',
}

/** The same state, said in a full sentence for a detail screen. */
export function statusSentence(a: Assignment, people: Person[], helperName?: string): string {
  const name = (id: PersonId | null) => people.find((p) => p.id === id)?.name ?? 'Someone'
  switch (a.status) {
    case 'unowned': return 'Nobody has taken this yet.'
    case 'waiting': return `Asked ${name(a.owner)}. No answer yet.`
    case 'accepted': return `${name(a.owner)} said yes.`
    case 'declined': return `${name(a.owner)} said no${a.reason ? `: “${a.reason}”` : '.'}`
    case 'asked-out': return `Texted ${helperName ?? 'someone outside the family'}. Waiting on a reply.`
    case 'handled': return `Handled${a.owner ? ` by ${name(a.owner)}` : ''}.`
  }
}

/* ── scope by role ──────────────────────────────────────────── */

export function personById(plan: Plan, id: PersonId): Person {
  return plan.people.find((p) => p.id === id)!
}

/**
 * A child's view is their own: they see what is theirs, not the family's load.
 * This is scope, not a lock — nothing is hidden behind a disabled control.
 */
export function visibleItems(plan: Plan, viewer: PersonId): Item[] {
  const person = personById(plan, viewer)
  if (person.role !== 'child') return plan.items
  return plan.items.filter(
    (i) => ownersOf(i).includes(viewer) || i.forPerson === viewer,
  )
}

export function canAssignToOthers(person: Person) {
  return person.role !== 'child'
}
export function canDelete(person: Person) {
  return person.role !== 'child'
}
export function canInvite(person: Person) {
  return person.role === 'admin'
}

/* ── the lists each screen asks for ─────────────────────────── */

export function byTime(a: Item, b: Item): number {
  const ta = minutes(a.startTime)
  const tb = minutes(b.startTime)
  if (ta === null && tb === null) return a.title.localeCompare(b.title)
  if (ta === null) return 1   // things with no time sit after the timed day
  if (tb === null) return -1
  return ta - tb
}

export function onDate(items: Item[], date: string): Item[] {
  return items.filter((i) => i.date === date && isOpen(i)).sort(byTime)
}

export function openFor(items: Item[], who: PersonId): Item[] {
  return items.filter((i) => isOpen(i) && ownersOf(i).includes(who)).sort(byTime)
}

export function handled(items: Item[]): Item[] {
  return items
    .filter((i) => !!i.handledAt)
    .sort((a, b) => (b.handledAt! < a.handledAt! ? -1 : 1))
}

/* ── conflict alerts ────────────────────────────────────────── */

export function conflicts(plan: Plan, from = TODAY, days = 7): Conflict[] {
  const out: Conflict[] = []
  const window = plan.items.filter(
    (i) => isOpen(i) && i.date >= from && i.date <= addDays(from, days),
  )

  // A ride inside 24 hours with a leg nobody has answered for.
  for (const item of window) {
    if (!item.legs) continue
    const open = (['dropoff', 'pickup'] as Leg[]).filter((leg) => {
      const s = item.legs![leg].status
      return s === 'unowned' || s === 'waiting' || s === 'declined'
    })
    if (open.length && daysTo(from, item.date) <= 1) {
      out.push({
        kind: 'no-driver',
        itemIds: [item.id],
        text: `${item.title} is ${daysTo(from, item.date) === 0 ? 'today' : 'tomorrow'} and the ${open
          .map((l) => LEG_LABEL[l].toLowerCase())
          .join(' and ')} still has no driver.`,
      })
    }
  }

  // An event with a place and no time is a thing nobody can plan around.
  for (const item of window) {
    if (item.kind === 'event' && !item.startTime) {
      out.push({
        kind: 'no-time',
        itemIds: [item.id],
        text: `${item.title} has no time on it yet.`,
      })
    }
  }

  // One person expected in two places at once.
  const byPerson = new Map<PersonId, Item[]>()
  for (const item of window) {
    for (const owner of ownersOf(item)) {
      byPerson.set(owner, [...(byPerson.get(owner) ?? []), item])
    }
  }
  for (const [who, list] of byPerson) {
    const timed = list.filter((i) => i.startTime).sort(byTime)
    for (let i = 0; i < timed.length - 1; i++) {
      const a = timed[i]
      const b = timed[i + 1]
      if (a.date !== b.date) continue
      const endA = minutes(a.endTime) ?? minutes(a.startTime)! + 60
      if (endA > minutes(b.startTime)!) {
        out.push({
          kind: 'overlap',
          itemIds: [a.id, b.id],
          text: `${capitalize(who)} is on both “${a.title}” and “${b.title}” at the same time.`,
        })
      }
    }
  }
  return out
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}
function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function daysTo(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000)
}

/* ── the pre-filled text an outside helper actually receives ── */

export function helperMessage(item: Item, leg: Leg | null, people: Person[]): string {
  const who = item.forPerson ? people.find((p) => p.id === item.forPerson)?.name : null
  const what = leg ? `${LEG_LABEL[leg].toLowerCase()} for ${item.title.toLowerCase()}` : item.title
  const when = item.startTime ? ` at ${item.startTime}` : ''
  const place = item.place ? ` from ${item.place}` : ''
  return `Hi — any chance you could do the ${what}${when}${place}${
    who ? ` for ${who}` : ''
  }? No problem if not, just let me know either way.`
}
