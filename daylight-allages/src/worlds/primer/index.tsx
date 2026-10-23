import type { WorldDef, HeaderProps, RowProps } from '../types'
import { usePlan } from '../../store/store'
import { clock, relativeDay } from '../../domain/dates'
import {
  assignmentsOf, deciding, itemStatus, onDate, ownersOf, personById, STATUS_WORD,
  visibleItems,
} from '../../domain/rules'
import type { PersonId } from '../../domain/types'
import { StateWord } from '../../ui/bits'
import { Icon } from '../../ui/Icon'
import './primer.css'

/**
 * The person-token. Two flat inks and one line: a head, a body colour.
 * The same glyph appears at every size, everywhere a person is named, and
 * the dashed empty token is how "nobody has this" looks before you can read.
 */
export function Token({
  hue, size = 48, empty, helper, label,
}: {
  hue?: number
  size?: number
  empty?: boolean
  helper?: boolean
  label?: string
}) {
  const line = Math.max(2, size * 0.062)
  return (
    <span
      className={`pri-token${empty ? ' is-empty' : ''}`}
      style={{ width: size, height: size, borderWidth: line }}
      role="img"
      aria-label={label ?? (empty ? 'Nobody' : undefined)}
    >
      {!empty && (
        <>
          <span
            className="pri-token__body"
            style={{
              background: helper ? 'var(--s-asked-out)' : `var(--people-${(hue ?? 0) + 1})`,
            }}
          />
          <span
            className="pri-token__head"
            style={{ width: size * 0.4, height: size * 0.4, top: size * 0.17 }}
          />
        </>
      )}
      {empty && <span className="pri-token__q" style={{ fontSize: size * 0.4 }}>?</span>}
    </span>
  )
}

function Header({ title, lede, meta, tools }: HeaderProps) {
  return (
    <header className="pri-head">
      <div className="pri-head__top">
        <span className="pri-wm">
          <span className="pri-wm__dot" />
          Daylight
        </span>
        <div className="pri-head__tools">
          {meta && <span className="pri-head__date">{meta}</span>}
          {tools}
        </div>
      </div>
      <h1 className="h1 pri-head__h1">{title}</h1>
      {lede && <p className="pri-head__lede">{lede}</p>}
    </header>
  )
}

/**
 * The signature move on Today: the whole family as a row of tokens, with the
 * empty token standing in the line beside them. A child counts the tokens.
 */
function TodaySignature() {
  const { plan } = usePlan()
  const items = onDate(visibleItems(plan, plan.viewer), plan.today)

  const load = (id: PersonId) => {
    const theirs = items.filter((i) => ownersOf(i).includes(id))
    const waiting = theirs.filter((i) =>
      assignmentsOf(i).some((a) => a.owner === id && a.status === 'waiting'))
    return { total: theirs.length, waiting: waiting.length }
  }
  const unowned = items.filter((i) => itemStatus(i) === 'unowned')

  return (
    <section className="pri-family" aria-label="Who has what today">
      {plan.people.map((p) => {
        const { total, waiting } = load(p.id)
        return (
          <div key={p.id} className="pri-family__who">
            <Token hue={p.hue} size={48} label={p.name} />
            <p className="pri-family__name">{p.name}</p>
            <em className={`pri-family__load${waiting ? ' is-waiting' : ''}`}>
              {waiting ? `${waiting} to answer` : total ? `${total} today` : 'Clear'}
            </em>
          </div>
        )
      })}
      <div className="pri-family__who">
        <Token empty size={48} label="Nobody" />
        <p className="pri-family__name">No one</p>
        <em className={`pri-family__load${unowned.length ? ' is-open' : ''}`}>
          {unowned.length ? `${unowned.length} item${unowned.length > 1 ? 's' : ''}` : 'None'}
        </em>
      </div>
    </section>
  )
}

function Row({ item, onOpen }: RowProps) {
  const { plan } = usePlan()
  const s = itemStatus(item)
  const ownerId = deciding(item).owner
  const lead = ownerId ? personById(plan, ownerId) : null

  return (
    <button className={`pri-card pri-card--${s}`} onClick={onOpen}>
      <span className="pri-card__band">
        <Token hue={lead?.hue} empty={!lead} size={30} label={lead?.name ?? 'Nobody'} />
        <StateWord
          status={s}
          word={
            s === 'waiting' && lead ? `Waiting on ${lead.name}`
            : s === 'accepted' && lead ? `${lead.name} has it`
            : s === 'unowned' ? 'Nobody has this'
            : s === 'declined' && lead ? `${lead.name} said no`
            : STATUS_WORD[s]
          }
        />
        <span className="pri-card__when">
          {item.startTime ? clock(item.startTime) : relativeDay(item.date, plan.today)}
        </span>
      </span>
      <span className="pri-card__body">
        <span className="pri-card__title">{item.title}</span>
        {item.detail && <span className="pri-card__detail">{item.detail}</span>}
        {item.place && (
          <span className="pri-card__place">
            <Icon name={item.kind === 'ride' ? 'car' : 'pin'} size={15} />
            {item.place}
          </span>
        )}
      </span>
    </button>
  )
}

export const primer: WorldDef = {
  id: 'primer',
  name: 'Primer',
  lineage: 'Mid-century picture-book printing',
  thesis: 'Five flat inks and one line: a four-year-old and an adult read the same page.',
  swatch: ['#ffffff', '#1f4fa8', '#d8402e', '#e0a000'],
  Header,
  TodaySignature,
  Row,
}
