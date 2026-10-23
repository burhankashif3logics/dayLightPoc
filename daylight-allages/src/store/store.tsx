import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState,
  type ReactNode,
} from 'react'
import type { Item, Leg, PersonId, Plan, Request } from '../domain/types'
import { seedPlan } from '../domain/seed'
import { TODAY } from '../domain/dates'
import { personById } from '../domain/rules'

const KEY = 'daylight-allages/plan/v1'

type Action =
  | { type: 'accept'; id: string; leg: Leg | null }
  | { type: 'decline'; id: string; leg: Leg | null; reason: string }
  | { type: 'reassign'; id: string; leg: Leg | null; to: PersonId }
  | { type: 'claim'; id: string; leg: Leg | null }
  | { type: 'ask-out'; id: string; leg: Leg | null; helperId: string }
  | { type: 'record-reply'; id: string; leg: Leg | null; accepted: boolean }
  | { type: 'handle'; id: string }
  | { type: 'reopen'; id: string }
  | { type: 'toggle-check'; id: string; checkId: string }
  | { type: 'comment'; id: string; body: string }
  | { type: 'answer-request'; requestId: string; reply: string }
  | { type: 'convert-request'; requestId: string; owner: PersonId | null }
  | { type: 'add-request'; what: string; byWhen: string; note?: string }
  | { type: 'viewer'; id: PersonId }
  | { type: 'reset' }

let seq = 0
const nid = (p: string) => `${p}-${Date.now().toString(36)}-${++seq}`
const now = () => `${TODAY}T09:42`

function withAssignment(
  item: Item,
  leg: Leg | null,
  fn: (a: Item['assignment']) => Item['assignment'],
): Item {
  if (leg && item.legs) {
    return { ...item, legs: { ...item.legs, [leg]: fn(item.legs[leg]) } }
  }
  return { ...item, assignment: fn(item.assignment) }
}

function log(item: Item, text: string, actor: PersonId | null): Item {
  return {
    ...item,
    activity: [...item.activity, { id: nid('act'), at: now(), actor, text }],
  }
}

function mapItem(plan: Plan, id: string, fn: (i: Item) => Item): Plan {
  return { ...plan, items: plan.items.map((i) => (i.id === id ? fn(i) : i)) }
}

function reduce(plan: Plan, action: Action): Plan {
  const viewer = plan.viewer
  const name = (id: PersonId) => personById(plan, id).name
  const legWord = (leg: Leg | null) => (leg === 'dropoff' ? ' drop-off' : leg === 'pickup' ? ' pickup' : '')

  switch (action.type) {
    case 'accept':
      return mapItem(plan, action.id, (i) =>
        log(
          withAssignment(i, action.leg, (a) => ({
            ...a, owner: a.owner ?? viewer, status: 'accepted', answeredAt: now(), reason: undefined,
          })),
          `${name(viewer)} accepted the${legWord(action.leg) || ' task'}.`,
          viewer,
        ))

    case 'decline':
      return mapItem(plan, action.id, (i) =>
        log(
          withAssignment(i, action.leg, (a) => ({
            ...a, status: 'declined', reason: action.reason, answeredAt: now(),
          })),
          `${name(viewer)} declined: “${action.reason}”`,
          viewer,
        ))

    case 'reassign':
      return mapItem(plan, action.id, (i) =>
        log(
          withAssignment(i, action.leg, () => ({
            owner: action.to, status: 'waiting', askedAt: now(),
          })),
          `${name(viewer)} asked ${name(action.to)} to take the${legWord(action.leg) || ' task'}.`,
          viewer,
        ))

    case 'claim':
      return mapItem(plan, action.id, (i) =>
        log(
          withAssignment(i, action.leg, () => ({
            owner: viewer, status: 'accepted', answeredAt: now(),
          })),
          `${name(viewer)} took the${legWord(action.leg) || ' task'}.`,
          viewer,
        ))

    case 'ask-out': {
      const helper = plan.helpers.find((h) => h.id === action.helperId)
      return mapItem(plan, action.id, (i) =>
        log(
          withAssignment(i, action.leg, () => ({
            owner: null, status: 'asked-out', helperId: action.helperId, askedAt: now(),
          })),
          `${name(viewer)} texted ${helper?.name ?? 'someone'} about the${legWord(action.leg) || ' task'}. Waiting on a reply.`,
          viewer,
        ))
    }

    case 'record-reply':
      return mapItem(plan, action.id, (i) => {
        const helperId = (action.leg && i.legs ? i.legs[action.leg] : i.assignment).helperId
        const helper = plan.helpers.find((h) => h.id === helperId)
        return log(
          withAssignment(i, action.leg, (a) =>
            action.accepted
              ? { ...a, status: 'accepted', answeredAt: now() }
              : { ...a, status: 'unowned', owner: null, helperId: undefined, answeredAt: now() },
          ),
          action.accepted
            ? `${name(viewer)} recorded that ${helper?.name ?? 'they'} said yes.`
            : `${name(viewer)} recorded that ${helper?.name ?? 'they'} could not do it.`,
          viewer,
        )
      })

    case 'handle':
      return mapItem(plan, action.id, (i) =>
        log({ ...i, handledAt: now() }, `${name(viewer)} marked this handled.`, viewer))

    case 'reopen':
      return mapItem(plan, action.id, (i) =>
        log({ ...i, handledAt: undefined }, `${name(viewer)} put this back on the plan.`, viewer))

    case 'toggle-check':
      return mapItem(plan, action.id, (i) => ({
        ...i,
        checklist: i.checklist.map((c) =>
          c.id === action.checkId ? { ...c, done: !c.done } : c),
      }))

    case 'comment':
      return mapItem(plan, action.id, (i) => ({
        ...i,
        comments: [...i.comments, {
          id: nid('cm'), author: viewer, body: action.body, at: now(),
          mentions: plan.people.filter((p) => action.body.includes(`@${p.name.toLowerCase()}`)).map((p) => p.id),
        }],
      }))

    case 'answer-request':
      return {
        ...plan,
        requests: plan.requests.map((r) =>
          r.id === action.requestId ? { ...r, state: 'answered', reply: action.reply } : r),
      }

    case 'convert-request': {
      const req = plan.requests.find((r) => r.id === action.requestId)
      if (!req) return plan
      const item: Item = {
        id: nid('item'),
        kind: 'task',
        title: req.what,
        detail: req.note,
        date: req.byWhen,
        priority: false,
        forPerson: req.from,
        createdBy: viewer,
        assignment: action.owner
          ? { owner: action.owner, status: action.owner === viewer ? 'accepted' : 'waiting', askedAt: now() }
          : { owner: null, status: 'unowned' },
        checklist: [],
        comments: [],
        activity: [{
          id: nid('act'), at: now(), actor: viewer,
          text: `${name(viewer)} made this from ${name(req.from)}’s request.`,
        }],
      }
      return {
        ...plan,
        items: [...plan.items, item],
        requests: plan.requests.map((r) =>
          r.id === action.requestId ? { ...r, state: 'converted', convertedItemId: item.id } : r),
      }
    }

    case 'add-request': {
      const req: Request = {
        id: nid('req'), from: viewer, what: action.what,
        byWhen: action.byWhen, note: action.note, at: now(), state: 'open',
      }
      return { ...plan, requests: [req, ...plan.requests] }
    }

    case 'viewer':
      return { ...plan, viewer: action.id }

    case 'reset':
      return structuredClone(seedPlan)
  }
}

function load(): Plan {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Plan
  } catch { /* a blocked or empty store just means we start from the seed */ }
  return structuredClone(seedPlan)
}

interface Ctx {
  plan: Plan
  dispatch: (a: Action) => void
  viewer: Plan['people'][number]
}
const PlanContext = createContext<Ctx | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, dispatch] = useReducer(reduce, undefined, load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(plan)) } catch { /* nothing to do */ }
  }, [plan])

  const viewer = useMemo(() => personById(plan, plan.viewer), [plan])
  const value = useMemo(() => ({ plan, dispatch, viewer }), [plan, viewer])
  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan(): Ctx {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider')
  return ctx
}

/** Small helper for the sheets, which all open and close the same way. */
export function useSheet<T>() {
  const [open, setOpen] = useState<T | null>(null)
  return {
    open,
    show: useCallback((v: T) => setOpen(v), []),
    hide: useCallback(() => setOpen(null), []),
  }
}
