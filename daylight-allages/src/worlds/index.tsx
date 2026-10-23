import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { WorldDef, WorldId } from './types'
import { almanac } from './almanac'
import { primer } from './primer'
import { departures } from './departures'

import './almanac/tokens.css'
import './primer/tokens.css'
import './departures/tokens.css'

export const WORLDS: Record<WorldId, WorldDef> = { almanac, primer, departures }
export const WORLD_ORDER: WorldId[] = ['almanac', 'primer', 'departures']

const KEY = 'daylight-allages/world'

interface Ctx { world: WorldDef; setWorld: (id: WorldId) => void }
const WorldContext = createContext<Ctx | null>(null)

export function WorldProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<WorldId>(() => {
    const saved = localStorage.getItem(KEY) as WorldId | null
    return saved && saved in WORLDS ? saved : 'almanac'
  })
  const value = useMemo<Ctx>(() => ({
    world: WORLDS[id],
    setWorld: (next) => {
      setId(next)
      try { localStorage.setItem(KEY, next) } catch { /* nothing to do */ }
    },
  }), [id])
  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>
}

export function useWorld(): Ctx {
  const ctx = useContext(WorldContext)
  if (!ctx) throw new Error('useWorld must be used inside WorldProvider')
  return ctx
}

export type { WorldDef, WorldId }
