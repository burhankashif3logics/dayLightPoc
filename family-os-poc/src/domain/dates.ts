/** US formats, Pacific-style local time. Phase 1 is English only. */

export const DAY_MS = 86_400_000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Local ISO date, not UTC: a 5 PM pickup must not slide a day. */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function at(d: Date, hours: number, minutes = 0): string {
  const x = startOfDay(d);
  x.setHours(hours, minutes, 0, 0);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${isoDate(x)}T${p(hours)}:${p(minutes)}`;
}

export function parse(iso: string): Date {
  // Dateless strings ("2026-10-23") parse as UTC midnight in some engines.
  if (iso.length === 10) return new Date(`${iso}T00:00:00`);
  return new Date(iso);
}

export function sameDay(a: string, b: Date): boolean {
  return isoDate(parse(a)) === isoDate(b);
}

export function timeLabel(iso: string): string {
  const d = parse(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}:00 ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function weekdayLong(d: Date): string {
  return WEEKDAYS[d.getDay()];
}

export function weekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getDay()];
}

export function dateLabel(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function longDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Today", "Tomorrow", "Thu Oct 23" — the label a parent scans for. */
export function relativeDay(iso: string, today: Date): string {
  const d = startOfDay(parse(iso));
  const diff = Math.round((d.getTime() - startOfDay(today).getTime()) / DAY_MS);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return `${WEEKDAYS_SHORT[d.getDay()]} ${dateLabel(d)}`;
}

/** "19 hours out", "4 days ago" — used on the no-driver alert. */
export function distance(iso: string, now: Date): string {
  const ms = parse(iso).getTime() - now.getTime();
  const abs = Math.abs(ms);
  const hours = Math.round(abs / 3_600_000);
  const text =
    abs < 3_600_000
      ? `${Math.max(1, Math.round(abs / 60_000))} min`
      : hours < 48
        ? `${hours} hr`
        : `${Math.round(abs / DAY_MS)} days`;
  return ms >= 0 ? `${text} out` : `${text} ago`;
}

export function clockStamp(iso: string, today: Date): string {
  const d = parse(iso);
  const same = isoDate(d) === isoDate(today);
  return same ? timeLabel(iso) : `${relativeDay(iso, today)} ${timeLabel(iso)}`;
}

/** Monday-first week containing d. */
export function weekOf(d: Date): Date[] {
  const start = startOfDay(d);
  const shift = (start.getDay() + 6) % 7;
  const monday = addDays(start, -shift);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function minutesOf(iso: string): number {
  const d = parse(iso);
  return d.getHours() * 60 + d.getMinutes();
}
