import type { ReactNode } from 'react'
import type { PersonId, Status } from '../domain/types'
import { STATUS_WORD } from '../domain/rules'
import { Icon, type IconName } from './Icon'

/** The state as a word in its own colour — the primary state carrier. */
export function StateWord({ status, word }: { status: Status; word?: string }) {
  return <span className={`state state--${status}`}>{word ?? STATUS_WORD[status]}</span>
}

/** The same state as a shape, for dense rows where a word will not fit. */
export function Mark({ status, sm }: { status: Status; sm?: boolean }) {
  return (
    <span
      className={`mark mark--${status}${sm ? ' mark--sm' : ''}`}
      role="img"
      aria-label={STATUS_WORD[status]}
    >
      {status === 'accepted' && <Icon name="check" size={sm ? 10 : 13} strokeWidth={3} />}
      {status === 'declined' && <Icon name="cross" size={sm ? 9 : 12} strokeWidth={3} />}
      {status === 'handled' && <Icon name="check" size={sm ? 10 : 13} strokeWidth={3} />}
    </span>
  )
}

export function PersonMark({
  id, name, hue, helper, size = 30,
}: {
  id?: PersonId | null
  name?: string
  hue?: number
  helper?: string
  size?: number
}) {
  if (helper) {
    return (
      <span
        className="person person--helper"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title={helper}
      >
        {helper.slice(0, 1)}
      </span>
    )
  }
  if (!id || !name) {
    return (
      <span
        className="person person--none"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        role="img"
        aria-label="Nobody has this"
      >
        <Icon name="person" size={size * 0.5} strokeWidth={2} />
      </span>
    )
  }
  return (
    <span
      className="person"
      style={{
        width: size, height: size, fontSize: size * 0.42,
        ['--p' as string]: `var(--people-${(hue ?? 0) + 1})`,
      }}
      title={name}
    >
      {name.slice(0, 1)}
    </span>
  )
}

export function SectionHead({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="sectionHead">
      <h2 className="sectionLabel">{label}</h2>
      {right}
    </div>
  )
}

export function Flag({
  tone = 'waiting', children, onAct, actLabel,
}: {
  tone?: 'waiting' | 'declined'
  children: ReactNode
  onAct?: () => void
  actLabel?: string
}) {
  return (
    <div className={`flag${tone === 'declined' ? ' flag--declined' : ''}`}>
      <Icon name="alert" size={18} />
      <p>{children}</p>
      {onAct && (
        <button className="btn btn--quiet flag__act" onClick={onAct}>
          {actLabel ?? 'Open'}
          <Icon name="chevron-right" size={16} />
        </button>
      )}
    </div>
  )
}

export function Empty({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} size={30} strokeWidth={1.5} />
      {children}
    </div>
  )
}
