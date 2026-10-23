import type { FC, ReactNode } from 'react'
import type { Item } from '../domain/types'

export type WorldId = 'almanac' | 'primer' | 'departures'

export interface HeaderProps {
  /** The screen's own name — Today, The week, My tasks. */
  title: string
  /** One line of what is actually true right now. */
  lede?: ReactNode
  /** The date, or a count. Short. */
  meta?: string
  /** Rendered at the top right of the masthead. */
  tools?: ReactNode
}

export interface RowProps {
  item: Item
  onOpen: () => void
}

export interface WorldDef {
  id: WorldId
  name: string
  lineage: string
  thesis: string
  /** Swatches for the world switcher. */
  swatch: string[]
  /** The masthead at the top of every screen. */
  Header: FC<HeaderProps>
  /** The world's signature move, which lives on Today. */
  TodaySignature: FC
  /** One obligation in a list. */
  Row: FC<RowProps>
  /** A permanent on-screen key, where the world has one. */
  Legend?: FC
}
