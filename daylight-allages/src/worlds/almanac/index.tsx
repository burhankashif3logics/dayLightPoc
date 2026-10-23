import type { WorldDef, HeaderProps, RowProps } from '../types'
import { usePlan } from '../../store/store'
import {
  clockParts, minutes, relativeDay, SUNRISE, SUNSET, TODAY, weekdayShort, monthDay,
} from '../../domain/dates'
import {
  deciding, itemStatus, onDate, ownersOf, personById, STATUS_WORD, visibleItems,
} from '../../domain/rules'
import { Mark } from '../../ui/bits'
import { Icon } from '../../ui/Icon'
import type { Item } from '../../domain/types'
import './almanac.css'

function Header({ title, lede, meta, tools }: HeaderProps) {
  return (
    <header className="alm-mast">
      <div className="alm-mast__top">
        <span className="alm-wm">Day<b>light</b></span>
        <div className="alm-mast__tools">
          {meta && <span className="alm-mast__date">{meta}</span>}
          {tools}
        </div>
      </div>
      <h1 className="h1 alm-mast__h1">{title}</h1>
      {lede && <p className="alm-mast__lede">{lede}</p>}
    </header>
  )
}

/**
 * The signature move: the day drawn as a forecast band from sun-up to
 * sun-down, every obligation pinned at its hour. Unanswered work is hatched,
 * so an open day has a visible texture before you read a single word.
 */
function TodaySignature() {
  const { plan } = usePlan()
  const items = onDate(visibleItems(plan, plan.viewer), plan.today)
  const timed = items.filter((i) => i.startTime)
  const untimed = items.filter((i) => !i.startTime)

  // The band runs 6am to 9pm — the hours a family day actually occupies.
  const START = 6 * 60
  const END = 21 * 60
  const at = (mins: number) => ((mins - START) / (END - START)) * 100
  const sunUp = at(minutes(SUNRISE)!)
  const sunDown = at(minutes(SUNSET)!)

  return (
    <section className="alm-band" aria-label="Today from sun-up to sun-down">
      <div className="alm-band__head">
        <span className="alm-band__sun">
          <Icon name="sun" size={14} strokeWidth={2} /> Up {clockParts(SUNRISE).t}
        </span>
        <span className="alm-band__sun">Down {clockParts(SUNSET).t} {clockParts(SUNSET).ampm}</span>
      </div>

      <div className="alm-band__track">
        <div
          className="alm-band__day"
          style={{ left: `${sunUp}%`, right: `${100 - sunDown}%` }}
        />
        {[9, 12, 15, 18].map((h) => (
          <div key={h} className="alm-band__tick" style={{ left: `${at(h * 60)}%` }}>
            <span className="alm-band__hour">
              {h > 12 ? h - 12 : h}{h >= 12 ? 'p' : 'a'}
            </span>
          </div>
        ))}
        {timed.map((item) => {
          const s = itemStatus(item)
          const pos = Math.min(96, Math.max(4, at(minutes(item.startTime)!)))
          return (
            <span
              key={item.id}
              className={`alm-pin alm-pin--${s}`}
              style={{ left: `${pos}%` }}
              title={`${clockParts(item.startTime).t} — ${item.title} (${STATUS_WORD[s]})`}
            >
              {item.kind === 'ride'
                ? <Icon name="car" size={13} strokeWidth={2} />
                : clockParts(item.startTime).t.split(':')[0]}
            </span>
          )
        })}
      </div>

      {untimed.length > 0 && (
        <p className="alm-band__foot">
          {untimed.length === 1 ? 'One thing has' : `${untimed.length} things have`} no time on
          {untimed.length === 1 ? ' it' : ' them'} yet, so nothing is pinned.
        </p>
      )}
    </section>
  )
}

/** The key is permanent, and it is the all-ages affordance: learn it once. */
function Legend() {
  const keys = ['accepted', 'waiting', 'unowned', 'declined'] as const
  return (
    <div className="alm-key" aria-label="What the symbols mean">
      {keys.map((k) => (
        <div key={k} className="alm-key__cell">
          <Mark status={k} sm />
          <span>{STATUS_WORD[k]}</span>
        </div>
      ))}
    </div>
  )
}

function Row({ item, onOpen }: RowProps) {
  const { plan } = usePlan()
  const s = itemStatus(item)
  const { t, ampm } = clockParts(item.startTime)
  const owners = ownersOf(item)
  const lead = deciding(item).owner
  const open = s === 'waiting' || s === 'unowned' || s === 'declined'

  return (
    <button className={`row alm-row${open ? ' row--open' : ''}`} onClick={onOpen}>
      <span className="alm-row__time tnum">
        {t}
        {ampm && <em>{ampm}</em>}
        {!item.startTime && (
          <em>{item.date === plan.today ? 'no time' : relativeDay(item.date, plan.today)}</em>
        )}
      </span>
      <Mark status={s} />
      <span className="alm-row__main">
        <span className="title">{item.title}</span>
        {item.place && (
          <span className="alm-row__sub">
            <Icon name={item.kind === 'ride' ? 'car' : 'pin'} size={14} />
            {item.place}
          </span>
        )}
        <span className="alm-row__owner">
          {s === 'unowned' ? 'Nobody has taken this'
            : s === 'waiting' && lead ? `Waiting on ${personById(plan, lead).name}`
            : s === 'declined' && lead ? `${personById(plan, lead).name} said no`
            : s === 'asked-out' ? 'Texted someone outside the family'
            : owners.map((o) => personById(plan, o).name).join(' & ') || 'Outside the family'}
        </span>
      </span>
      <Icon name="chevron-right" size={17} className="alm-row__go" />
    </button>
  )
}

export function AlmanacDayStrip({ dates, active, onPick, countFor }: {
  dates: string[]
  active: string
  onPick: (d: string) => void
  countFor: (d: string) => { open: number; total: number }
}) {
  return (
    <div className="alm-strip" role="tablist" aria-label="Pick a day">
      {dates.map((d) => {
        const { open, total } = countFor(d)
        return (
          <button
            key={d}
            role="tab"
            aria-selected={d === active}
            className={`alm-strip__day${d === active ? ' is-on' : ''}${d === TODAY ? ' is-today' : ''}`}
            onClick={() => onPick(d)}
          >
            <span className="alm-strip__dow">{weekdayShort(d)}</span>
            <span className="alm-strip__num tnum">{monthDay(d).split(' ')[1]}</span>
            <span className={`alm-strip__load${open ? ' has-open' : ''}`}>
              {total ? `${total}` : '—'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function almanacCountFor(items: Item[], date: string) {
  const day = items.filter((i) => i.date === date && !i.handledAt)
  return {
    total: day.length,
    open: day.filter((i) => ['unowned', 'waiting', 'declined'].includes(itemStatus(i))).length,
  }
}

export const almanac: WorldDef = {
  id: 'almanac',
  name: 'Almanac',
  lineage: 'The newspaper weather page and its key',
  thesis: 'The day read as a forecast: conditions reported, never praised.',
  swatch: ['#1b2a31', '#f6f3ea', '#c47d0c', '#115d52'],
  Header,
  TodaySignature,
  Row,
  Legend,
}
