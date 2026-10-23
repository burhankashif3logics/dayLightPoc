import { usePlan } from '../store/store'
import { useWorld } from '../worlds'
import { handled, ownersOf, personById, visibleItems } from '../domain/rules'
import { relativeDay, clock } from '../domain/dates'
import { Empty, Mark, PersonMark, SectionHead } from '../ui/bits'
import { Icon } from '../ui/Icon'

export function Handled({ onOpen }: { onOpen: (id: string) => void }) {
  const { plan } = usePlan()
  const { world } = useWorld()
  const { Header } = world

  const done = handled(visibleItems(plan, plan.viewer))
  const byDay = done.reduce<Record<string, typeof done>>((acc, item) => {
    const day = item.handledAt!.slice(0, 10)
    acc[day] = [...(acc[day] ?? []), item]
    return acc
  }, {})

  return (
    <div className="screen screen--handled">
      <Header
        title="Handled"
        meta={`${done.length} closed`}
        lede="Work that left the plan, and who closed it."
      />

      <div className="screen__scroll scroll">
        {done.length === 0 ? (
          <Empty icon="archive">
            <p>Nothing has been handled yet.</p>
            <p>When something is finished it moves here, with its name still on it.</p>
          </Empty>
        ) : (
          Object.entries(byDay).map(([day, items]) => (
            <div key={day}>
              <SectionHead
                label={relativeDay(day, plan.today)}
                right={<span className="sectionLabel tnum">{items.length}</span>}
              />
              <div className="rows">
                {items.map((item) => {
                  const owners = ownersOf(item)
                  const lead = owners[0] ? personById(plan, owners[0]) : null
                  return (
                    <button key={item.id} className="doneRow" onClick={() => onOpen(item.id)}>
                      <Mark status="handled" />
                      <span className="doneRow__main">
                        <span className="doneRow__title">{item.title}</span>
                        <span className="fine">
                          {lead ? `${lead.name} closed it` : 'Closed'}
                          {item.handledAt && ` at ${clock(item.handledAt.slice(11))}`}
                        </span>
                      </span>
                      {lead
                        ? <PersonMark id={lead.id} name={lead.name} hue={lead.hue} size={26} />
                        : <PersonMark size={26} />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {done.length > 0 && (
          <p className="handledHint">
            <Icon name="archive" size={16} />
            Nothing is deleted. Open any of these to put it back on the plan.
          </p>
        )}
      </div>
    </div>
  )
}
