import { useState } from 'react'
import { usePlan, useSheet } from '../store/store'
import { useWorld } from '../worlds'
import {
  assignmentsOf, conflicts, isOpen, itemStatus, needsAnswer, openFor, ownersOf,
  personById, STATUS_WORD, visibleItems,
} from '../domain/rules'
import { relativeDayInline } from '../domain/dates'
import type { PersonId } from '../domain/types'
import { Empty, Flag, Mark, PersonMark, SectionHead, StateWord } from '../ui/bits'
import { Icon } from '../ui/Icon'
import { AnswerRequestSheet } from '../ui/sheets'

type Filter = 'all' | 'open' | 'rides' | 'unowned' | PersonId

export function Family({ onOpen }: { onOpen: (id: string) => void }) {
  const { plan, viewer } = usePlan()
  const { world } = useWorld()
  const { Header, Row } = world
  const [filter, setFilter] = useState<Filter>('open')
  const answering = useSheet<string>()

  const all = visibleItems(plan, plan.viewer).filter(isOpen)
  const flags = conflicts(plan, plan.today, 7)
  const openRequests = plan.requests.filter((r) => r.state === 'open')

  const shown = all.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'open') return needsAnswer(item)
    if (filter === 'rides') return item.kind === 'ride'
    if (filter === 'unowned') return itemStatus(item) === 'unowned'
    return ownersOf(item).includes(filter)
  }).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: 'open', label: 'Unanswered', count: all.filter(needsAnswer).length },
    { id: 'all', label: 'Everything', count: all.length },
    { id: 'rides', label: 'Rides', count: all.filter((i) => i.kind === 'ride').length },
    ...plan.people.map((p) => ({
      id: p.id as Filter,
      label: p.name,
      count: openFor(all, p.id).length,
    })),
  ]

  return (
    <div className="screen">
      <Header
        title="The family"
        meta={`${all.length} open`}
        lede={
          <>
            Who is carrying what. <b>{all.filter(needsAnswer).length} without an answer.</b>
          </>
        }
      />

      {/* who is carrying what, at a glance */}
      <div className="loadRow">
        {plan.people.map((p) => {
          const theirs = openFor(all, p.id)
          const waiting = theirs.filter((i) =>
            assignmentsOf(i).some((a) => a.owner === p.id && a.status === 'waiting')).length
          return (
            <button
              key={p.id}
              className={`loadRow__who${filter === p.id ? ' is-on' : ''}`}
              onClick={() => setFilter(filter === p.id ? 'open' : p.id)}
              aria-pressed={filter === p.id}
            >
              <PersonMark id={p.id} name={p.name} hue={p.hue} size={34} />
              <span className="loadRow__name">{p.name}</span>
              <span className={`loadRow__n tnum${waiting ? ' is-waiting' : ''}`}>
                {theirs.length}{waiting ? ` · ${waiting} to answer` : ''}
              </span>
            </button>
          )
        })}
        <button
          className={`loadRow__who${filter === 'unowned' ? ' is-on' : ''}`}
          onClick={() => setFilter(filter === 'unowned' ? 'open' : 'unowned')}
          aria-pressed={filter === 'unowned'}
        >
          <PersonMark size={34} />
          <span className="loadRow__name">No one</span>
          <span className="loadRow__n tnum is-waiting">
            {all.filter((i) => itemStatus(i) === 'unowned').length}
          </span>
        </button>
      </div>

      <div className="filters scroll" role="tablist" aria-label="Filter the family plan">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`chip${filter === f.id ? ' is-on' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.count !== undefined && <em className="chip__n tnum">{f.count}</em>}
          </button>
        ))}
      </div>

      <div className="screen__scroll scroll">
        {filter === 'open' && flags.map((c, i) => (
          <Flag
            key={i}
            tone={c.kind === 'no-driver' ? 'declined' : 'waiting'}
            onAct={() => onOpen(c.itemIds[0])}
          >
            {c.text}
          </Flag>
        ))}

        {openRequests.length > 0 && viewer.role !== 'child' && (
          <>
            <SectionHead
              label="Asked for by the kids"
              right={<span className="sectionLabel tnum">{openRequests.length}</span>}
            />
            <div className="rows">
              {openRequests.map((r) => {
                const from = personById(plan, r.from)
                return (
                  <button key={r.id} className="reqRow" onClick={() => answering.show(r.id)}>
                    <PersonMark id={from.id} name={from.name} hue={from.hue} size={30} />
                    <span className="reqRow__main">
                      <span className="title">{r.what}</span>
                      <span className="fine">
                        {from.name} · by {relativeDayInline(r.byWhen, plan.today)}
                      </span>
                    </span>
                    <StateWord status="unowned" word="Answer" />
                  </button>
                )
              })}
            </div>
          </>
        )}

        <SectionHead
          label={
            filter === 'open' ? 'Without an answer'
            : filter === 'all' ? 'Everything open'
            : filter === 'rides' ? 'Rides'
            : filter === 'unowned' ? 'Nobody has taken these'
            : `${personById(plan, filter as PersonId).name} is carrying`
          }
          right={<span className="sectionLabel tnum">{shown.length}</span>}
        />

        {shown.length > 0 ? (
          <div className="rows">
            {shown.map((item) => (
              <Row key={item.id} item={item} onOpen={() => onOpen(item.id)} />
            ))}
          </div>
        ) : (
          <Empty icon="family">
            <p>
              {filter === 'open'
                ? 'Every open item has a name and an answer.'
                : filter === 'unowned'
                  ? 'Everything has a name on it.'
                  : 'Nothing here.'}
            </p>
            <p>Try another filter above.</p>
          </Empty>
        )}

        {/* what went out to people with no account */}
        {all.some((i) => assignmentsOf(i).some((a) => a.status === 'asked-out')) && (
          <>
            <SectionHead label="Waiting on someone outside" />
            <div className="rows">
              {all.filter((i) => assignmentsOf(i).some((a) => a.status === 'asked-out')).map((item) => {
                const a = assignmentsOf(item).find((x) => x.status === 'asked-out')!
                const helper = plan.helpers.find((h) => h.id === a.helperId)
                return (
                  <button key={item.id} className="miniRow" onClick={() => onOpen(item.id)}>
                    <Mark status="asked-out" sm />
                    <span className="miniRow__title">{item.title}</span>
                    <span className="miniRow__day">{helper?.name ?? 'Texted'}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {viewer.role === 'child' && (
          <p className="handledHint">
            <Icon name="person" size={16} />
            You see your own things here. {STATUS_WORD.unowned.toLowerCase()} items belong to a parent to sort out.
          </p>
        )}
      </div>

      {answering.open && (
        <AnswerRequestSheet requestId={answering.open} onClose={answering.hide} />
      )}
    </div>
  )
}
