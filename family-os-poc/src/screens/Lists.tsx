import { useState } from "react";
import { clockStamp, relativeDay } from "../domain/dates";
import { effectiveStatus, personById, visibleItems } from "../domain/rules";
import type { Status } from "../domain/types";
import { useStore } from "../store/store";
import { Button } from "../ui/Button";
import { Avatar, EmptyState, SectionRule } from "../ui/bits";
import { ItemCoupon, type CouponHandlers } from "../ui/ItemCoupon";
import { Stamp } from "../ui/Stamp";
import { Wordmark } from "./Today";

const ORDER: Status[] = ["declined", "unassigned", "waiting", "accepted"];

/** Mine — what the person holding the phone owns. */
export function Mine({
  handlers,
  onCompose,
  today,
}: {
  handlers: CouponHandlers;
  onCompose: () => void;
  today: Date;
}) {
  const { state } = useStore();
  const me = personById(state, state.actingAs)!;

  const mine = visibleItems(state)
    .filter((i) => i.status !== "handled")
    .filter(
      (i) => i.assigneeId === me.id || i.legs?.some((l) => l.driverId === me.id) || i.requestedBy === me.id,
    )
    .sort(
      (a, b) =>
        ORDER.indexOf(effectiveStatus(a)) - ORDER.indexOf(effectiveStatus(b)) ||
        a.start.localeCompare(b.start),
    );

  const toAnswer = mine.filter((i) => i.status === "waiting" && i.assigneeId === me.id);
  const rest = mine.filter((i) => !toAnswer.includes(i));

  return (
    <>
      <div className="rail">
        <div className="rail__top">
          <Wordmark />
          <Avatar person={me} size={28} />
        </div>
        <h1 className="rail__h--sm">{me.name}'s list</h1>
        <p className="rail__lede">
          {mine.length === 0
            ? "Nothing is on you right now."
            : toAnswer.length
              ? `${toAnswer.length} ${toAnswer.length === 1 ? "item is" : "items are"} waiting for your answer.`
              : `${mine.length} open, all answered.`}
        </p>
      </div>

      {toAnswer.length ? (
        <>
          <SectionRule meta={`${toAnswer.length}`}>Waiting on your answer</SectionRule>
          <div className="stack">
            {toAnswer.map((item) => (
              <ItemCoupon key={item.id} item={item} handlers={handlers} today={today} />
            ))}
          </div>
        </>
      ) : null}

      {rest.length ? (
        <>
          <SectionRule meta={`${rest.length}`}>Yours</SectionRule>
          <div className="stack">
            {rest.map((item) => (
              <ItemCoupon key={item.id} item={item} handlers={handlers} today={today} compact />
            ))}
          </div>
        </>
      ) : null}

      {mine.length === 0 ? (
        <div className="stack">
          <EmptyState
            icon="mine"
            title="Your list is empty"
            body={
              me.role === "child"
                ? "Nothing to do right now. If you need something, ask a parent."
                : "Nothing is assigned to you. Family shows what the rest of the house is carrying."
            }
            action={
              <Button variant="secondary" icon="plus" onClick={onCompose}>
                {me.role === "child" ? "Ask for something" : "Add something"}
              </Button>
            }
          />
        </div>
      ) : null}
    </>
  );
}

/** Family — every open item, grouped by who carries it. */
export function Family({
  handlers,
  today,
}: {
  handlers: CouponHandlers;
  today: Date;
}) {
  const { state } = useStore();
  const me = personById(state, state.actingAs)!;
  const [open, setOpen] = useState<string | null>(null);
  const items = visibleItems(state).filter((i) => i.status !== "handled");
  const unowned = items.filter((i) => !i.assigneeId);

  if (me.role === "child") {
    return (
      <>
        <div className="rail">
          <div className="rail__top">
            <Wordmark />
            <Avatar person={me} size={28} />
          </div>
          <h1 className="rail__h--sm">The family</h1>
          <p className="rail__lede">You can see who is in the family, not what they are carrying.</p>
        </div>
        <SectionRule>Household</SectionRule>
        <div className="stack stack--rows">
          {state.family.members.map((p) => (
            <div key={p.id} className="listrow listrow--static">
              <Avatar person={p} size={30} />
              <span className="listrow__main">
                <b>{p.name}</b>
                <span>{p.role === "admin" ? "Family admin" : p.role === "parent" ? "Parent" : "Child"}</span>
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="rail">
        <div className="rail__top">
          <Wordmark />
          <span className="rail__date tnum">{items.length} OPEN</span>
        </div>
        <h1 className="rail__h--sm">The {state.family.name}s</h1>
        <p className="rail__lede">
          {unowned.length
            ? `${unowned.length} ${unowned.length === 1 ? "item has" : "items have"} nobody's name on ${unowned.length === 1 ? "it" : "them"}.`
            : "Everything open has an owner."}
        </p>
      </div>

      {unowned.length ? (
        <>
          <SectionRule meta={`${unowned.length}`}>Nobody's yet</SectionRule>
          <div className="stack">
            {unowned.map((item) => (
              <ItemCoupon key={item.id} item={item} handlers={handlers} today={today} compact />
            ))}
          </div>
        </>
      ) : null}

      <SectionRule>By owner</SectionRule>
      <div className="stack stack--rows">
        {state.family.members.map((p) => {
          const theirs = items.filter((i) => i.assigneeId === p.id);
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="owner" style={{ "--tint": p.tint } as React.CSSProperties}>
              <button
                type="button"
                className="owner__head"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.id)}
              >
                <Avatar person={p} size={30} />
                <span className="owner__name">
                  <b>{p.name}</b>
                  <span>{p.role === "admin" ? "Family admin" : p.role === "parent" ? "Parent" : "Child"}</span>
                </span>
                <span className="owner__count tnum">{theirs.length}</span>
                <span className={`owner__chev${isOpen ? " is-open" : ""}`} aria-hidden="true" />
              </button>
              {isOpen ? (
                theirs.length ? (
                  <ul className="owner__list">
                    {theirs.map((item) => (
                      <li key={item.id}>
                        <button type="button" onClick={() => handlers.onOpen(item.id)}>
                          <span className="owner__when tnum">{relativeDay(item.start, today)}</span>
                          <b>{item.title}</b>
                          <Stamp status={effectiveStatus(item)} size="sm" tilt={-3} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="owner__empty">Carrying nothing right now.</p>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Handled — the spent stubs. The one screen with a tinted ground. */
export function Handled({ onOpen, today }: { onOpen: (id: string) => void; today: Date }) {
  const { state, dispatch } = useStore();
  const handled = visibleItems(state)
    .filter((i) => i.status === "handled")
    .sort((a, b) => (b.handledAt ?? "").localeCompare(a.handledAt ?? ""));

  return (
    <div className="screen--handled">
      <div className="rail">
        <div className="rail__top">
          <Wordmark />
          <span className="rail__date tnum">HANDLED</span>
        </div>
        <h1 className="rail__h--sm">Spent stubs</h1>
        <p className="rail__lede">
          Nothing is deleted here. Work that closed keeps its record, with who closed it and when.
        </p>
      </div>

      {handled.length ? (
        <>
          <div className="spentcount">
            <b className="tnum">{handled.length}</b>
            <span>closed out, newest first</span>
          </div>
          <SectionRule>The log</SectionRule>
          <div className="stack">
            {handled.map((item) => {
              const closer = personById(state, lastActor(item));
              return (
                <article key={item.id} className="stub">
                  <button type="button" className="stub__hit" onClick={() => onOpen(item.id)}>
                    <span className="sr-only">Open {item.title}</span>
                  </button>
                  <div className="stub__main">
                    <span className="stub__code tnum">{item.code}</span>
                    <b>{item.title}</b>
                    <span className="stub__by">
                      {closer?.name ?? "Someone"} ·{" "}
                      {item.handledAt ? clockStamp(item.handledAt, today) : "—"}
                    </span>
                  </div>
                  <Stamp status="handled" size="sm" tilt={-4} />
                  <button
                    type="button"
                    className="stub__undo"
                    onClick={() => dispatch({ type: "reopen", itemId: item.id })}
                  >
                    Reopen
                  </button>
                </article>
              );
            })}
          </div>
          <p className="logend">
            <span />
            End of log · {handled.length} {handled.length === 1 ? "record" : "records"}
            <span />
          </p>
        </>
      ) : (
        <div className="stack">
          <EmptyState
            icon="handled"
            title="Nothing has closed yet"
            body="When an item is marked handled it moves here, with its stamp and its history intact."
          />
        </div>
      )}
    </div>
  );
}

function lastActor(item: { activity: { actorId: string }[]; createdBy: string }): string {
  return item.activity.length ? item.activity[item.activity.length - 1].actorId : item.createdBy;
}
