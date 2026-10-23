import { useState } from 'react'
import { Sheet } from './Sheet'
import { PersonMark } from './bits'
import { Icon } from './Icon'
import { usePlan } from '../store/store'
import type { Item, Leg, PersonId } from '../domain/types'
import { canAssignToOthers, helperMessage, LEG_LABEL, personById } from '../domain/rules'
import { relativeDay, relativeDayInline, shift } from '../domain/dates'

export interface Target { item: Item; leg: Leg | null }

/* ── decline, with a reason, in one tap ─────────────────────── */

const REASONS = [
  'I’m at work then',
  'I’m already driving someone else',
  'I’m out of town',
  'I can do it later, not then',
]

export function DeclineSheet({ target, onClose }: { target: Target; onClose: () => void }) {
  const { dispatch } = usePlan()
  const [picked, setPicked] = useState<string | null>(null)
  const [other, setOther] = useState('')
  const reason = picked ?? other.trim()

  return (
    <Sheet
      title={target.leg ? `Can’t do the ${LEG_LABEL[target.leg].toLowerCase()}` : 'Can’t do this'}
      onClose={onClose}
      foot={
        <button
          className="btn btn--no btn--block"
          disabled={!reason}
          onClick={() => {
            dispatch({ type: 'decline', id: target.item.id, leg: target.leg, reason })
            onClose()
          }}
        >
          Send the no
        </button>
      }
    >
      <p className="body" style={{ marginBottom: 18 }}>
        Say why, so whoever picks this up knows what they are working around.
        Everyone on <b>{target.item.title}</b> sees it.
      </p>

      <div className="field">
        <span className="field__label">Pick a reason</span>
        <div className="chips">
          {REASONS.map((r) => (
            <button
              key={r}
              className="chip"
              aria-pressed={picked === r}
              onClick={() => { setPicked(picked === r ? null : r); setOther('') }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field__label">Or write your own</span>
        <textarea
          className="textarea"
          value={other}
          placeholder="I have the 5 o’clock call and can’t move it."
          onChange={(e) => { setOther(e.target.value); setPicked(null) }}
        />
        <span className="field__hint">This goes on the item’s history, not a notification alone.</span>
      </label>
    </Sheet>
  )
}

/* ── hand it to someone else in the family ──────────────────── */

export function ReassignSheet({ target, onClose }: { target: Target; onClose: () => void }) {
  const { plan, dispatch, viewer } = usePlan()
  const assignable = plan.people.filter(
    (p) => p.id !== viewer.id && (canAssignToOthers(viewer) || p.role !== 'child'),
  )

  return (
    <Sheet title="Ask someone else" onClose={onClose}>
      <p className="body" style={{ marginBottom: 18 }}>
        They get it as a question, not an order — they can say yes or no with a reason.
      </p>
      <ul>
        {assignable.map((p) => (
          <li key={p.id}>
            <button
              className="pickRow"
              onClick={() => {
                dispatch({ type: 'reassign', id: target.item.id, leg: target.leg, to: p.id })
                onClose()
              }}
            >
              <PersonMark id={p.id} name={p.name} hue={p.hue} size={36} />
              <span className="pickRow__main">
                <span className="title">{p.name}</span>
                <span className="fine">
                  {p.role === 'admin' ? 'Family admin' : p.role === 'parent' ? 'Parent' : 'Child'}
                </span>
              </span>
              <Icon name="chevron-right" size={18} />
            </button>
          </li>
        ))}
      </ul>

      <div className="divider"><span>or outside the family</span></div>

      <ul>
        {plan.helpers.map((h) => (
          <li key={h.id}>
            <button
              className="pickRow"
              onClick={() => {
                dispatch({ type: 'ask-out', id: target.item.id, leg: target.leg, helperId: h.id })
                onClose()
              }}
            >
              <PersonMark helper={h.name} size={36} />
              <span className="pickRow__main">
                <span className="title">{h.name}</span>
                <span className="fine">{h.relation} · by text, no account</span>
              </span>
              <Icon name="message" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

/* ── the text that actually leaves the phone ────────────────── */

export function AskOutSheet({ target, onClose }: { target: Target; onClose: () => void }) {
  const { plan, dispatch } = usePlan()
  const assignment = target.leg && target.item.legs
    ? target.item.legs[target.leg]
    : target.item.assignment
  const helper = plan.helpers.find((h) => h.id === assignment.helperId)
  const message = helperMessage(target.item, target.leg, plan.people)

  if (!helper) return null

  return (
    <Sheet
      title={`Waiting on ${helper.name}`}
      onClose={onClose}
      foot={
        <div className="btnRow">
          <button
            className="btn btn--yes btn--grow"
            onClick={() => {
              dispatch({ type: 'record-reply', id: target.item.id, leg: target.leg, accepted: true })
              onClose()
            }}
          >
            They said yes
          </button>
          <button
            className="btn btn--no btn--grow"
            onClick={() => {
              dispatch({ type: 'record-reply', id: target.item.id, leg: target.leg, accepted: false })
              onClose()
            }}
          >
            They can’t
          </button>
        </div>
      }
    >
      <p className="body" style={{ marginBottom: 16 }}>
        {helper.name} has no account and never needs one. This went out as a plain
        text from your phone — record the answer here when it comes back.
      </p>

      <div className="msgCard">
        <div className="msgCard__to">
          <PersonMark helper={helper.name} size={28} />
          <span>
            <b>{helper.name}</b>
            <em>{helper.phone}</em>
          </span>
        </div>
        <p className="msgCard__body">{message}</p>
      </div>

      <p className="field__hint" style={{ marginTop: 14 }}>
        Until you record a reply this stays <b>Asked out</b> on the plan, so it never
        looks handled when it is not.
      </p>
    </Sheet>
  )
}

/* ── a child asks for something ─────────────────────────────── */

export function RequestSheet({ onClose }: { onClose: () => void }) {
  const { plan, dispatch } = usePlan()
  const [what, setWhat] = useState('')
  const [byWhen, setByWhen] = useState(shift(plan.today, 1))
  const [note, setNote] = useState('')

  return (
    <Sheet
      title="Ask a parent"
      onClose={onClose}
      foot={
        <button
          className="btn btn--accent btn--block"
          disabled={!what.trim()}
          onClick={() => {
            dispatch({ type: 'add-request', what: what.trim(), byWhen, note: note.trim() || undefined })
            onClose()
          }}
        >
          Send it
        </button>
      }
    >
      <label className="field">
        <span className="field__label">What do you need?</span>
        <input
          className="input"
          value={what}
          placeholder="Poster board for the project"
          onChange={(e) => setWhat(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field__label">When do you need it?</span>
        <div className="chips">
          {[0, 1, 2, 5].map((d) => {
            const date = shift(plan.today, d)
            return (
              <button
                key={d}
                className="chip"
                aria-pressed={byWhen === date}
                onClick={() => setByWhen(date)}
              >
                {relativeDay(date, plan.today)}
              </button>
            )
          })}
        </div>
      </div>

      <label className="field">
        <span className="field__label">Anything else they should know?</span>
        <textarea
          className="textarea"
          value={note}
          placeholder="The big kind, not the small kind."
          onChange={(e) => setNote(e.target.value)}
        />
        <span className="field__hint">A parent decides what happens next — they can make it a task or just answer you.</span>
      </label>
    </Sheet>
  )
}

/* ── a parent answers one ───────────────────────────────────── */

export function AnswerRequestSheet({
  requestId, onClose,
}: { requestId: string; onClose: () => void }) {
  const { plan, dispatch, viewer } = usePlan()
  const request = plan.requests.find((r) => r.id === requestId)
  const [reply, setReply] = useState('')
  const [owner, setOwner] = useState<PersonId | null>(viewer.id)

  if (!request) return null
  const from = personById(plan, request.from)

  return (
    <Sheet title={`${from.name} asked for this`} onClose={onClose}>
      <div className="msgCard">
        <div className="msgCard__to">
          <PersonMark id={from.id} name={from.name} hue={from.hue} size={28} />
          <span>
            <b>{from.name}</b>
            <em>needs it by {relativeDayInline(request.byWhen, plan.today)}</em>
          </span>
        </div>
        <p className="msgCard__body">{request.what}</p>
        {request.note && <p className="msgCard__note">“{request.note}”</p>}
      </div>

      <div className="field" style={{ marginTop: 22 }}>
        <span className="field__label">Make it a task, owned by</span>
        <div className="chips">
          {plan.people.filter((p) => p.role !== 'child').map((p) => (
            <button
              key={p.id}
              className="chip"
              aria-pressed={owner === p.id}
              onClick={() => setOwner(p.id)}
            >
              {p.name}
            </button>
          ))}
          <button className="chip" aria-pressed={owner === null} onClick={() => setOwner(null)}>
            Nobody yet
          </button>
        </div>
      </div>

      <button
        className="btn btn--accent btn--block"
        onClick={() => { dispatch({ type: 'convert-request', requestId, owner }); onClose() }}
      >
        Put it on the plan
      </button>

      <div className="divider"><span>or just answer</span></div>

      <label className="field">
        <span className="field__label">Reply to {from.name}</span>
        <textarea
          className="textarea"
          value={reply}
          placeholder="We already have one in the hall cupboard."
          onChange={(e) => setReply(e.target.value)}
        />
      </label>
      <button
        className="btn btn--plain btn--block"
        disabled={!reply.trim()}
        onClick={() => { dispatch({ type: 'answer-request', requestId, reply: reply.trim() }); onClose() }}
      >
        Send the reply
      </button>
    </Sheet>
  )
}
