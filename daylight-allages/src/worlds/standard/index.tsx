import type { WorldDef, HeaderProps, RowProps } from '../types'
import { usePlan } from '../../store/store'
import { clock, relativeDay } from '../../domain/dates'
import {
  deciding, itemStatus, needsAnswer, onDate, personById, STATUS_WORD, visibleItems,
} from '../../domain/rules'
import { PersonMark, StateWord } from '../../ui/bits'
import { Icon } from '../../ui/Icon'
import './standard.css'

function Header({ title, lede, meta, tools }: HeaderProps) {
  const { plan, viewer } = usePlan()
  return (
    <header className="std-head">
      <div className="std-head__top">
        <span className="std-wm">
          <span className="std-wm__mark" aria-hidden="true">
            <Icon name="sun" size={13} strokeWidth={2.4} />
          </span>
          Daylight
        </span>
        <div className="std-head__tools">
          {tools}
          <PersonMark id={viewer.id} name={viewer.name} hue={viewer.hue} size={34} />
        </div>
      </div>
      <h1 className="h1 std-head__h1">{title}</h1>
      <p className="std-head__sub">
        {meta}
        {lede && <> · {lede}</>}
      </p>
      <span className="sr-only">{plan.people.length} people in this family.</span>
    </header>
  )
}

/**
 * The category's own opening: a segmented control over the day, and a count
 * of what is unanswered. No invention — this is the arrangement a visitor
 * already expects, built properly.
 */
function TodaySignature() {
  const { plan } = usePlan()
  const items = onDate(visibleItems(plan, plan.viewer), plan.today)
  const open = items.filter(needsAnswer).length

  return (
    <div className="std-sig">
      <div className="std-segs" role="tablist" aria-label="Scope">
        <button role="tab" aria-selected="true" className="is-on">Today</button>
        <button role="tab" aria-selected="false">Tomorrow</button>
        <button role="tab" aria-selected="false">This week</button>
      </div>
      <div className="std-summary">
        <span className="std-summary__n tnum">{open}</span>
        <span className="std-summary__t">
          {open === 1 ? 'item needs an answer' : 'items need an answer'}
          <em>{items.length - open} already settled today</em>
        </span>
      </div>
    </div>
  )
}

function Row({ item, onOpen }: RowProps) {
  const { plan } = usePlan()
  const s = itemStatus(item)
  const ownerId = deciding(item).owner
  const owner = ownerId ? personById(plan, ownerId) : null

  return (
    <button className="std-card" onClick={onOpen}>
      <span className="std-card__top">
        <StateWord
          status={s}
          word={
            s === 'waiting' && owner ? `Waiting on ${owner.name}`
            : s === 'unowned' ? 'No owner'
            : s === 'declined' && owner ? `${owner.name} said no`
            : STATUS_WORD[s]
          }
        />
        <span className="std-card__when tnum">
          {item.startTime ? clock(item.startTime) : relativeDay(item.date, plan.today)}
        </span>
      </span>

      <span className="std-card__title">{item.title}</span>
      {(item.place || item.detail) && (
        <span className="std-card__meta">{item.place ?? item.detail}</span>
      )}

      <span className="std-card__owner">
        {owner
          ? <PersonMark id={owner.id} name={owner.name} hue={owner.hue} size={26} />
          : <PersonMark size={26} />}
        <span className="std-card__ownerText">
          {owner ? <><b>{owner.name}</b>{s === 'waiting' ? ' has not answered' : ''}</>
                 : 'Nobody has taken this yet'}
        </span>
        <Icon name="chevron-right" size={17} className="std-card__go" />
      </span>
    </button>
  )
}

export const standard: WorldDef = {
  id: 'standard',
  name: 'Standard',
  lineage: 'The category standard, played straight',
  thesis: 'What a family organiser ships — executed better than any of them do it.',
  swatch: ['#ffffff', '#2f5fd0', '#14714a', '#101418'],
  Header,
  TodaySignature,
  Row,
}
