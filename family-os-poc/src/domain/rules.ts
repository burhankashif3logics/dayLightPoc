import { DAY_MS, isoDate, minutesOf, parse, sameDay, startOfDay } from "./dates";
import type { AppState, Conflict, Item, Person, RideLeg, Status } from "./types";

export const OPEN_STATUSES: Status[] = ["unassigned", "waiting", "declined", "accepted"];

export function personById(state: AppState, id: string | null | undefined): Person | undefined {
  return state.family.members.find((m) => m.id === id);
}

export function helperById(state: AppState, id: string | null | undefined) {
  return state.family.helpers.find((h) => h.id === id);
}

export function itemById(state: AppState, id: string | null | undefined): Item | undefined {
  return state.items.find((i) => i.id === id);
}

export function isOpen(item: Item): boolean {
  return item.status !== "handled";
}

/** A child sees only their own work, plus their own requests. */
export function visibleTo(item: Item, person: Person): boolean {
  if (person.role !== "child") return true;
  if (item.assigneeId === person.id) return true;
  if (item.requestedBy === person.id) return true;
  return item.legs?.some((l) => l.driverId === person.id) ?? false;
}

export function visibleItems(state: AppState): Item[] {
  const me = personById(state, state.actingAs);
  if (!me) return state.items;
  return state.items.filter((i) => visibleTo(i, me));
}

/** A ride's own stamp is the weakest of its legs: one unanswered leg is unanswered. */
export function rideStatus(item: Item): Status {
  if (!item.legs?.length) return item.status;
  if (item.status === "handled") return "handled";
  const ranks: Status[] = ["unassigned", "declined", "waiting", "accepted", "handled"];
  return item.legs.reduce<Status>((worst, leg) => {
    return ranks.indexOf(leg.status) < ranks.indexOf(worst) ? leg.status : worst;
  }, "handled");
}

export function effectiveStatus(item: Item): Status {
  return item.kind === "ride" ? rideStatus(item) : item.status;
}

export function legOwnerLabel(state: AppState, leg: RideLeg): string {
  if (leg.driverId) return personById(state, leg.driverId)?.name ?? "Someone";
  if (leg.helperId) return helperById(state, leg.helperId)?.name ?? "Outside helper";
  return "Nobody yet";
}

/** Everything the person holding the phone must answer, hardest first. */
export function needsYou(state: AppState, now = new Date()): Item[] {
  const me = state.actingAs;
  const mine = visibleItems(state).filter(isOpen);
  const scored = mine
    .map((item) => ({ item, score: urgencyScore(state, item, me, now) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || parse(a.item.start).getTime() - parse(b.item.start).getTime());
  return scored.map((x) => x.item);
}

function urgencyScore(state: AppState, item: Item, me: string, now: Date): number {
  const isParent = personById(state, me)?.role !== "child";
  const hoursOut = (parse(item.start).getTime() - now.getTime()) / 3_600_000;
  const soon = hoursOut < 26;

  // A ride whose legs are not all settled is the loudest thing in the app, and
  // how loud depends on how close it is: tonight's drop-off beats Sunday's.
  if (item.kind === "ride" && isParent) {
    const unsettled = item.legs?.some((l) => l.status === "unassigned" || l.status === "waiting");
    if (unsettled) {
      const proximity = Math.max(0, 14 - Math.max(0, hoursOut) / 4);
      return 88 + proximity;
    }
  }
  if (item.status === "declined" && isParent) return 90;
  if (item.kind === "request" && item.status === "unassigned" && isParent) return 80;
  if (item.status === "waiting" && item.assigneeId === me) return 85;
  if (item.status === "unassigned" && isParent) return soon ? 60 : 30;
  if (item.status === "accepted" && item.assigneeId === me && soon) return 20;
  return 0;
}

/** Module 8. Flags are derived, never stored, so they cannot go stale. */
export function conflicts(state: AppState, now = new Date()): Conflict[] {
  const out: Conflict[] = [];
  const open = visibleItems(state).filter(isOpen);

  // One person committed to two things at once.
  const commitments: { personId: string; itemId: string; from: number; to: number; day: string }[] = [];
  for (const item of open) {
    const day = isoDate(parse(item.start));
    if (item.noTime) continue;
    if (item.legs?.length) {
      for (const leg of item.legs) {
        if (!leg.driverId) continue;
        const from = minutesOf(leg.time);
        commitments.push({
          personId: leg.driverId,
          itemId: item.id,
          from,
          to: from + 40,
          day: isoDate(parse(leg.time)),
        });
      }
    } else if (item.assigneeId) {
      const from = minutesOf(item.start);
      const to = item.end ? minutesOf(item.end) : from + 30;
      commitments.push({ personId: item.assigneeId, itemId: item.id, from, to, day });
    }
  }
  for (let i = 0; i < commitments.length; i++) {
    for (let j = i + 1; j < commitments.length; j++) {
      const a = commitments[i];
      const b = commitments[j];
      if (a.personId !== b.personId || a.day !== b.day || a.itemId === b.itemId) continue;
      if (a.from < b.to && b.from < a.to) {
        out.push({
          id: `cf-overlap-${a.itemId}-${b.itemId}`,
          kind: "overlap",
          itemIds: [a.itemId, b.itemId],
          personId: a.personId,
          body: `${personById(state, a.personId)?.name ?? "Someone"} is on two things at once.`,
        });
      }
    }
  }

  for (const item of open) {
    if (item.noTime && item.kind === "event") {
      out.push({
        id: `cf-notime-${item.id}`,
        kind: "no-time",
        itemIds: [item.id],
        body: `${item.title} has a day but no time.`,
      });
    }
    if (item.kind === "ride") {
      const unclaimed = item.legs?.filter((l) => l.status === "unassigned") ?? [];
      const hoursOut = (parse(item.start).getTime() - now.getTime()) / 3_600_000;
      if (unclaimed.length && hoursOut < 48) {
        out.push({
          id: `cf-nodriver-${item.id}`,
          kind: "no-driver",
          itemIds: [item.id],
          body:
            unclaimed.length === 2
              ? `${item.title} has no driver either way.`
              : `${item.title} has no ${unclaimed[0].kind === "dropoff" ? "drop-off" : "pickup"} driver.`,
        });
      }
    }
  }
  return out;
}

export function conflictsFor(state: AppState, itemId: string, now = new Date()): Conflict[] {
  return conflicts(state, now).filter((c) => c.itemIds.includes(itemId));
}

/** Expanded occurrences of a repeating item inside a window. */
export function occurrencesOn(item: Item, day: Date): { start: string; isRepeat: boolean } | null {
  if (sameDay(item.start, day)) return { start: item.start, isRepeat: false };
  if (!item.repeat) return null;
  const first = startOfDay(parse(item.start));
  const target = startOfDay(day);
  if (target <= first) return null;
  if (target > startOfDay(parse(item.repeat.until))) return null;
  const diffDays = Math.round((target.getTime() - first.getTime()) / DAY_MS);
  const stride = item.repeat.freq === "daily" ? 1 : 7;
  if (diffDays % stride !== 0) return null;
  const key = isoDate(target);
  if (key in item.repeat.exceptions) {
    const override = item.repeat.exceptions[key];
    return override === null ? null : { start: override, isRepeat: true };
  }
  const t = parse(item.start);
  const start = new Date(target);
  start.setHours(t.getHours(), t.getMinutes(), 0, 0);
  return { start: start.toISOString().slice(0, 16), isRepeat: true };
}

export function itemsOn(state: AppState, day: Date): { item: Item; start: string; isRepeat: boolean }[] {
  return visibleItems(state)
    .map((item) => {
      const occ = occurrencesOn(item, day);
      return occ ? { item, start: occ.start, isRepeat: occ.isRepeat } : null;
    })
    .filter((x): x is { item: Item; start: string; isRepeat: boolean } => x !== null)
    .sort((a, b) => {
      if (a.item.noTime !== b.item.noTime) return a.item.noTime ? 1 : -1;
      return parse(a.start).getTime() - parse(b.start).getTime();
    });
}

export function unreadFor(state: AppState): number {
  return state.notifications.filter(
    (n) => n.forId === state.actingAs && !n.read && !state.muted.includes(n.type),
  ).length;
}

export function nextCode(state: AppState, kind: Item["kind"]): string {
  const prefix = kind === "ride" ? "RD" : kind === "request" ? "RQ" : kind === "event" ? "EV" : "TK";
  const nums = state.items
    .filter((i) => i.code.startsWith(prefix))
    .map((i) => Number(i.code.slice(3)))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 400) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}
