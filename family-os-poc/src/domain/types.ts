export type Role = "admin" | "parent" | "child";

export interface Person {
  id: string;
  name: string;
  role: Role;
  /** Row colour. One per member, used at region scale, never as decoration. */
  tint: string;
  initials: string;
  phone?: string;
}

/** An outside helper has no account and never will in Phase 1. */
export interface Helper {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export type Status =
  | "unassigned"
  | "waiting"
  | "accepted"
  | "declined"
  | "handled";

export type ItemKind = "task" | "event" | "ride" | "request";

export interface ChecklistEntry {
  id: string;
  label: string;
  done: boolean;
}

export type LegKind = "dropoff" | "pickup";

/** A ride has two owned legs. Either may belong to someone with no account. */
export interface RideLeg {
  id: string;
  kind: LegKind;
  time: string;
  driverId: string | null;
  helperId: string | null;
  status: Status;
  askedAt?: string;
  reason?: string;
}

export interface Repeat {
  freq: "daily" | "weekly";
  /** Inclusive ISO date the series stops after. */
  until: string;
  /** ISO date -> changed start time for that one occurrence, or null to skip. */
  exceptions: Record<string, string | null>;
}

export interface Activity {
  id: string;
  at: string;
  actorId: string;
  verb: string;
  detail?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  at: string;
  body: string;
  mentions: string[];
}

export interface Item {
  id: string;
  code: string;
  kind: ItemKind;
  title: string;
  notes?: string;
  where?: string;
  /** ISO datetime, or an ISO date when the item has no time set. */
  start: string;
  end?: string;
  /** True when the item is dated but nobody has put a time on it (module 8). */
  noTime?: boolean;
  priority?: boolean;
  checklist: ChecklistEntry[];
  assigneeId: string | null;
  status: Status;
  reason?: string;
  createdBy: string;
  createdAt: string;
  handledAt?: string;
  legs?: RideLeg[];
  repeat?: Repeat;
  /** Kid request fields. */
  requestedBy?: string;
  neededBy?: string;
  photo?: string;
  convertedTo?: string;
  reply?: string;
  activity: Activity[];
  comments: Comment[];
}

export type NotificationType =
  | "assignment"
  | "decline"
  | "reassignment"
  | "comment"
  | "status"
  | "request";

export interface AppNotification {
  id: string;
  type: NotificationType;
  itemId: string;
  at: string;
  forId: string;
  body: string;
  read: boolean;
}

export interface Conflict {
  id: string;
  kind: "overlap" | "no-time" | "no-driver";
  itemIds: string[];
  personId?: string;
  body: string;
}

export interface Family {
  name: string;
  members: Person[];
  helpers: Helper[];
}

export interface AppState {
  family: Family;
  items: Item[];
  notifications: AppNotification[];
  /** Which member is holding the phone. The POC's stand-in for sign-in. */
  actingAs: string;
  muted: NotificationType[];
  reminders: { eveningBefore: boolean; hourBefore: boolean };
  feedback: { id: string; at: string; byId: string; body: string }[];
}
