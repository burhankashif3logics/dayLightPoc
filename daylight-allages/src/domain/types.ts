export type PersonId = 'alicia' | 'taylor' | 'parker' | 'becker'
export type Role = 'admin' | 'parent' | 'child'

export interface Person {
  id: PersonId
  name: string
  role: Role
  /** Index into the active world's person palette. Worlds own the colour. */
  hue: number
}

/** Outside helpers never hold an account. They exist only as a name and a number. */
export interface Helper {
  id: string
  name: string
  relation: string
  phone: string
}

export type ItemKind = 'task' | 'event' | 'ride'

/**
 * The product's whole argument lives here: an item is not done because someone
 * typed it, it is done because a named person answered for it.
 */
export type Status =
  | 'unowned'      // nobody has it
  | 'waiting'      // assigned, no answer yet
  | 'accepted'     // answered yes
  | 'declined'     // answered no, with a reason
  | 'asked-out'    // a text went to someone with no account
  | 'handled'      // closed, and visibly so

export type Leg = 'dropoff' | 'pickup'

export interface Assignment {
  owner: PersonId | null
  status: Status
  /** Why a decline was a decline. Never optional in the UI when status is declined. */
  reason?: string
  /** Set when the ask went out over SMS to someone with no account. */
  helperId?: string
  askedAt?: string
  answeredAt?: string
}

export interface Comment {
  id: string
  author: PersonId
  body: string
  at: string
  mentions: PersonId[]
}

export interface ActivityEntry {
  id: string
  at: string
  actor: PersonId | null
  /** Already written as a sentence in the product's voice. */
  text: string
}

export interface ChecklistEntry {
  id: string
  label: string
  done: boolean
}

export interface Item {
  id: string
  kind: ItemKind
  title: string
  /** One line of what this actually is. Not marketing. */
  detail?: string
  place?: string
  /** ISO date, local. Items with no time are a conflict the product flags. */
  date: string
  startTime?: string
  endTime?: string
  priority: boolean
  /** Who the thing is for — a child's game, a parent's errand. */
  forPerson?: PersonId
  createdBy: PersonId
  /** Tasks and events carry one assignment. */
  assignment: Assignment
  /** Rides carry two: drop-off and pickup are separately owned. */
  legs?: Record<Leg, Assignment>
  checklist: ChecklistEntry[]
  comments: Comment[]
  activity: ActivityEntry[]
  repeat?: 'daily' | 'weekly'
  handledAt?: string
  notes?: string
}

/** A child cannot assign work to a parent. They can ask. */
export interface Request {
  id: string
  from: PersonId
  what: string
  byWhen: string
  note?: string
  at: string
  state: 'open' | 'converted' | 'answered'
  reply?: string
  convertedItemId?: string
}

export type ConflictKind = 'overlap' | 'no-time' | 'no-driver'

export interface Conflict {
  kind: ConflictKind
  itemIds: string[]
  text: string
}

export interface Plan {
  people: Person[]
  helpers: Helper[]
  items: Item[]
  requests: Request[]
  /** Who is holding the phone. Drives scope, permissions and tone. */
  viewer: PersonId
  today: string
}
