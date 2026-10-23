import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startOfDay } from "./domain/dates";
import { needsYou, personById, unreadFor } from "./domain/rules";
import type { Item, ItemKind, RideLeg } from "./domain/types";
import { StoreProvider, useStore } from "./store/store";
import { Family, Handled, Mine } from "./screens/Lists";
import { Inbox } from "./screens/Inbox";
import { ItemDetail } from "./screens/ItemDetail";
import { Settings } from "./screens/Settings";
import { Today } from "./screens/Today";
import { Week } from "./screens/Week";
import { Icon, type IconName } from "./ui/Icon";
import { Avatar } from "./ui/bits";
import { Sheets, type Dialog } from "./ui/sheets";
import type { CouponHandlers } from "./ui/ItemCoupon";

type Route =
  | { name: "today" }
  | { name: "week" }
  | { name: "mine" }
  | { name: "family" }
  | { name: "handled" }
  | { name: "item"; id: string }
  | { name: "inbox" }
  | { name: "settings" };

const TABS: { name: Route["name"]; label: string; icon: IconName }[] = [
  { name: "week", label: "Week", icon: "week" },
  { name: "today", label: "Today", icon: "today" },
  { name: "mine", label: "Mine", icon: "mine" },
  { name: "family", label: "Family", icon: "family" },
  { name: "handled", label: "Handled", icon: "handled" },
];

export default function App() {
  return (
    <StoreProvider>
      <Frame />
    </StoreProvider>
  );
}

function Frame() {
  return (
    <div className="frame">
      <InkDefs />
      <aside className="panel frame__pad">
        <h3>Family OS, Phase 1, built as the Daylight coupon book</h3>
        <p>
          Every family obligation is a coupon with named fields, and a state change stamps itself
          onto it. Nothing disappears — it cancels.
        </p>
        <ul>
          <li>Assign, accept, decline with a reason, reassign.</li>
          <li>Rides carry two owned legs; either can go to someone with no account.</li>
          <li>Conflicts are derived, not stored: overlaps, missing times, missing drivers.</li>
          <li>Kid requests become tasks, or get a reply and close.</li>
        </ul>
        <div className="panel__sep" />
        <p className="panel__fine">
          Sample data for the Hamilton family, seeded from the client's Daylight prototype export.
          No backend, no accounts; the plan saves to this browser.
        </p>
      </aside>

      <div className="device">
        <Shell />
      </div>

      <DemoPanel />
    </div>
  );
}

/** One SVG filter gives every stamp its broken, ink-starved impression. */
function InkDefs() {
  return (
    <svg className="inkdefs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ink-impression" x="-12%" y="-25%" width="124%" height="150%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.62 0.78"
            numOctaves={2}
            seed={9}
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.9 0 0 0 -1.08"
            result="starve"
          />
          <feComposite in="SourceGraphic" in2="starve" operator="out" result="broken" />
          <feDisplacementMap
            in="broken"
            in2="grain"
            scale={1.1}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

function Shell() {
  const { state, saveFailed } = useStore();
  const [route, setRoute] = useState<Route>({ name: "today" });
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const backTo = useRef<Route>({ name: "today" });

  // The demo is anchored to the real day, so the week always reads as now.
  const today = useMemo(() => startOfDay(new Date()), []);
  const me = personById(state, state.actingAs)!;
  const unread = unreadFor(state);
  const queueCount = needsYou(state).length;

  const go = useCallback((next: Route) => {
    setRoute((current) => {
      if (next.name === "item" || next.name === "inbox" || next.name === "settings") {
        if (current.name !== next.name) backTo.current = current;
      }
      return next;
    });
  }, []);

  // Scroll after the new screen has rendered, not before it exists.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  const handlers: CouponHandlers = useMemo(
    () => ({
      onOpen: (id: string) => go({ name: "item", id }),
      onDecline: (item: Item) => setDialog({ kind: "decline", item }),
      onReassign: (item: Item) => setDialog({ kind: "reassign", item }),
      onAskHelper: (item: Item, leg: RideLeg) => setDialog({ kind: "ask-helper", item, leg }),
      onRecordReply: (item: Item, leg: RideLeg) => setDialog({ kind: "record-reply", item, leg }),
      onConvert: (item: Item) => setDialog({ kind: "convert", item }),
      onReply: (item: Item) => setDialog({ kind: "reply", item }),
      onSetTime: (item: Item) => setDialog({ kind: "set-time", item }),
    }),
    [go],
  );

  const compose = useCallback(() => {
    const kind: ItemKind = me.role === "child" ? "request" : "task";
    setDialog({ kind: "compose", itemKind: kind });
  }, [me.role]);

  const tabName = route.name === "item" || route.name === "inbox" || route.name === "settings"
    ? backTo.current.name
    : route.name;

  return (
    <div className="shell">
      <div className="scroll" ref={scrollRef} key={`${route.name}-${state.actingAs}`}>
        {route.name === "today" ? (
          <div className="screen">
            <TopTools go={go} unread={unread} />
            <Today
              handlers={handlers}
              onCompose={compose}
              onGoWeek={() => go({ name: "week" })}
              today={today}
            />
          </div>
        ) : null}
        {route.name === "week" ? (
          <div className="screen">
            <TopTools go={go} unread={unread} />
            <Week onOpen={(id) => go({ name: "item", id })} today={today} />
          </div>
        ) : null}
        {route.name === "mine" ? (
          <div className="screen">
            <TopTools go={go} unread={unread} />
            <Mine handlers={handlers} onCompose={compose} today={today} />
          </div>
        ) : null}
        {route.name === "family" ? (
          <div className="screen">
            <TopTools go={go} unread={unread} />
            <Family handlers={handlers} today={today} />
          </div>
        ) : null}
        {route.name === "handled" ? (
          <div className="screen">
            <TopTools go={go} unread={unread} />
            <Handled onOpen={(id) => go({ name: "item", id })} today={today} />
          </div>
        ) : null}
        {route.name === "item" ? (
          <div className="screen">
            <ItemDetail
              itemId={route.id}
              handlers={handlers}
              onBack={() => go(backTo.current)}
              today={today}
            />
          </div>
        ) : null}
        {route.name === "inbox" ? (
          <div className="screen">
            <Inbox
              onBack={() => go(backTo.current)}
              onOpen={(id) => go({ name: "item", id })}
              today={today}
            />
          </div>
        ) : null}
        {route.name === "settings" ? (
          <div className="screen">
            <Settings onBack={() => go(backTo.current)} />
          </div>
        ) : null}
      </div>

      {saveFailed ? (
        <div className="savefail">
          This browser is blocking storage, so changes will not survive a reload.
        </div>
      ) : null}

      <Toasts />

      <nav className="tabbar" aria-label="Main">
        {TABS.map((tab) => (
          <button
            key={tab.name}
            type="button"
            className="tab"
            aria-current={tabName === tab.name ? "page" : undefined}
            onClick={() => go({ name: tab.name } as Route)}
          >
            <Icon name={tab.icon} size={20} strokeWidth={tabName === tab.name ? 1.9 : 1.6} />
            {tab.label}
            {tab.name === "today" && queueCount ? (
              <span className="tab__count tnum">{queueCount}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <Sheets dialog={dialog} close={() => setDialog({ kind: "none" })} />
    </div>
  );
}

function TopTools({ go, unread }: { go: (r: Route) => void; unread: number }) {
  return (
    <div className="toptools">
      <button
        type="button"
        className="railbtn"
        onClick={() => go({ name: "inbox" })}
        aria-label={unread ? `Inbox, ${unread} unread` : "Inbox"}
      >
        <Icon name="bell" size={19} />
        {unread ? <span className="railbtn__count tnum">{unread}</span> : null}
      </button>
      <button
        type="button"
        className="railbtn"
        onClick={() => go({ name: "settings" })}
        aria-label="Family and settings"
      >
        <Icon name="gear" size={19} />
      </button>
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <Icon name="check" size={16} strokeWidth={2.2} />
          <span>{t.body}</span>
          <button
            type="button"
            className="toast__x"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function DemoPanel() {
  const { state, dispatch } = useStore();
  return (
    <aside className="panel frame__demo">
      <h2>Who is holding the phone</h2>
      <p>
        Phase 1 signs in by email or phone code, Apple or Google. For the POC, switch roles here and
        the app re-scopes: a child sees only their own work and cannot assign to a parent.
      </p>
      <div className="panel__who">
        {state.family.members.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={state.actingAs === p.id}
            onClick={() => dispatch({ type: "acting-as", personId: p.id })}
          >
            <Avatar person={p} size={22} />
            {p.name}
            <span className="panel__role">
              {p.role === "admin" ? "admin" : p.role === "parent" ? "parent" : "child"}
            </span>
          </button>
        ))}
      </div>
      <div className="panel__sep" />
      <h2>Try these</h2>
      <ul>
        <li>As Taylor, accept or decline the library books with a reason.</li>
        <li>As Alicia, reassign the declined tournament cash in two taps.</li>
        <li>Open the soccer tournament and hand a leg to Grandma Ruth.</li>
        <li>As Becker, ask for something and watch it reach a parent.</li>
      </ul>
    </aside>
  );
}
