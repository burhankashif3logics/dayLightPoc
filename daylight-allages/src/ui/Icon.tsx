/**
 * One drawn set, 24-box, 1.75 stroke, round caps and joins.
 * Every glyph in the product comes from here — no emoji, no font glyphs.
 */
export type IconName =
  | 'sun' | 'week' | 'person' | 'family' | 'archive'
  | 'car' | 'clock' | 'pin' | 'flag' | 'alert' | 'message'
  | 'check' | 'cross' | 'chevron-right' | 'chevron-left' | 'chevron-down'
  | 'plus' | 'phone' | 'hand' | 'repeat' | 'list' | 'bell'
  | 'signal' | 'wifi' | 'battery'

const P: Record<IconName, string> = {
  sun: 'M12 4.2v2M12 17.8v2M4.2 12h2M17.8 12h2M6.5 6.5l1.4 1.4M16.1 16.1l1.4 1.4M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z',
  week: 'M4.5 7.5h15v12h-15zM4.5 11.5h15M8.5 4.5v4M15.5 4.5v4M9 15h2M14 15h1.5',
  person: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5.5 19.5a6.5 6.5 0 0 1 13 0',
  family: 'M8.5 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.8 19.5a5.7 5.7 0 0 1 11.4 0M15.5 14.4a5.7 5.7 0 0 1 5.7 5.1',
  archive: 'M4.5 7.5h15M5.5 7.5v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11M4.5 7.5l1.3-3h12.4l1.3 3M9.5 12l1.8 1.8 3.2-3.4',
  car: 'M5 16.5h14M6.5 16.5v2M17.5 16.5v2M4.5 16.5v-4l2-4.5h11l2 4.5v4zM4.8 12.5h14.4M8 14.5h1M15 14.5h1',
  clock: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 7.8V12l2.8 1.8',
  pin: 'M12 20.5s6-5.4 6-9.7a6 6 0 0 0-12 0c0 4.3 6 9.7 6 9.7ZM12 13a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z',
  flag: 'M6 20.5V4.2M6 5h10.5l-2 3.4 2 3.4H6',
  alert: 'M12 4.5 2.8 20h18.4L12 4.5ZM12 10v4.2M12 17.2v.2',
  message: 'M4.5 6.5h15v10h-9l-4 3v-3h-2z',
  check: 'M5.5 12.6 10 17l8.5-9.5',
  cross: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  'chevron-right': 'M9.5 5.5 16 12l-6.5 6.5',
  'chevron-left': 'M14.5 5.5 8 12l6.5 6.5',
  'chevron-down': 'M5.5 9.5 12 16l6.5-6.5',
  plus: 'M12 5.5v13M5.5 12h13',
  phone: 'M7.2 4.5 9.5 9l-2 1.8a11 11 0 0 0 5.7 5.7L15 14.5l4.5 2.3-.7 2.4a2 2 0 0 1-2.2 1.4C9.7 19.8 4.2 14.3 3.4 7.4a2 2 0 0 1 1.4-2.2z',
  hand: 'M9 12.5V6.2a1.5 1.5 0 0 1 3 0v5M12 11V5.2a1.5 1.5 0 0 1 3 0V11M15 11.5V7.7a1.5 1.5 0 0 1 3 0v6.6a6 6 0 0 1-6 6h-.8a5 5 0 0 1-4.1-2.2L5 15.5a1.6 1.6 0 0 1 2.4-2z',
  repeat: 'M5 10.5A5 5 0 0 1 10 6h9M19 13.5a5 5 0 0 1-5 4.5H5M16 3.5 19.5 6 16 8.5M8 15.5 4.5 18 8 20.5',
  list: 'M5 7.5h.2M5 12h.2M5 16.5h.2M9 7.5h10M9 12h10M9 16.5h10',
  bell: 'M12 4.5a5.5 5.5 0 0 0-5.5 5.5c0 4-1.5 5.5-1.5 5.5h14s-1.5-1.5-1.5-5.5A5.5 5.5 0 0 0 12 4.5ZM10.3 18.5a1.9 1.9 0 0 0 3.4 0',
  signal: 'M4 19v-3M9 19v-7M14 19V8M19 19V4',
  wifi: 'M3 8.5a14 14 0 0 1 18 0M6.5 12a8.5 8.5 0 0 1 11 0M10 15.5a3 3 0 0 1 4 0M12 19h.01',
  battery: 'M3 7h16v10H3zM22 10v4M6 10h10v4H6z',
}

const FILLED: IconName[] = []

export function Icon({
  name, size = 22, strokeWidth = 1.75, className,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={P[name]} fill={FILLED.includes(name) ? 'currentColor' : 'none'} />
    </svg>
  )
}
