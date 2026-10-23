import { useState } from 'react'
import { PlanProvider, usePlan } from './store/store'
import { WorldProvider, useWorld, WORLDS, WORLD_ORDER } from './worlds'
import { Today } from './screens/Today'
import { Week } from './screens/Week'
import { Mine } from './screens/Mine'
import { Family } from './screens/Family'
import { Handled } from './screens/Handled'
import { ItemDetail } from './screens/ItemDetail'
import { Icon, type IconName } from './ui/Icon'
import { InkDefs } from './worlds/coupon'
import {
  assignmentsOf, handled, needsAnswer, openFor, visibleItems,
} from './domain/rules'
import type { PersonId } from './domain/types'

type Tab = 'today' | 'week' | 'mine' | 'family' | 'handled'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'week', label: 'Week', icon: 'week' },
  { id: 'mine', label: 'Mine', icon: 'person' },
  { id: 'family', label: 'Family', icon: 'family' },
  { id: 'handled', label: 'Handled', icon: 'archive' },
]

function Phone() {
  const { plan } = usePlan()
  const { world } = useWorld()
  const [tab, setTab] = useState<Tab>('today')
  const [openId, setOpenId] = useState<string | null>(null)

  const mine = visibleItems(plan, plan.viewer)
  const toAnswer = openFor(mine, plan.viewer).filter((i) =>
    assignmentsOf(i).some((a) => a.owner === plan.viewer && a.status === 'waiting')).length
  const familyOpen = mine.filter(needsAnswer).length

  const badge = (id: Tab) =>
    id === 'mine' ? toAnswer : id === 'family' ? familyOpen : 0

  return (
    <div className="phone" data-world={world.id}>
      {world.id === 'coupon' && <InkDefs />}
      <div className="phone__body">
        {openId ? (
          <ItemDetail id={openId} onBack={() => setOpenId(null)} />
        ) : tab === 'today' ? (
          <Today onOpen={setOpenId} />
        ) : tab === 'week' ? (
          <Week onOpen={setOpenId} />
        ) : tab === 'mine' ? (
          <Mine onOpen={setOpenId} />
        ) : tab === 'family' ? (
          <Family onOpen={setOpenId} />
        ) : (
          <Handled onOpen={setOpenId} />
        )}
      </div>

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => {
          const n = badge(t.id)
          return (
            <button
              key={t.id}
              className="tab"
              aria-current={!openId && tab === t.id ? 'page' : undefined}
              onClick={() => { setTab(t.id); setOpenId(null) }}
            >
              <Icon name={t.icon} size={21} />
              <span>{t.label}</span>
              {n > 0 && <em className="tab__badge tnum">{n}</em>}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/** The demo rig, deliberately outside the phone. */
function Rig() {
  const { plan, dispatch, viewer } = usePlan()
  const { world, setWorld } = useWorld()
  const done = handled(plan.items).length

  return (
    <aside className="rig">
      <div className="rig__brand">
        <span className="rig__mark" aria-hidden="true" />
        <div>
          <h1>Daylight</h1>
          <p>All-ages POC · four worlds, one product</p>
        </div>
      </div>

      <section className="rig__block">
        <h2 className="rig__label">Design world</h2>
        <div className="rig__worlds">
          {WORLD_ORDER.map((id) => {
            const w = WORLDS[id]
            return (
              <button
                key={id}
                className={`rig__world${world.id === id ? ' is-on' : ''}`}
                onClick={() => setWorld(id)}
                aria-pressed={world.id === id}
              >
                <span className="rig__swatch" aria-hidden="true">
                  {w.swatch.map((c) => <i key={c} style={{ background: c }} />)}
                </span>
                <span className="rig__worldMain">
                  <b>{w.name}</b>
                  <em>{w.lineage}</em>
                </span>
              </button>
            )
          })}
        </div>
        <p className="rig__note">{world.thesis}</p>
      </section>

      <section className="rig__block">
        <h2 className="rig__label">Who is holding the phone</h2>
        <div className="rig__people">
          {plan.people.map((p) => (
            <button
              key={p.id}
              className={`rig__person${plan.viewer === p.id ? ' is-on' : ''}`}
              onClick={() => dispatch({ type: 'viewer', id: p.id as PersonId })}
              aria-pressed={plan.viewer === p.id}
            >
              <i style={{ background: `var(--people-${p.hue + 1})` }} aria-hidden="true" />
              <b>{p.name}</b>
              <em>{p.role === 'admin' ? 'Admin' : p.role === 'parent' ? 'Parent' : 'Child'}</em>
            </button>
          ))}
        </div>
        <p className="rig__note">
          {viewer.role === 'child'
            ? `${viewer.name} sees only their own things, and can ask a parent rather than assign to one.`
            : `${viewer.name} can assign, accept, decline, reassign and close anything in the family.`}
        </p>
      </section>

      <section className="rig__block">
        <h2 className="rig__label">Sample data</h2>
        <p className="rig__note">
          The Hamilton family, one week. {plan.items.length} items, {done} already handled,
          {' '}{plan.requests.filter((r) => r.state === 'open').length} open kid requests.
          Everything is authored sample content, saved to this browser only.
        </p>
        <button className="rig__reset" onClick={() => dispatch({ type: 'reset' })}>
          <Icon name="repeat" size={16} />
          Reset the demo
        </button>
      </section>
    </aside>
  )
}

export default function App() {
  return (
    <PlanProvider>
      <WorldProvider>
        <main className="stage">
          <Rig />
          <div className="stage__device">
            <div className="device">
              <Phone />
            </div>
          </div>
        </main>
      </WorldProvider>
    </PlanProvider>
  )
}
