import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * One sheet for every secondary task. Nothing in this product needs a modal
 * that blocks the plan behind it — the sheet sits over the screen you came from.
 */
export function Sheet({
  title, onClose, children, foot,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  foot?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Focus the dialog itself, not its close button — the first thing a
    // screen reader should hear is what this sheet is for.
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="sheet__head">
          <h2 className="h2">{title}</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            <Icon name="cross" size={20} />
          </button>
        </div>
        <div className="sheet__body scroll">{children}</div>
        {foot && <div className="sheet__foot">{foot}</div>}
      </div>
    </>
  )
}
