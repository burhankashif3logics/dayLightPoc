import type { WorldDef, HeaderProps, RowProps } from '../types'
import { usePlan } from '../../store/store'
import { clock24, elapsed, relativeDay } from '../../domain/dates'
import {
  assignmentsOf, deciding, itemStatus, needsAnswer, onDate, personById,
  STATUS_WORD, visibleItems,
} from '../../domain/rules'
import { Mark, StateWord } from '../../ui/bits'
import { Icon } from '../../ui/Icon'
import './departures.css'

function Header({ title, lede, meta, tools }: HeaderProps) {
  return (
    <header className="dep-head">
      <div className="dep-head__top">
        <span className="dep-wm">Day<b>light</b></span>
        <div className="dep-head__tools">
          {meta && <span className="dep-head__clock tnum">{meta}</span>}
          {tools}
        </div>
      </div>
      <h1 className="h1 dep-head__h1">{title}</h1>
      {lede && <p className="dep-head__lede">{lede}</p>}
    </header>
  )
}

/**
 * The signature move: the next thing nobody has answered for, raised out of
 * the board as a lead panel with its status plate and how long it has sat.
 * Elapsed time is the product's honest pressure — no nagging, just the clock.
 */
function TodaySignature() {
  const { plan } = usePlan()
  const items = onDate(visibleItems(plan, plan.viewer), plan.today)
  const lead = items.find(needsAnswer)

  if (!lead) {
    return (
      <section className="dep-lead dep-lead--clear">
        <Mark status="accepted" />
        <div>
          <p className="dep-lead__clearTitle">Everything today has an answer.</p>
          <p className="dep-lead__clearSub">Nothing is waiting on anyone.</p>
        </div>
      </section>
    )
  }

  const s = itemStatus(lead)
  const asked = assignmentsOf(lead).find((a) => a.status === 'waiting')
  const owner = deciding(lead).owner

  return (
    <section className="dep-lead" aria-label="The next thing without an answer">
      <div className="dep-lead__plate">
        <StateWord status={s} />
        {asked?.askedAt && (
          <span className="dep-lead__since">
            asked {personById(plan, owner!).name} {elapsed(asked.askedAt)}
          </span>
        )}
        {s === 'unowned' && <span className="dep-lead__since">nobody has taken this</span>}
      </div>
      <h2 className="dep-lead__title">{lead.title}</h2>
      <p className="dep-lead__meta tnum">
        {lead.startTime ? clock24(lead.startTime) : relativeDay(lead.date, plan.today)}
        {lead.place && <> · {lead.place}</>}
        {lead.forPerson && <> · for <b>{personById(plan, lead.forPerson).name}</b></>}
      </p>
    </section>
  )
}

function Row({ item, onOpen }: RowProps) {
  const { plan } = usePlan()
  const s = itemStatus(item)
  const ownerId = deciding(item).owner
  const owner = ownerId ? personById(plan, ownerId) : null
  const who = owner ? owner.name : s === 'asked-out' ? 'Outside' : 'No one'

  return (
    <button className="dep-row" onClick={onOpen}>
      <span className="dep-row__time tnum">
        {item.startTime ? clock24(item.startTime) : '—'}
        {!item.startTime && (
          <em>{item.date === plan.today ? 'no time' : relativeDay(item.date, plan.today)}</em>
        )}
      </span>
      <span className="dep-row__what">
        <span className="dep-row__title">
          {item.kind === 'ride' && <Icon name="car" size={15} />}
          {item.title}
        </span>
        {(item.place || item.detail) && (
          <span className="dep-row__sub">{item.place ?? item.detail}</span>
        )}
      </span>
      <span className="dep-row__end">
        <span className={`dep-row__who${owner ? '' : ' is-none'}`}>
          {owner && <i style={{ background: `var(--people-${owner.hue + 1})` }} />}
          {who}
        </span>
        <span className="dep-row__st">
          <Mark status={s} sm />
          <em>{STATUS_WORD[s]}</em>
        </span>
      </span>
    </button>
  )
}

export const departures: WorldDef = {
  id: 'departures',
  name: 'Departures',
  lineage: 'Public transport signage programs',
  thesis: 'Every obligation has a time, a destination and a named driver.',
  swatch: ['#11151a', '#f5a623', '#4ec8d6', '#f6f8fa'],
  Header,
  TodaySignature,
  Row,
}
