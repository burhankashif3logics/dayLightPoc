import { useState } from 'react'
import { usePlan } from '../store/store'
import { useWorld } from '../worlds'
import { AlmanacDayStrip, almanacCountFor } from '../worlds/almanac'
import {
  conflicts, itemStatus, needsAnswer, onDate, visibleItems,
} from '../domain/rules'
import { monthDay, relativeDay, weekdayLong, weekdayShort, weekOf, dayNumber } from '../domain/dates'
import { Empty, Flag, Mark, SectionHead } from '../ui/bits'

export function Week({ onOpen }: { onOpen: (id: string) => void }) {
  const { plan } = usePlan()
  const { world } = useWorld()
  const { Header, Row } = world
  const [active, setActive] = useState(plan.today)

  const mine = visibleItems(plan, plan.viewer)
  const days = weekOf(plan.today)
  const dayItems = onDate(mine, active)
  const weekOpen = days.flatMap((d) => onDate(mine, d)).filter(needsAnswer)
  const flags = conflicts(plan, days[0], 7)
    .filter((c) => c.kind === 'overlap')
    .filter((c) => c.itemIds.some((id) => mine.some((i) => i.id === id)))

  const counts = (d: string) => almanacCountFor(mine, d)

  return (
    <div className="screen">
      <Header
        title="The week"
        meta={`${monthDay(days[0])} – ${monthDay(days[6])}`}
        lede={
          weekOpen.length === 0
            ? 'Every item this week has an answer.'
            : <><b>{weekOpen.length}</b> {weekOpen.length === 1 ? 'item' : 'items'} this week still need an answer.</>
        }
      />

      {world.id === 'almanac' ? (
        <AlmanacDayStrip dates={days} active={active} onPick={setActive} countFor={counts} />
      ) : (
        <div className="weekStrip" role="tablist" aria-label="Pick a day">
          {days.map((d) => {
            const { total, open } = counts(d)
            return (
              <button
                key={d}
                role="tab"
                aria-selected={d === active}
                className={`weekStrip__day${d === active ? ' is-on' : ''}${d === plan.today ? ' is-today' : ''}`}
                onClick={() => setActive(d)}
              >
                <span className="weekStrip__dow">{weekdayShort(d)}</span>
                <span className="weekStrip__num tnum">{dayNumber(d)}</span>
                <span className="weekStrip__dots">
                  {total === 0
                    ? <i className="weekStrip__none" />
                    : Array.from({ length: Math.min(total, 4) }, (_, k) => (
                        <i key={k} className={open > k ? 'is-open' : ''} />
                      ))}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="screen__scroll scroll">
        {active === plan.today && flags.map((c, i) => (
          <Flag key={i} onAct={() => onOpen(c.itemIds[0])} actLabel="Open">{c.text}</Flag>
        ))}

        <SectionHead
          label={`${relativeDay(active, plan.today)}${
            relativeDay(active, plan.today) === weekdayLong(active) ? '' : `, ${weekdayLong(active)}`
          }`}
          right={
            <span className="sectionLabel tnum">
              {dayItems.length ? `${dayItems.length} open` : 'clear'}
            </span>
          }
        />

        {dayItems.length > 0 ? (
          <div className="rows">
            {dayItems.map((item) => (
              <Row key={item.id} item={item} onOpen={() => onOpen(item.id)} />
            ))}
          </div>
        ) : (
          <Empty icon="week">
            <p>Nothing on {relativeDay(active, plan.today).toLowerCase()}.</p>
            <p>Pick another day above.</p>
          </Empty>
        )}

        {weekOpen.length > 0 && (
          <>
            <SectionHead label="Unanswered, anywhere this week" />
            <div className="rows">
              {weekOpen.map((item) => (
                <button key={item.id} className="miniRow" onClick={() => onOpen(item.id)}>
                  <Mark status={itemStatus(item)} sm />
                  <span className="miniRow__title">{item.title}</span>
                  <span className="miniRow__day">{relativeDay(item.date, plan.today)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
