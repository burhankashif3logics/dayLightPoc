import { useState } from "react";
import { dateLabel, isoDate, timeLabel, weekOf, weekdayLong, weekdayShort } from "../domain/dates";
import { conflicts, effectiveStatus, itemsOn, personById } from "../domain/rules";
import { useStore } from "../store/store";
import { Icon } from "../ui/Icon";
import { Stamp } from "../ui/Stamp";
import { Alert, EmptyState } from "../ui/bits";
import { Wordmark } from "./Today";

export function Week({
  onOpen,
  today,
}: {
  onOpen: (id: string) => void;
  today: Date;
}) {
  const { state } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const days = weekOf(today);
  const flags = conflicts(state);
  const flagged = new Set(flags.flatMap((c) => c.itemIds));

  const members = state.family.members;
  const me = personById(state, state.actingAs)!;

  return (
    <>
      <div className="rail">
        <div className="rail__top">
          <Wordmark />
          <span className="rail__date tnum">
            {dateLabel(days[0]).toUpperCase()} – {dateLabel(days[6]).toUpperCase()}
          </span>
        </div>
        <h1 className="rail__h--sm">The week</h1>
        <p className="rail__lede">
          {flags.length ? (
            <>
              <b>
                {flags.length} {flags.length === 1 ? "flag" : "flags"}
              </b>{" "}
              — overlaps, missing times and rides with no driver.
            </>
          ) : (
            "Nothing overlaps and every ride has a driver."
          )}
        </p>
      </div>

      {me.role === "child" ? null : (
        <div className="pills">
          <button
            type="button"
            className="pill"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Everyone
          </button>
          {members.map((p) => {
            const count = days.reduce(
              (n, d) =>
                n +
                itemsOn(state, d).filter(
                  (x) => x.item.assigneeId === p.id && x.item.status !== "handled",
                ).length,
              0,
            );
            return (
              <button
                key={p.id}
                type="button"
                className="pill"
                aria-pressed={filter === p.id}
                onClick={() => setFilter(p.id)}
              >
                <span className="pilldot" style={{ background: p.tint }} />
                {p.name}
                <span className="pill__n tnum">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {days.map((day) => {
        const all = itemsOn(state, day).filter((x) => x.item.status !== "handled");
        const rows = filter === "all" ? all : all.filter((x) => x.item.assigneeId === filter);
        const isToday = isoDate(day) === isoDate(today);

        return (
          <section key={isoDate(day)} className="daygroup">
            <div className="weekday">
              <span className={`weekday__num tnum${isToday ? " weekday__num--today" : ""}`}>
                {weekdayShort(day).toUpperCase()} {day.getDate()}
              </span>
              <h2>{isToday ? "Today" : weekdayLong(day)}</h2>
              <span className="weekday__line" />
              <span className="weekday__count tnum">{rows.length ? `${rows.length}` : "—"}</span>
            </div>

            {rows.length ? (
              <div className="stack stack--rows">
                {rows.map(({ item, start, isRepeat }) => {
                  const owner = personById(state, item.assigneeId);
                  return (
                    <button
                      key={`${item.id}-${start}`}
                      type="button"
                      className={`listrow${flagged.has(item.id) ? " listrow--flagged" : ""}`}
                      onClick={() => onOpen(item.id)}
                      style={{ "--tint": owner?.tint ?? "#b9b2a2" } as React.CSSProperties}
                    >
                      <span className="listrow__time tnum">
                        {item.noTime ? "—" : timeLabel(start).replace(" ", "")}
                      </span>
                      <span className="listrow__main">
                        <b>{item.title}</b>
                        <span>
                          {owner ? owner.name : "Nobody yet"}
                          {isRepeat ? (
                            <>
                              {" · "}
                              <Icon name="repeat" size={11} />
                              repeats
                            </>
                          ) : null}
                        </span>
                      </span>
                      <Stamp status={effectiveStatus(item)} size="sm" tilt={-3} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="dayempty">Clear.</p>
            )}
          </section>
        );
      })}

      {flags.length ? (
        <>
          <div className="rule">
            <h2>Flags</h2>
            <span className="rule__line" />
            <span className="rule__meta tnum">{flags.length}</span>
          </div>
          <div className="flagstrip flagstrip--list">
            {flags.map((c) => (
              <Alert
                key={c.id}
                tone={c.kind === "no-driver" ? "void" : "gold"}
                tag={c.kind === "no-driver" ? "No driver" : c.kind === "no-time" ? "No time" : "Overlap"}
                action={
                  <button type="button" className="alert__go" onClick={() => onOpen(c.itemIds[0])}>
                    <Icon name="forward" size={15} />
                    <span className="sr-only">Open the flagged item</span>
                  </button>
                }
              >
                {c.body}
              </Alert>
            ))}
          </div>
        </>
      ) : (
        <div className="stack">
          <EmptyState
            icon="handled"
            title="No flags this week"
            body="Nobody is in two places at once, every event has a time, and every ride has a driver."
          />
        </div>
      )}
    </>
  );
}
