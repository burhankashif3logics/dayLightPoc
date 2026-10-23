import { useState } from "react";
import { clockStamp, longDate, parse, relativeDay, timeLabel } from "../domain/dates";
import { conflictsFor, effectiveStatus, itemById, personById } from "../domain/rules";
import type { Item } from "../domain/types";
import { useStore } from "../store/store";
import { Button } from "../ui/Button";
import { Alert, Avatar, SectionRule } from "../ui/bits";
import { Icon } from "../ui/Icon";
import { ItemCoupon, type CouponHandlers } from "../ui/ItemCoupon";
import { statusWord } from "../ui/Stamp";

export function ItemDetail({
  itemId,
  handlers,
  onBack,
  today,
}: {
  itemId: string;
  handlers: CouponHandlers;
  onBack: () => void;
  today: Date;
}) {
  const { state, dispatch, toast } = useStore();
  const item = itemById(state, itemId);
  const me = personById(state, state.actingAs)!;
  const [draft, setDraft] = useState("");

  if (!item) {
    return (
      <>
        <div className="rail">
          <button type="button" className="rail__back" onClick={onBack}>
            <Icon name="back" size={16} /> Back
          </button>
          <h1 className="rail__h--sm">That item is gone</h1>
          <p className="rail__lede">It may have been reopened under a new code.</p>
        </div>
      </>
    );
  }

  const status = effectiveStatus(item);
  const flags = conflictsFor(state, item.id);
  const canEdit = me.role !== "child" || item.assigneeId === me.id;

  return (
    <>
      <div className="rail">
        <button type="button" className="rail__back" onClick={onBack}>
          <Icon name="back" size={16} /> Back
        </button>
        <h1 className="rail__h--sm">{item.title}</h1>
        <div className="rail__meta tnum">
          <span>{item.code}</span>
          <span>·</span>
          <span>{statusWord(status)}</span>
          <span>·</span>
          <span>{relativeDay(item.start, today).toUpperCase()}</span>
        </div>
      </div>

      {flags.length ? (
        <div className="flagstrip">
          {flags.map((c) => (
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

      <div className="detailhero">
        <ItemCoupon item={item} handlers={handlers} today={today} />
      </div>

      {item.status === "handled" ? (
        <div className="detailactions">
          <Button variant="secondary" block onClick={() => dispatch({ type: "reopen", itemId: item.id })}>
            Put it back on the board
          </Button>
        </div>
      ) : null}

      {item.where || item.notes || item.repeat || item.noTime ? (
        <>
          <SectionRule>Details</SectionRule>
          <div className="sheetgroup">
            {item.where ? (
              <DetailRow icon="pin" label="Where">
                {item.where}
              </DetailRow>
            ) : null}
            <DetailRow
              icon="clock"
              label="When"
              action={
                item.noTime && item.status !== "handled" ? (
                  <button type="button" className="detailrow__act" onClick={() => handlers.onSetTime(item)}>
                    Set a time
                  </button>
                ) : null
              }
            >
              {item.noTime ? (
                <>
                  {longDate(parse(item.start))} — <em>no time set</em>
                </>
              ) : (
                `${longDate(parse(item.start))}, ${timeLabel(item.start)}${item.end ? ` – ${timeLabel(item.end)}` : ""}`
              )}
            </DetailRow>
            {item.repeat ? (
              <DetailRow icon="repeat" label="Repeats">
                Every {item.repeat.freq === "weekly" ? "week" : "day"} until{" "}
                {relativeDay(item.repeat.until, today)}
                {Object.keys(item.repeat.exceptions).length ? (
                  <>
                    {" · "}
                    <em>
                      {Object.keys(item.repeat.exceptions).length} week changed on its own
                    </em>
                  </>
                ) : null}
              </DetailRow>
            ) : null}
            {item.notes ? (
              <DetailRow icon="message" label="Notes">
                {item.notes}
              </DetailRow>
            ) : null}
          </div>
        </>
      ) : null}

      {item.checklist.length ? (
        <>
          <SectionRule meta={`${item.checklist.filter((c) => c.done).length}/${item.checklist.length}`}>
            Checklist
          </SectionRule>
          <div className="sheetgroup">
            {item.checklist.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="check"
                role="checkbox"
                aria-checked={entry.done}
                disabled={!canEdit}
                onClick={() => dispatch({ type: "toggle-check", itemId: item.id, entryId: entry.id })}
              >
                <span className="check__box">
                  <Icon name="check" size={13} strokeWidth={2.4} />
                </span>
                <span className="check__label">{entry.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <SectionRule meta={`${item.activity.length}`}>History</SectionRule>
      <div className="sheetgroup">
        <ul className="activity">
          {item.activity.map((a) => {
            const who = personById(state, a.actorId);
            return (
              <li key={a.id}>
                <b>{who?.name ?? "Someone"}</b> {a.verb}
                {a.detail ? <> — {a.detail}</> : null}
                <time>{clockStamp(a.at, today)}</time>
              </li>
            );
          })}
        </ul>
      </div>

      <SectionRule meta={item.comments.length ? `${item.comments.length}` : undefined}>
        Comments
      </SectionRule>
      <div className="sheetgroup">
        {item.comments.length ? (
          item.comments.map((c) => {
            const who = personById(state, c.authorId);
            return (
              <article key={c.id} className="comment">
                <div className="comment__head">
                  {who ? <Avatar person={who} size={22} /> : null}
                  <b>{who?.name ?? "Someone"}</b>
                  <time className="tnum">{clockStamp(c.at, today)}</time>
                </div>
                <p>{highlight(c.body, state.family.members.map((m) => m.name))}</p>
              </article>
            );
          })
        ) : (
          <p className="comment__none">No comments yet. Type @ to pull someone in.</p>
        )}
      </div>

      <div className="composer">
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Comment — @${state.family.members.find((m) => m.id !== me.id)?.name ?? "someone"} to notify`}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <Button variant="primary" icon="send" disabled={!draft.trim()} onClick={send}>
          <span className="sr-only">Post comment</span>
        </Button>
      </div>
    </>
  );

  function send() {
    if (!draft.trim() || !item) return;
    dispatch({ type: "comment", itemId: item.id, body: draft.trim() });
    const mentioned = state.family.members.filter((m) => new RegExp(`@${m.name}\\b`, "i").test(draft));
    toast(mentioned.length ? `${mentioned.map((m) => m.name).join(" and ")} notified.` : "Comment added.");
    setDraft("");
  }
}

function DetailRow({
  icon,
  label,
  children,
  action,
}: {
  icon: "pin" | "clock" | "repeat" | "message";
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="detailrow">
      <span className="detailrow__icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="detailrow__body">
        <span className="detailrow__label">{label}</span>
        <span className="detailrow__value">{children}</span>
      </span>
      {action}
    </div>
  );
}

function highlight(body: string, names: string[]): React.ReactNode {
  const pattern = new RegExp(`(@(?:${names.join("|")})\\b)`, "gi");
  return body.split(pattern).map((part, i) =>
    pattern.test(part) || /^@/.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  );
}

export type { Item };
