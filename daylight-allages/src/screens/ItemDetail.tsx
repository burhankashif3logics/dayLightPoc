import { useState } from 'react'
import { usePlan, useSheet } from '../store/store'
import { useWorld } from '../worlds'
import type { Leg } from '../domain/types'
import {
  canDelete, itemStatus, LEG_LABEL, personById, statusSentence,
} from '../domain/rules'
import { clock, elapsed, relativeDay, weekdayLong } from '../domain/dates'
import { Mark, PersonMark, StateWord } from '../ui/bits'
import { Icon } from '../ui/Icon'
import { AskOutSheet, DeclineSheet, ReassignSheet, type Target } from '../ui/sheets'

export function ItemDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { plan, dispatch, viewer } = usePlan()
  const { world } = useWorld()
  const item = plan.items.find((i) => i.id === id)
  const declining = useSheet<Target>()
  const reassigning = useSheet<Target>()
  const askingOut = useSheet<Target>()
  const [comment, setComment] = useState('')

  if (!item) return null
  const status = itemStatus(item)
  const legs: (Leg | null)[] = item.legs ? ['dropoff', 'pickup'] : [null]

  return (
    <div className="screen detail">
      <header className="detail__bar">
        <button className="iconBtn" onClick={onBack} aria-label="Back">
          <Icon name="chevron-left" size={22} />
        </button>
        <span className="detail__kind">
          {item.kind === 'ride' ? 'Ride' : item.kind === 'event' ? 'Event' : 'Task'}
          {item.repeat && <> · repeats {item.repeat}</>}
        </span>
        {item.priority && (
          <span className="detail__priority">
            <Icon name="flag" size={15} strokeWidth={2} /> Important
          </span>
        )}
      </header>

      <div className="screen__scroll scroll">
        <div className="detail__head">
          <h1 className="h1">{item.title}</h1>
          {item.detail && <p className="detail__detail">{item.detail}</p>}

          <dl className="detail__facts">
            <div>
              <dt>When</dt>
              <dd className="tnum">
                {relativeDay(item.date, plan.today)}
                {relativeDay(item.date, plan.today) !== weekdayLong(item.date) && `, ${weekdayLong(item.date)}`}
                {item.startTime && ` · ${clock(item.startTime)}`}
                {item.endTime && ` – ${clock(item.endTime)}`}
                {!item.startTime && ' · no time set'}
              </dd>
            </div>
            {item.place && (
              <div>
                <dt>Where</dt>
                <dd>{item.place}</dd>
              </div>
            )}
            {item.forPerson && (
              <div>
                <dt>For</dt>
                <dd>{personById(plan, item.forPerson).name}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* ── the answer, per leg ── */}
        <section className="detail__legs">
          {legs.map((leg) => {
            const a = leg && item.legs ? item.legs[leg] : item.assignment
            const helper = plan.helpers.find((h) => h.id === a.helperId)
            const isMine = a.owner === plan.viewer
            const canAnswer = isMine && (a.status === 'waiting' || a.status === 'declined')
            const target: Target = { item, leg }

            return (
              <div key={leg ?? 'single'} className="leg">
                <div className="leg__top">
                  {leg && (
                    <span className="leg__name">
                      <Icon name="car" size={16} /> {LEG_LABEL[leg]}
                    </span>
                  )}
                  <StateWord status={a.status} />
                  {a.status === 'waiting' && a.askedAt && (
                    <span className="leg__since">{elapsed(a.askedAt)}</span>
                  )}
                </div>

                <div className="leg__who">
                  {helper
                    ? <PersonMark helper={helper.name} size={34} />
                    : a.owner
                      ? <PersonMark
                          id={a.owner}
                          name={personById(plan, a.owner).name}
                          hue={personById(plan, a.owner).hue}
                          size={34}
                        />
                      : <PersonMark size={34} />}
                  <p className="leg__sentence">{statusSentence(a, plan.people, helper?.name)}</p>
                </div>

                {!item.handledAt && (
                  <div className="leg__actions">
                    {/* the answer the person owes, on its own row */}
                    {canAnswer && (
                      <div className="btnRow">
                        <button
                          className="btn btn--yes btn--grow"
                          onClick={() => dispatch({ type: 'accept', id: item.id, leg })}
                        >
                          <Icon name="check" size={17} strokeWidth={2.4} />
                          Yes, I’ve got it
                        </button>
                        <button
                          className="btn btn--no btn--grow"
                          onClick={() => declining.show(target)}
                        >
                          I can’t
                        </button>
                      </div>
                    )}

                    {!canAnswer && (a.status === 'unowned' || a.status === 'declined') && (
                      <button
                        className="btn btn--yes btn--block"
                        onClick={() => dispatch({ type: 'claim', id: item.id, leg })}
                      >
                        <Icon name="hand" size={17} />
                        I’ll take it
                      </button>
                    )}

                    {/* waiting on somebody else: a parent can stop waiting and do it */}
                    {!isMine && a.status === 'waiting' && viewer.role !== 'child' && (
                      <button
                        className="btn btn--yes btn--block"
                        onClick={() => dispatch({ type: 'claim', id: item.id, leg })}
                      >
                        <Icon name="hand" size={17} />
                        I’ll take it instead
                      </button>
                    )}

                    {a.status === 'asked-out' && (
                      <button
                        className="btn btn--plain btn--block"
                        onClick={() => askingOut.show(target)}
                      >
                        <Icon name="message" size={17} />
                        Record {helper?.name ?? 'their'} reply
                      </button>
                    )}

                    {viewer.role !== 'child' && a.status !== 'asked-out' && (
                      <button
                        className="btn btn--plain btn--block"
                        onClick={() => reassigning.show(target)}
                      >
                        <Icon name="repeat" size={17} />
                        Ask someone else
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {item.checklist.length > 0 && (
          <section className="detail__block">
            <h2 className="sectionLabel">What it takes</h2>
            <ul className="check">
              {item.checklist.map((c) => (
                <li key={c.id}>
                  <button
                    className="check__row"
                    aria-pressed={c.done}
                    onClick={() => dispatch({ type: 'toggle-check', id: item.id, checkId: c.id })}
                  >
                    <span className={`check__box${c.done ? ' is-done' : ''}`}>
                      {c.done && <Icon name="check" size={13} strokeWidth={3} />}
                    </span>
                    <span className={c.done ? 'check__label is-done' : 'check__label'}>{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="detail__block">
          <h2 className="sectionLabel">Talk about it</h2>
          {item.comments.length > 0 && (
            <ul className="comments">
              {item.comments.map((c) => {
                const author = personById(plan, c.author)
                return (
                  <li key={c.id} className="comment">
                    <PersonMark id={author.id} name={author.name} hue={author.hue} size={28} />
                    <div>
                      <p className="comment__who">{author.name}</p>
                      <p className="comment__body">{c.body}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="commentBox">
            <input
              className="input"
              value={comment}
              placeholder={`Say something to the family… use @${plan.people[1].name.toLowerCase()} to tag`}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  dispatch({ type: 'comment', id: item.id, body: comment.trim() })
                  setComment('')
                }
              }}
            />
            <button
              className="btn btn--accent"
              disabled={!comment.trim()}
              onClick={() => {
                dispatch({ type: 'comment', id: item.id, body: comment.trim() })
                setComment('')
              }}
            >
              Send
            </button>
          </div>
        </section>

        <section className="detail__block">
          <h2 className="sectionLabel">What has happened</h2>
          <ol className="history">
            {item.activity.map((a) => (
              <li key={a.id}>
                <span className="history__dot" />
                <p>{a.text}</p>
                <span className="history__at tnum">{clock(a.at.slice(11))}</span>
              </li>
            ))}
            {item.activity.length === 0 && <li className="fine">Nothing has happened yet.</li>}
          </ol>
        </section>

        {canDelete(viewer) && (
          <div className="detail__close">
            {item.handledAt ? (
              <button
                className="btn btn--plain btn--block"
                onClick={() => dispatch({ type: 'reopen', id: item.id })}
              >
                Put this back on the plan
              </button>
            ) : (
              <button
                className="btn btn--accent btn--block"
                onClick={() => { dispatch({ type: 'handle', id: item.id }); onBack() }}
              >
                <Icon name="archive" size={18} />
                Mark it handled
              </button>
            )}
            <p className="field__hint" style={{ textAlign: 'center', marginTop: 10 }}>
              {item.handledAt
                ? 'It stays in Handled until you do.'
                : 'It moves to Handled, where everyone can still see it.'}
            </p>
          </div>
        )}

        {viewer.role === 'child' && !item.handledAt && status === 'accepted' && (
          <div className="detail__close">
            <button
              className="btn btn--yes btn--block"
              onClick={() => { dispatch({ type: 'handle', id: item.id }); onBack() }}
            >
              <Icon name="check" size={18} strokeWidth={2.4} />
              I did it
            </button>
          </div>
        )}

        {item.handledAt && (
          <p className="handledHint">
            <Mark status="handled" sm /> Handled {relativeDay(item.handledAt.slice(0, 10), plan.today).toLowerCase()}.
          </p>
        )}
        <div style={{ height: 8 }} aria-hidden="true" />
      </div>

      {declining.open && <DeclineSheet target={declining.open} onClose={declining.hide} />}
      {reassigning.open && <ReassignSheet target={reassigning.open} onClose={reassigning.hide} />}
      {askingOut.open && <AskOutSheet target={askingOut.open} onClose={askingOut.hide} />}
      <span className="sr-only">Shown in the {world.name} world.</span>
    </div>
  )
}
