import { distance, longDate, timeLabel } from "../domain/dates";
import { conflicts, effectiveStatus, itemsOn, needsYou, personById } from "../domain/rules";
import { useStore } from "../store/store";
import { Alert, EmptyState, SectionRule } from "../ui/bits";
import { Button } from "../ui/Button";
import { ItemCoupon, type CouponHandlers } from "../ui/ItemCoupon";
import { Stamp } from "../ui/Stamp";

export function Today({
  handlers,
  onCompose,
  onGoWeek,
  today,
}: {
  handlers: CouponHandlers;
  onCompose: () => void;
  onGoWeek: () => void;
  today: Date;
}) {
  const { state } = useStore();
  const me = personById(state, state.actingAs)!;
  const queue = needsYou(state);
  const flags = conflicts(state);

  const rest = itemsOn(state, today)
    .map((x) => x.item)
    .filter((i) => i.status !== "handled" && !queue.some((q) => q.id === i.id));

  const lede = buildLede();
  // The rail already names the loudest flag; the strip shows what it did not.
  const named = flags.find((c) => c.kind === "no-driver") ?? flags.find((c) => c.kind === "overlap");
  const strip = flags.filter((c) => c.id !== named?.id);

  return (
    <>
      <div className="rail">
        <div className="rail__top">
          <Wordmark />
        </div>
        <h1>{longDate(today)}</h1>
        <p className="rail__lede">{lede}</p>
      </div>

      {strip.length ? (
        <div className="flagstrip">
          {strip.slice(0, 2).map((c) => (
            <Alert
              key={c.id}
              tone={c.kind === "no-driver" ? "void" : "gold"}
              tag={c.kind === "no-driver" ? "No driver" : c.kind === "no-time" ? "No time" : "Overlap"}
            >
              {c.body}
            </Alert>
          ))}
        </div>
      ) : null}

      <SectionRule meta={queue.length ? `${queue.length} open` : undefined}>
        {queue.length ? "Needs you" : "Open"}
      </SectionRule>

      {queue.length ? (
        <div className="stack">
          {queue.map((item) => (
            <ItemCoupon key={item.id} item={item} handlers={handlers} today={today} />
          ))}
        </div>
      ) : (
        <div className="stack">
          <EmptyState
            icon="handled"
            title="Nothing is waiting on you"
            body={
              me.role === "child"
                ? "When a parent gives you something it lands here. You can ask for something any time."
                : "Every item today has a name on it. The week is under Week."
            }
            action={
              <Button variant="secondary" icon="week" onClick={onGoWeek}>
                Look at the week
              </Button>
            }
          />
        </div>
      )}

      {rest.length ? (
        <>
          <SectionRule meta={`${rest.length}`}>Also today</SectionRule>
          <div className="stack stack--rows">
            {rest.map((item) => {
              const owner = personById(state, item.assigneeId);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="listrow"
                  onClick={() => handlers.onOpen(item.id)}
                >
                  <span className="listrow__time tnum">
                    {item.noTime ? "—" : timeLabel(item.start).replace(" ", "")}
                  </span>
                  <span className="listrow__main">
                    <b>{item.title}</b>
                    <span>
                      {owner ? owner.name : "Nobody yet"}
                      {item.where ? ` · ${item.where}` : ""}
                    </span>
                  </span>
                  <Stamp status={effectiveStatus(item)} size="sm" tilt={-3} />
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="addrow">
        <Button variant="secondary" icon="plus" block onClick={onCompose}>
          {me.role === "child" ? "Ask for something" : "Add to the plan"}
        </Button>
      </div>
    </>
  );

  function buildLede() {
    const noDriver = flags.find((c) => c.kind === "no-driver");
    if (noDriver) {
      const item = state.items.find((i) => i.id === noDriver.itemIds[0]);
      return (
        <>
          <b>{noDriver.body}</b> {item ? distance(item.start, new Date()) : ""}.
        </>
      );
    }
    const overlap = flags.find((c) => c.kind === "overlap");
    if (overlap) return <b>{overlap.body}</b>;
    if (queue.length === 0) return "Everything today has a name on it.";
    const declined = queue.find((i) => i.status === "declined");
    if (declined) {
      const who = personById(state, declined.assigneeId)?.name ?? "Someone";
      return (
        <>
          <b>{who} declined {declined.title}.</b> It needs a new owner.
        </>
      );
    }
    return `${queue.length} ${queue.length === 1 ? "thing needs" : "things need"} an answer from you.`;
  }
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark__dash" />
      Day<i>light</i>
    </span>
  );
}
