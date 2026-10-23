import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { at, isoDate, startOfDay } from "../domain/dates";
import { buildSeed } from "../domain/seed";
import { itemById, nextCode, personById } from "../domain/rules";
import type {
  Activity,
  AppNotification,
  AppState,
  Item,
  ItemKind,
  NotificationType,
  Status,
} from "../domain/types";

const KEY = "daylight-poc-v2";

export type Action =
  | { type: "respond"; itemId: string; status: Extract<Status, "accepted" | "declined">; reason?: string }
  | { type: "reassign"; itemId: string; personId: string }
  | { type: "claim-leg"; itemId: string; legId: string; personId: string }
  | { type: "ask-helper"; itemId: string; legId: string; helperId: string }
  | { type: "record-reply"; itemId: string; legId: string; accepted: boolean; note?: string }
  | { type: "clear-leg"; itemId: string; legId: string }
  | { type: "handle"; itemId: string }
  | { type: "reopen"; itemId: string }
  | { type: "toggle-check"; itemId: string; entryId: string }
  | { type: "comment"; itemId: string; body: string }
  | { type: "set-time"; itemId: string; time: string }
  | { type: "create"; draft: NewItemDraft }
  | { type: "convert-request"; itemId: string; personId: string }
  | { type: "reply-request"; itemId: string; body: string }
  | { type: "acting-as"; personId: string }
  | { type: "toggle-mute"; notificationType: NotificationType }
  | { type: "set-reminder"; key: "eveningBefore" | "hourBefore"; value: boolean }
  | { type: "read-notifications" }
  | { type: "feedback"; body: string }
  | { type: "reset" };

export interface NewItemDraft {
  kind: ItemKind;
  title: string;
  notes?: string;
  where?: string;
  day: string;
  time: string | null;
  assigneeId: string | null;
  priority?: boolean;
  neededBy?: string;
}

function now(): string {
  const d = new Date();
  return at(d, d.getHours(), d.getMinutes());
}

let tick = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(tick++).toString(36)}`;

function log(item: Item, actorId: string, verb: string, detail?: string): Item {
  const entry: Activity = { id: uid("a"), at: now(), actorId, verb, detail };
  return { ...item, activity: [...item.activity, entry] };
}

function notify(
  state: AppState,
  partial: Omit<AppNotification, "id" | "at" | "read">,
): AppNotification[] {
  if (partial.forId === state.actingAs) return state.notifications;
  const n: AppNotification = { ...partial, id: uid("n"), at: now(), read: false };
  return [n, ...state.notifications];
}

function mapItem(state: AppState, id: string, fn: (item: Item) => Item): Item[] {
  return state.items.map((i) => (i.id === id ? fn(i) : i));
}

function reducer(state: AppState, action: Action): AppState {
  const actor = state.actingAs;
  const actorName = personById(state, actor)?.name ?? "Someone";

  switch (action.type) {
    case "respond": {
      const item = itemById(state, action.itemId);
      if (!item) return state;
      const verb = action.status === "accepted" ? "accepted" : "declined";
      const items = mapItem(state, action.itemId, (i) =>
        log({ ...i, status: action.status, reason: action.reason }, actor, verb, action.reason),
      );
      return {
        ...state,
        items,
        notifications: notify(state, {
          type: action.status === "declined" ? "decline" : "status",
          itemId: item.id,
          forId: item.createdBy,
          body:
            action.status === "declined"
              ? `${actorName} declined ${item.title}${action.reason ? ` — “${action.reason}”` : ""}`
              : `${actorName} accepted ${item.title}.`,
        }),
      };
    }

    case "reassign": {
      const item = itemById(state, action.itemId);
      if (!item) return state;
      const to = personById(state, action.personId)?.name ?? "someone";
      const items = mapItem(state, action.itemId, (i) =>
        log(
          { ...i, assigneeId: action.personId, status: "waiting", reason: undefined },
          actor,
          "reassigned this",
          `to ${to}`,
        ),
      );
      return {
        ...state,
        items,
        notifications: notify(state, {
          type: "reassignment",
          itemId: item.id,
          forId: action.personId,
          body: `${actorName} assigned you ${item.title}.`,
        }),
      };
    }

    case "claim-leg": {
      const item = itemById(state, action.itemId);
      if (!item) return state;
      const leg = item.legs?.find((l) => l.id === action.legId);
      const who = personById(state, action.personId)?.name ?? "Someone";
      const items = mapItem(state, action.itemId, (i) =>
        log(
          {
            ...i,
            legs: i.legs?.map((l) =>
              l.id === action.legId
                ? { ...l, driverId: action.personId, helperId: null, status: "accepted", reason: undefined }
                : l,
            ),
          },
          actor,
          `${who === actorName ? "took" : "assigned"} the ${leg?.kind === "pickup" ? "pickup" : "drop-off"}`,
          who === actorName ? undefined : `to ${who}`,
        ),
      );
      return {
        ...state,
        items,
        notifications: notify(state, {
          type: "status",
          itemId: item.id,
          forId: item.createdBy,
          body: `${who} is driving the ${leg?.kind === "pickup" ? "pickup" : "drop-off"} for ${item.title}.`,
        }),
      };
    }

    case "ask-helper": {
      const helper = state.family.helpers.find((h) => h.id === action.helperId);
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) =>
          log(
            {
              ...i,
              legs: i.legs?.map((l) =>
                l.id === action.legId
                  ? { ...l, helperId: action.helperId, driverId: null, status: "waiting", askedAt: now() }
                  : l,
              ),
            },
            actor,
            `texted ${helper?.name ?? "an outside helper"}`,
          ),
        ),
      };
    }

    case "record-reply": {
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) => {
          const leg = i.legs?.find((l) => l.id === action.legId);
          const helper = state.family.helpers.find((h) => h.id === leg?.helperId);
          return log(
            {
              ...i,
              legs: i.legs?.map((l) =>
                l.id === action.legId
                  ? action.accepted
                    ? { ...l, status: "accepted" as Status }
                    : { ...l, status: "unassigned" as Status, helperId: null, reason: action.note }
                  : l,
              ),
            },
            actor,
            `recorded ${helper?.name ?? "the"} reply`,
            action.accepted ? "Yes" : action.note || "No",
          );
        }),
      };
    }

    case "clear-leg": {
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) =>
          log(
            {
              ...i,
              legs: i.legs?.map((l) =>
                l.id === action.legId
                  ? { ...l, driverId: null, helperId: null, status: "unassigned" as Status }
                  : l,
              ),
            },
            actor,
            "took this leg back off the board",
          ),
        ),
      };
    }

    case "handle": {
      const item = itemById(state, action.itemId);
      if (!item) return state;
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) =>
          log(
            {
              ...i,
              status: "handled",
              handledAt: now(),
              legs: i.legs?.map((l) => ({ ...l, status: "handled" as Status })),
            },
            actor,
            "marked it handled",
          ),
        ),
        notifications: notify(state, {
          type: "status",
          itemId: item.id,
          forId: item.createdBy,
          body: `${actorName} handled ${item.title}.`,
        }),
      };
    }

    case "reopen":
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) =>
          log(
            { ...i, status: i.assigneeId ? "accepted" : "unassigned", handledAt: undefined },
            actor,
            "put this back on the board",
          ),
        ),
      };

    case "toggle-check":
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) => ({
          ...i,
          checklist: i.checklist.map((c) =>
            c.id === action.entryId ? { ...c, done: !c.done } : c,
          ),
        })),
      };

    case "comment": {
      const item = itemById(state, action.itemId);
      if (!item) return state;
      const mentions = state.family.members
        .filter((m) => new RegExp(`@${m.name}\\b`, "i").test(action.body))
        .map((m) => m.id);
      const items = mapItem(state, action.itemId, (i) => ({
        ...i,
        comments: [
          ...i.comments,
          { id: uid("c"), authorId: actor, at: now(), body: action.body, mentions },
        ],
      }));
      let notifications = state.notifications;
      for (const m of mentions) {
        notifications = notify(
          { ...state, notifications },
          {
            type: "comment",
            itemId: item.id,
            forId: m,
            body: `${actorName} mentioned you on ${item.title}.`,
          },
        );
      }
      return { ...state, items, notifications };
    }

    case "set-time":
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) =>
          log({ ...i, start: action.time, noTime: false }, actor, "set a time"),
        ),
      };

    case "create": {
      const { draft } = action;
      const start = draft.time ? `${draft.day}T${draft.time}` : draft.day;
      const item: Item = {
        id: uid("i"),
        code: nextCode(state, draft.kind),
        kind: draft.kind,
        title: draft.title,
        notes: draft.notes,
        where: draft.where,
        start,
        noTime: !draft.time,
        priority: draft.priority,
        checklist: [],
        assigneeId: draft.kind === "request" ? null : draft.assigneeId,
        status: draft.kind === "request" ? "unassigned" : draft.assigneeId ? "waiting" : "unassigned",
        requestedBy: draft.kind === "request" ? actor : undefined,
        neededBy: draft.neededBy,
        createdBy: actor,
        createdAt: now(),
        legs:
          draft.kind === "ride"
            ? [
                {
                  id: uid("l"),
                  kind: "dropoff",
                  time: start,
                  driverId: null,
                  helperId: null,
                  status: "unassigned",
                },
                {
                  id: uid("l"),
                  kind: "pickup",
                  time: start,
                  driverId: null,
                  helperId: null,
                  status: "unassigned",
                },
              ]
            : undefined,
        activity: [
          {
            id: uid("a"),
            at: now(),
            actorId: actor,
            verb: draft.kind === "request" ? "sent this request" : "created this",
          },
        ],
        comments: [],
      };
      let notifications = state.notifications;
      if (draft.kind === "request") {
        for (const parent of state.family.members.filter((m) => m.role !== "child")) {
          notifications = notify(
            { ...state, notifications },
            {
              type: "request",
              itemId: item.id,
              forId: parent.id,
              body: `${actorName} asked for ${item.title}${draft.neededBy ? `, needed by ${draft.neededBy}` : ""}.`,
            },
          );
        }
      } else if (draft.assigneeId) {
        notifications = notify(
          { ...state, notifications },
          {
            type: "assignment",
            itemId: item.id,
            forId: draft.assigneeId,
            body: `${actorName} assigned you ${item.title}.`,
          },
        );
      }
      return { ...state, items: [item, ...state.items], notifications };
    }

    case "convert-request": {
      const request = itemById(state, action.itemId);
      if (!request) return state;
      const task: Item = {
        id: uid("i"),
        code: nextCode(state, "task"),
        kind: "task",
        title: request.title,
        notes: request.notes,
        start: request.neededBy ?? request.start,
        noTime: true,
        checklist: [],
        assigneeId: action.personId,
        status: "waiting",
        createdBy: actor,
        createdAt: now(),
        activity: [
          {
            id: uid("a"),
            at: now(),
            actorId: actor,
            verb: "made this from a request",
            detail: `${personById(state, request.requestedBy)?.name ?? "A child"} asked`,
          },
        ],
        comments: [],
      };
      const items = [
        task,
        ...mapItem(state, action.itemId, (i) =>
          log({ ...i, status: "handled", handledAt: now(), convertedTo: task.id }, actor, "turned this into a task"),
        ),
      ];
      let notifications = notify(state, {
        type: "assignment",
        itemId: task.id,
        forId: action.personId,
        body: `${actorName} assigned you ${task.title}.`,
      });
      notifications = notify(
        { ...state, notifications },
        {
          type: "status",
          itemId: task.id,
          forId: request.requestedBy ?? request.createdBy,
          body: `${actorName} turned your request into a task.`,
        },
      );
      return { ...state, items, notifications };
    }

    case "reply-request": {
      const request = itemById(state, action.itemId);
      if (!request) return state;
      return {
        ...state,
        items: mapItem(state, action.itemId, (i) =>
          log({ ...i, reply: action.body, status: "handled", handledAt: now() }, actor, "replied and closed it"),
        ),
        notifications: notify(state, {
          type: "status",
          itemId: request.id,
          forId: request.requestedBy ?? request.createdBy,
          body: `${actorName} replied: “${action.body}”`,
        }),
      };
    }

    case "acting-as":
      return { ...state, actingAs: action.personId };

    case "toggle-mute":
      return {
        ...state,
        muted: state.muted.includes(action.notificationType)
          ? state.muted.filter((t) => t !== action.notificationType)
          : [...state.muted, action.notificationType],
      };

    case "set-reminder":
      return { ...state, reminders: { ...state.reminders, [action.key]: action.value } };

    case "read-notifications":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.forId === state.actingAs ? { ...n, read: true } : n,
        ),
      };

    case "feedback":
      return {
        ...state,
        feedback: [{ id: uid("f"), at: now(), byId: actor, body: action.body }, ...state.feedback],
      };

    case "reset":
      return buildSeed();

    default:
      return state;
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as { savedOn?: string; state?: AppState };
    // The demo is about today. A plan saved on another day is re-seeded.
    if (parsed.savedOn !== isoDate(startOfDay(new Date())) || !parsed.state) return buildSeed();
    return parsed.state;
  } catch {
    return buildSeed();
  }
}

interface Toast {
  id: string;
  body: string;
}

interface StoreValue {
  state: AppState;
  dispatch: (action: Action) => void;
  toasts: Toast[];
  toast: (body: string) => void;
  dismissToast: (id: string) => void;
  saveFailed: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ savedOn: isoDate(startOfDay(new Date())), state }),
      );
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [state]);

  useEffect(() => {
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (body: string) => {
      const id = uid("t");
      setToasts((t) => [...t.filter((x) => x.body !== body), { id, body }]);
      const handle = window.setTimeout(() => dismissToast(id), 3600);
      timers.current.push(handle);
    },
    [dismissToast],
  );

  const dispatch = useCallback((action: Action) => rawDispatch(action), []);

  const value = useMemo(
    () => ({ state, dispatch, toasts, toast, dismissToast, saveFailed }),
    [state, dispatch, toasts, toast, dismissToast, saveFailed],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useMe() {
  const { state } = useStore();
  return personById(state, state.actingAs)!;
}
