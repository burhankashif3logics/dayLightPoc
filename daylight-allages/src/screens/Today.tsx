import { usePlan } from '../store/store'
import { useWorld } from '../worlds'
import {
  conflicts, isOpen, itemStatus, needsAnswer, onDate, personById, visibleItems,
  waitingOn,
} from '../domain/rules'
import { monthDay, weekdayLong } from '../domain/dates'
import { Empty, Flag, SectionHead } from '../ui/bits'
import { Icon } from '../ui/Icon'

export function Today({ onOpen }: { onOpen: (id: string) => void }) {
  const { plan, viewer } = usePlan()
  const { world } = useWorld()
  const { Header, TodaySignature, Row, Legend } = world

  const mine = visibleItems(plan, plan.viewer)
  const today = onDate(mine, plan.today)
  const isChildView = viewer.role === 'child'
  // A child is only asked about what is actually waiting on them; the rest of
  // the day is theirs to read, not to answer for.
  const open = today.filter((i) => (isChildView ? waitingOn(i, plan.viewer) : needsAnswer(i)))
  const settled = today.filter((i) => !open.includes(i))
  const flags = conflicts(plan, plan.today, 1)
    .filter((c) => c.itemIds.some((id) => mine.some((i) => i.id === id)))
    // a child cannot find a driver, so that alert stays with the parents
    .filter((c) => viewer.role !== 'child' || c.kind !== 'no-driver')

  const isChild = isChildView
  const waitingCount = today.filter((i) => itemStatus(i) === 'waiting').length
  const unownedCount = today.filter((i) => itemStatus(i) === 'unowned').length

  const lede = isChild ? (
    today.length === 0
      ? 'Nothing for you today.'
      : <>You have <b>{today.length}</b> thing{today.length > 1 ? 's' : ''} today.</>
  ) : today.length === 0 ? (
    'Nothing on the plan for today.'
  ) : (
    <>
      {today.length} open.{' '}
      {waitingCount > 0 && <><b>{waitingCount} waiting on an answer</b>. </>}
      {unownedCount > 0 && <>{unownedCount} with nobody on {unownedCount > 1 ? 'them' : 'it'}.</>}
      {waitingCount === 0 && unownedCount === 0 && 'Everything has a name on it.'}
    </>
  )

  return (
    <div className="screen">
      <Header
        title={isChild ? `Hi, ${viewer.name}` : 'Today'}
        meta={`${weekdayLong(plan.today).slice(0, 3)} · ${monthDay(plan.today)}`}
        lede={lede}
      />
      <TodaySignature />
      {Legend && <Legend />}

      <div className="screen__scroll scroll">
        {flags.map((c, i) => (
          <Flag
            key={i}
            tone={c.kind === 'no-driver' ? 'declined' : 'waiting'}
            onAct={() => onOpen(c.itemIds[0])}
          >
            {c.text}
          </Flag>
        ))}

        {open.length > 0 && (
          <>
            <SectionHead
              label={isChild ? 'Waiting on you' : 'Needs an answer'}
              right={<span className="sectionLabel tnum">{open.length}</span>}
            />
            <div className="rows">
              {open.map((item) => (
                <Row key={item.id} item={item} onOpen={() => onOpen(item.id)} />
              ))}
            </div>
          </>
        )}

        {settled.length > 0 && (
          <>
            <SectionHead label={isChild ? 'The rest of your day' : 'Already answered'} />
            <div className="rows">
              {settled.map((item) => (
                <Row key={item.id} item={item} onOpen={() => onOpen(item.id)} />
              ))}
            </div>
          </>
        )}

        {today.length === 0 && (
          <Empty icon="sun">
            <p>Nothing is on today.</p>
            <p>
              {isChild
                ? 'Anything you need, ask a parent from the Mine tab.'
                : 'The week ahead is on the Week tab.'}
            </p>
          </Empty>
        )}

        {plan.requests.filter((r) => r.state === 'open').length > 0 && !isChild && (
          <>
            <SectionHead label="The kids asked for" />
            <div className="rows">
              {plan.requests.filter((r) => r.state === 'open').map((r) => {
                const from = personById(plan, r.from)
                return (
                  <div key={r.id} className="row" style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                    <Icon name="hand" size={20} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="title">{r.what}</div>
                      <div className="fine" style={{ marginTop: 3 }}>
                        {from.name} · needs it by {r.byWhen === plan.today ? 'today' : 'soon'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* the closing gesture is visible from Today, not hidden in a tab */}
        {mine.filter((i) => !isOpen(i)).length > 0 && (
          <p className="handledHint">
            <Icon name="archive" size={16} />
            {mine.filter((i) => !isOpen(i)).length} things have been handled this week.
          </p>
        )}
      </div>
    </div>
  )
}
