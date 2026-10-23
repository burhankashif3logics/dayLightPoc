import { usePlan, useSheet } from '../store/store'
import { useWorld } from '../worlds'
import { assignmentsOf, isOpen, openFor, visibleItems } from '../domain/rules'
import { Empty, SectionHead } from '../ui/bits'
import { Icon } from '../ui/Icon'
import { RequestSheet } from '../ui/sheets'

export function Mine({ onOpen }: { onOpen: (id: string) => void }) {
  const { plan, viewer } = usePlan()
  const { world } = useWorld()
  const { Header, Row } = world
  const request = useSheet<true>()

  const mine = openFor(visibleItems(plan, plan.viewer), plan.viewer)
  const toAnswer = mine.filter((i) =>
    assignmentsOf(i).some((a) => a.owner === plan.viewer && a.status === 'waiting'))
  const accepted = mine.filter((i) => !toAnswer.includes(i))
  const myRequests = plan.requests.filter((r) => r.from === plan.viewer)
  const isChild = viewer.role === 'child'

  return (
    <div className="screen">
      <Header
        title={isChild ? 'My things' : 'My tasks'}
        meta={`${mine.length} open`}
        lede={
          toAnswer.length
            ? <><b>{toAnswer.length}</b> {toAnswer.length === 1 ? 'is' : 'are'} waiting on you to say yes or no.</>
            : mine.length
              ? 'Everything on you has an answer already.'
              : 'Nothing is on you right now.'
        }
      />

      <div className="screen__scroll scroll">
        {toAnswer.length > 0 && (
          <>
            <SectionHead
              label="Waiting on you"
              right={<span className="sectionLabel tnum">{toAnswer.length}</span>}
            />
            <div className="rows">
              {toAnswer.map((item) => (
                <Row key={item.id} item={item} onOpen={() => onOpen(item.id)} />
              ))}
            </div>
          </>
        )}

        {accepted.length > 0 && (
          <>
            <SectionHead label="You said yes to" />
            <div className="rows">
              {accepted.map((item) => (
                <Row key={item.id} item={item} onOpen={() => onOpen(item.id)} />
              ))}
            </div>
          </>
        )}

        {mine.length === 0 && (
          <Empty icon="person">
            <p>Nothing is on you.</p>
            <p>{isChild ? 'If you need something, ask below.' : 'Family tasks shows what everyone else is carrying.'}</p>
          </Empty>
        )}

        <SectionHead
          label={isChild ? 'Things I asked for' : 'Things you asked for'}
          right={
            <button className="btn btn--quiet" onClick={() => request.show(true)}>
              <Icon name="plus" size={16} />
              Ask
            </button>
          }
        />
        {myRequests.length > 0 ? (
          <div className="rows">
            {myRequests.map((r) => (
              <div key={r.id} className="miniRow miniRow--static">
                <Icon name="hand" size={18} />
                <span className="miniRow__title">{r.what}</span>
                <span className={`miniRow__day${r.state === 'open' ? ' is-open' : ''}`}>
                  {r.state === 'open' ? 'Not answered' : r.state === 'converted' ? 'On the plan' : 'Answered'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="handledHint">Nothing asked for yet.</p>
        )}

        {isChild && (
          <p className="handledHint">
            <Icon name="archive" size={16} />
            {visibleItems(plan, plan.viewer).filter((i) => !isOpen(i)).length} of your things are done.
          </p>
        )}
      </div>

      {request.open && <RequestSheet onClose={request.hide} />}
    </div>
  )
}
