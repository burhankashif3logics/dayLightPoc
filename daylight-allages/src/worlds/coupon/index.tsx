import type { WorldDef, HeaderProps, RowProps } from '../types'
import type { Status } from '../../domain/types'
import { usePlan } from '../../store/store'
import { clockParts, relativeDay } from '../../domain/dates'
import {
  deciding, itemStatus, needsAnswer, onDate, personById, visibleItems,
} from '../../domain/rules'
import { Icon } from '../../ui/Icon'
import './coupon.css'

/**
 * The signature move of the first POC, carried across intact: a state change
 * stamps itself onto the ticket rather than rewriting a row. The word is the
 * state; colour only confirms it.
 */
const STAMP_WORD: Record<Status, string> = {
  unowned: 'UNCLAIMED',
  waiting: 'WAITING',
  accepted: 'ACCEPTED',
  declined: 'DECLINED',
  'asked-out': 'SENT OUT',
  handled: 'HANDLED',
}

export function Stamp({
  status, sm, tilt = -7,
}: { status: Status; sm?: boolean; tilt?: number }) {
  return (
    <span
      className={`cpn-stamp cpn-stamp--${status}${sm ? ' cpn-stamp--sm' : ''}`}
      style={{ ['--tilt' as string]: `${tilt}deg` }}
    >
      {STAMP_WORD[status]}
    </span>
  )
}

/**
 * A coupon carries a printed code, not a slug. Two letters for the kind and a
 * stable four-digit serial, so the same item always prints the same ticket.
 */
const KIND_CODE = { task: 'TK', event: 'EV', ride: 'RD' } as const

function serial(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return String(h % 10000).padStart(4, '0')
}

/** Defined once in the shell and applied to stamps and nothing else. */
export function InkDefs() {
  return (
    <svg className="cpn-inkdefs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ink-impression" x="-12%" y="-25%" width="124%" height="150%">
          <feTurbulence
            type="fractalNoise" baseFrequency="0.62 0.78"
            numOctaves={2} seed={9} result="grain"
          />
          <feColorMatrix
            in="grain" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.9 0 0 0 -1.08"
            result="starve"
          />
          <feComposite in="SourceGraphic" in2="starve" operator="out" result="broken" />
          <feDisplacementMap
            in="broken" in2="grain" scale={1.1}
            xChannelSelector="R" yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

function Header({ title, lede, meta, tools }: HeaderProps) {
  return (
    <header className="cpn-rail">
      <div className="cpn-rail__top">
        <span className="cpn-wm">Daylight<i aria-hidden="true" /></span>
        <div className="cpn-rail__tools">
          {meta && <span className="cpn-rail__meta">{meta}</span>}
          {tools}
        </div>
      </div>
      <h1 className="h1 cpn-rail__h1">{title}</h1>
      {lede && <p className="cpn-rail__lede">{lede}</p>}
      <span className="cpn-tear" aria-hidden="true" />
    </header>
  )
}

/** The book's own summary line: how many coupons are still unspent. */
function TodaySignature() {
  const { plan } = usePlan()
  const items = onDate(visibleItems(plan, plan.viewer), plan.today)
  const open = items.filter(needsAnswer)

  return (
    <section className="cpn-ledger" aria-label="Today's book">
      <dl>
        <div><dt>Coupons</dt><dd className="tnum">{items.length}</dd></div>
        <div><dt>Unanswered</dt><dd className="tnum cpn-ledger--open">{open.length}</dd></div>
        <div><dt>Unclaimed</dt><dd className="tnum">
          {items.filter((i) => itemStatus(i) === 'unowned').length}
        </dd></div>
      </dl>
    </section>
  )
}

function Row({ item, onOpen }: RowProps) {
  const { plan } = usePlan()
  const s = itemStatus(item)
  const ownerId = deciding(item).owner
  const owner = ownerId ? personById(plan, ownerId) : null
  const { t, ampm } = clockParts(item.startTime)

  return (
    <div className={`cpn-coupon cpn-coupon--${s}`}>
      <div className="cpn-coupon__paper">
        <button className="cpn-coupon__hit" onClick={onOpen} aria-label={item.title} />

        <div className="cpn-coupon__head">
          <span className="cpn-coupon__class">
            {item.kind} · {relativeDay(item.date, plan.today)}
          </span>
          <span className="cpn-coupon__code tnum">
            {KIND_CODE[item.kind]}-{serial(item.id)}
          </span>
        </div>

        <div className="cpn-coupon__title">
          <h3>{item.title}</h3>
          <Stamp status={s} sm />
        </div>

        <dl className="cpn-coupon__fields">
          <div>
            <dt>Time</dt>
            <dd className="tnum">{item.startTime ? `${t} ${ampm}` : '—'}</dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>{item.place ?? '—'}</dd>
          </div>
          <div>
            <dt>Bearer</dt>
            <dd className={owner ? '' : 'is-open'}>{owner ? owner.name : 'Unclaimed'}</dd>
          </div>
        </dl>

        {item.kind === 'ride' && (
          <p className="cpn-coupon__foot">
            <Icon name="car" size={14} /> Two legs, answered separately
          </p>
        )}
      </div>
    </div>
  )
}

export const coupon: WorldDef = {
  id: 'coupon',
  name: 'Coupon book',
  lineage: 'The first POC, carried across',
  thesis: 'A jet-age coupon book: state is stamped onto the ticket, not rewritten in a row.',
  swatch: ['#102b42', '#f4f1e9', '#e8bb60', '#1c5a3e'],
  Header,
  TodaySignature,
  Row,
}
