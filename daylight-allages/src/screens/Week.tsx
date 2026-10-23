import { useState } from 'react'
import { usePlan, useSheet } from '../store/store'
import { useWorld } from '../worlds'
import { AlmanacDayStrip, almanacCountFor } from '../worlds/almanac'
import {
  conflicts, itemStatus, needsAnswer, onDate, STATUS_WORD, visibleItems,
} from '../domain/rules'
import { monthDay, relativeDay, weekdayLong, weekdayShort, weekOf, dayNumber } from '../domain/dates'
import { Empty, Flag, Mark, SectionHead } from '../ui/bits'
import { Icon } from '../ui/Icon'
import { ReassignSheet, type Target } from '../ui/sheets'

export function Week({ onOpen }: { onOpen: (id: string) => void }) {
  const { plan, viewer } = usePlan()
  const { world } = useWorld()
  const { Header, Row } = world
  const [active, setActive] = useState(plan.today)
  const reassigning = useSheet<Target>()

  const mine = visibleItems(plan, plan.viewer)
  const days = weekOf(plan.today)
  const activeLabel = relativeDay(active, plan.today)
  const dayItems = onDate(mine, active)
  const weekOpen = days.flatMap((d) => onDate(mine, d)).filter(needsAnswer)
  const otherOpen = weekOpen.filter((item) => item.date !== active)
  const flags = conflicts(plan, days[0], 7)
    .filter((c) => c.kind === 'overlap')
    .filter((c) => c.itemIds.some((id) => mine.some((i) => i.id === id)))

  const counts = (d: string) => almanacCountFor(mine, d)

  return (
    <div className="screen">
      <Header
        title="The week"
        meta={days[0].slice(0, 7) === days[6].slice(0, 7)
          ? `${monthDay(days[0])}–${dayNumber(days[6])}`
          : `${monthDay(days[0])} – ${monthDay(days[6])}`}
        lede={
          weekOpen.length === 0
            ? 'Every item this week has an answer.'
            : <span className="week-summary">
                {world.id === 'departures' && <Icon name="alert" size={18} />}
                <span><b>{weekOpen.length}</b> {weekOpen.length === 1 ? 'item needs' : 'items need'} an answer</span>
              </span>
        }
      />

      {world.id === 'almanac' ? (
        <AlmanacDayStrip dates={days} active={active} onPick={setActive} countFor={counts} />
      ) : (
        <div className="weekStrip" role="group" aria-label="Pick a day">
          {days.map((d) => {
            const { total, open } = counts(d)
            return (
              <button
                key={d}
                aria-pressed={d === active}
                aria-label={`${weekdayLong(d)}, ${monthDay(d)}. ${total} ${total === 1 ? 'item' : 'items'}, ${open} ${open === 1 ? 'needs' : 'need'} an answer`}
                className={`weekStrip__day${d === active ? ' is-on' : ''}${d === plan.today ? ' is-today' : ''}`}
                onClick={() => setActive(d)}
              >
                <span className="weekStrip__dow">{weekdayShort(d)}</span>
                <span className="weekStrip__num tnum">{dayNumber(d)}</span>
                <span className="weekStrip__dots" aria-hidden="true">
                  {Array.from({ length: Math.min(total, 4) }, (_, k) => (
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
          label={['Today', 'Tomorrow', 'Yesterday'].includes(activeLabel)
            ? `${activeLabel}, ${weekdayLong(active)}`
            : `${weekdayLong(active)}, ${monthDay(active)}`}
          right={
            <span className="sectionLabel tnum">
              {dayItems.length ? `${dayItems.length} ${dayItems.length === 1 ? 'item' : 'items'}` : 'clear'}
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
            <p>Nothing planned for this day.</p>
            <p>Pick another day above.</p>
          </Empty>
        )}

        {otherOpen.length > 0 && (
          <>
            <SectionHead label="Unanswered on other days" right={<span className="sectionLabel tnum">{otherOpen.length}</span>} />
            <div className="rows">
              {otherOpen.map((item) => {
                const status = itemStatus(item)
                const canAssign = viewer.role !== 'child' && !item.legs && (status === 'unowned' || status === 'declined')
                const action = status === 'declined' ? 'Reassign' : 'Assign'
                return (
                  <div key={item.id} className={`miniRow week-unanswered${canAssign ? ' week-unanswered--action' : ''}`}>
                    <button className="week-unanswered__open" onClick={() => onOpen(item.id)}>
                      <span aria-hidden="true"><Mark status={status} /></span>
                      <span className="week-unanswered__main">
                        <span className="miniRow__title">{item.title}</span>
                        <span className="week-unanswered__status">{status === 'unowned' ? 'Unassigned' : STATUS_WORD[status]}</span>
                      </span>
                      <span className="miniRow__day">{relativeDay(item.date, plan.today)}</span>
                    </button>
                    {canAssign && (
                      <button
                        className="week-unanswered__action"
                        aria-label={`${action}: ${item.title}`}
                        onClick={() => reassigning.show({ item, leg: null })}
                      >{action}</button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      {reassigning.open && <ReassignSheet target={reassigning.open} onClose={reassigning.hide} />}
    </div>
  )
}
