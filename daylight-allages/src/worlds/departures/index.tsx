import type { WorldDef, HeaderProps, RowProps } from '../types'
import { usePlan, useSheet } from '../../store/store'
import { clock24, elapsed, relativeDay } from '../../domain/dates'
import {
  assignmentsOf, deciding, itemStatus, needsAnswer, onDate, personById,
  STATUS_WORD, visibleItems,
} from '../../domain/rules'
import { Mark, StateWord } from '../../ui/bits'
import { Icon } from '../../ui/Icon'
import { ReassignSheet, type Target } from '../../ui/sheets'
import './departures.css'

function Header({ title, lede, meta, tools }: HeaderProps) {
  return (
    <header className="dep-head">
      <div className="dep-head__top">
        <span className="dep-wm">Day<b>light</b></span>
        <div className="dep-head__tools">
          {tools}
        </div>
      </div>
      <div className="dep-head__heading">
        <h1 className="h1 dep-head__h1">{title}</h1>
        {meta && <span className="dep-head__clock tnum">{meta}</span>}
      </div>
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
  const { plan, viewer } = usePlan()
  const reassigning = useSheet<Target>()
  const s = itemStatus(item)
  const ownerId = deciding(item).owner
  const owner = ownerId ? personById(plan, ownerId) : null
  const who = owner ? owner.name : s === 'asked-out' ? 'Outside' : null
  const canAssign = viewer.role !== 'child' && !item.legs && (s === 'unowned' || s === 'declined')
  const action = s === 'declined' ? 'Reassign' : 'Assign'

  return (
    <>
      <div className={`dep-row${canAssign ? ' dep-row--action' : ''}`}>
        <button className="dep-row__open" onClick={onOpen}>
          <span className={`dep-row__time tnum${item.startTime ? '' : ' dep-row__time--unset'}`}>
            {item.startTime ? clock24(item.startTime) : 'No time'}
          </span>
          <span className="dep-row__what">
            <span className="dep-row__title">
              {item.kind === 'ride' && <Icon name="car" size={17} />}
              {item.title}
            </span>
            {(item.place || item.detail) && (
              <span className="dep-row__sub">{item.place ?? item.detail}</span>
            )}
          </span>
          <span className="dep-row__end">
            {who && (
              <span className="dep-row__who">
                {owner && <i style={{ background: `var(--people-${owner.hue + 1})` }} aria-hidden="true" />}
                {who}
              </span>
            )}
            <span className="dep-row__st">
              <span aria-hidden="true"><Mark status={s} sm /></span>
              <span>{s === 'unowned' ? 'Unassigned' : STATUS_WORD[s]}</span>
            </span>
          </span>
        </button>
        {canAssign && (
          <button
            className="dep-row__action"
            aria-label={`${action}: ${item.title}`}
            onClick={() => reassigning.show({ item, leg: null })}
          >
            {action}<Icon name="chevron-right" size={16} />
          </button>
        )}
      </div>
      {reassigning.open && <ReassignSheet target={reassigning.open} onClose={reassigning.hide} />}
    </>
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
