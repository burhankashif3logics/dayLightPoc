import { clockStamp, parse, relativeDay, timeLabel, weekdayShort } from "../domain/dates";
import { effectiveStatus, helperById, personById } from "../domain/rules";
import type { Item, RideLeg } from "../domain/types";
import { useStore } from "../store/store";
import { Button } from "./Button";
import {
  Coupon,
  CouponActions,
  CouponHead,
  CouponNote,
  CouponTitle,
  FieldGrid,
  Perforation,
  type Field,
} from "./Coupon";
import { Icon } from "./Icon";
import { Stamp } from "./Stamp";

const KIND_LABEL: Record<Item["kind"], string> = {
  task: "TASK",
  event: "EVENT",
  ride: "RIDE",
  request: "REQUEST",
};

export interface CouponHandlers {
  onOpen: (id: string) => void;
  onDecline: (item: Item) => void;
  onReassign: (item: Item) => void;
  onAskHelper: (item: Item, leg: RideLeg) => void;
  onRecordReply: (item: Item, leg: RideLeg) => void;
  onConvert: (item: Item) => void;
  onReply: (item: Item) => void;
  onSetTime: (item: Item) => void;
}

export function ItemCoupon({
  item,
  handlers,
  today = new Date(),
  compact = false,
}: {
  item: Item;
  handlers: CouponHandlers;
  today?: Date;
  compact?: boolean;
}) {
  const { state, dispatch, toast } = useStore();
  const me = personById(state, state.actingAs)!;
  const isParent = me.role !== "child";
  const status = effectiveStatus(item);
  const assignee = personById(state, item.assigneeId);
  const requester = personById(state, item.requestedBy);
  const spent = item.status === "handled";

  const tone = spent
    ? "spent"
    : item.kind === "request"
      ? "child"
      : status === "declined" || (status === "unassigned" && item.priority)
        ? "urgent"
        : "plain";

  const sameDayAsToday = relativeDay(item.start, today) === "Today";
  const whenValue = item.noTime
    ? "NO TIME"
    : sameDayAsToday
      ? timeLabel(item.start)
      : `${weekdayShort(parse(item.start)).toUpperCase()} ${timeLabel(item.start).replace(":00", "").replace(" ", "")}`;

  const fields: Field[] =
    item.kind === "request"
      ? [
          { label: "From", value: requester?.name.toUpperCase() ?? "—", tone: "carbon" },
          {
            label: "Needed by",
            value: item.neededBy ? relativeDay(item.neededBy, today).toUpperCase() : "—",
          },
          {
            label: "Owner",
            value: assignee?.name.toUpperCase() ?? "NOBODY",
            tone: assignee ? "plain" : "void",
          },
        ]
      : [
          {
            label: "Who",
            value: assignee?.name.toUpperCase() ?? "NOBODY",
            tone: assignee ? "plain" : "void",
          },
          { label: "When", value: whenValue, tone: item.noTime ? "gold" : "plain" },
          { label: "Where", value: item.where?.toUpperCase() ?? "—", tone: item.where ? "plain" : "muted" },
        ];

  const showCornerStamp = item.kind !== "ride" && status !== "unassigned";

  return (
    <Coupon tone={tone} onClick={() => handlers.onOpen(item.id)} label={`Open ${item.title}`}>
      <CouponHead
        classification={`${KIND_LABEL[item.kind]} · ${relativeDay(item.start, today)}`}
        code={item.code}
      >
        {item.repeat ? <Icon name="repeat" size={13} /> : null}
        {item.priority && !spent ? <Icon name="flag" size={13} /> : null}
      </CouponHead>

      {showCornerStamp ? (
        <div className="stamp--corner">
          <Stamp key={status} status={status} />
        </div>
      ) : null}

      <CouponTitle sub={compact ? undefined : item.notes}>{item.title}</CouponTitle>

      <FieldGrid fields={fields} />

      {item.kind === "ride" && item.legs
        ? item.legs.map((leg, index) => (
            <div key={leg.id}>
              {index > 0 ? <Perforation label="tear here" /> : null}
              <LegRow item={item} leg={leg} handlers={handlers} today={today} />
            </div>
          ))
        : null}

      {item.status === "declined" && item.reason ? (
        <CouponNote tone="void">
          “{item.reason}” — {assignee?.name ?? "they"}, {clockStamp(lastActivityAt(item), today)}
        </CouponNote>
      ) : null}

      {item.kind === "request" && item.notes ? (
        <CouponNote>
          “{item.notes}” — {requester?.name ?? "A child"}
        </CouponNote>
      ) : null}

      {item.kind === "request" && item.photo && !spent ? (
        <div className="photo">
          <span className="photo__thumb" aria-hidden="true">
            <Icon name="camera" size={17} strokeWidth={1.5} />
          </span>
          <span className="photo__cap">
            Photo from {requester?.name ?? "them"}
            <i>Sample attachment — the beta build stores the real one</i>
          </span>
        </div>
      ) : null}

      {spent ? null : (
        <CouponActions>
          {renderActions()}
        </CouponActions>
      )}
    </Coupon>
  );

  function renderActions() {
    // A ride's buttons live on its legs, not on the coupon.
    if (item.kind === "ride") {
      if (item.legs?.every((l) => l.status === "accepted")) {
        return (
          <Button variant="primary" icon="check" onClick={() => mark()}>
            Mark handled
          </Button>
        );
      }
      return null;
    }

    if (item.kind === "request") {
      if (!isParent) {
        return (
          <Button variant="secondary" onClick={() => handlers.onOpen(item.id)}>
            See what happened
          </Button>
        );
      }
      return (
        <>
          <Button variant="secondary" onClick={() => handlers.onReply(item)}>
            Reply
          </Button>
          <Button variant="primary" onClick={() => handlers.onConvert(item)}>
            Make it a task
          </Button>
        </>
      );
    }

    if (item.status === "waiting" && item.assigneeId === me.id) {
      return (
        <>
          <Button variant="void" onClick={() => handlers.onDecline(item)}>
            Decline
          </Button>
          <Button variant="primary" icon="check" onClick={() => accept()}>
            Accept
          </Button>
        </>
      );
    }

    if (item.status === "waiting" && isParent) {
      return (
        <>
          <Button variant="secondary" onClick={() => handlers.onReassign(item)}>
            Reassign
          </Button>
          <Button variant="primary" onClick={() => handlers.onOpen(item.id)}>
            Open
          </Button>
        </>
      );
    }

    if (item.status === "declined" && isParent) {
      return (
        <>
          <Button variant="secondary" onClick={() => handlers.onOpen(item.id)}>
            Reply
          </Button>
          <Button variant="primary" icon="swap" onClick={() => handlers.onReassign(item)}>
            Reassign
          </Button>
        </>
      );
    }

    if (item.status === "unassigned") {
      if (item.noTime && item.kind === "event") {
        return (
          <>
            <Button variant="secondary" icon="clock" onClick={() => handlers.onSetTime(item)}>
              Set a time
            </Button>
            <Button variant="primary" onClick={() => take()}>
              I'll do it
            </Button>
          </>
        );
      }
      return (
        <>
          {isParent ? (
            <Button variant="secondary" icon="swap" onClick={() => handlers.onReassign(item)}>
              Assign
            </Button>
          ) : null}
          <Button variant="primary" onClick={() => take()}>
            I'll do it
          </Button>
        </>
      );
    }

    if (item.status === "accepted" && (item.assigneeId === me.id || isParent)) {
      return (
        <Button variant="primary" icon="check" onClick={() => mark()}>
          Mark handled
        </Button>
      );
    }

    return null;
  }

  function accept() {
    dispatch({ type: "respond", itemId: item.id, status: "accepted" });
    toast(`Accepted. ${personById(state, item.createdBy)?.name ?? "The assigner"} has been told.`);
  }

  function take() {
    dispatch({ type: "reassign", itemId: item.id, personId: me.id });
    dispatch({ type: "respond", itemId: item.id, status: "accepted" });
    toast(`${item.title} is yours.`);
  }

  function mark() {
    dispatch({ type: "handle", itemId: item.id });
    toast(`${item.title} moved to Handled.`);
  }
}

function LegRow({
  item,
  leg,
  handlers,
  today,
}: {
  item: Item;
  leg: RideLeg;
  handlers: CouponHandlers;
  today: Date;
}) {
  const { state, dispatch, toast } = useStore();
  const me = personById(state, state.actingAs)!;
  const isParent = me.role !== "child";
  const driver = personById(state, leg.driverId);
  const helper = helperById(state, leg.helperId);
  const kindLabel = leg.kind === "dropoff" ? "Drop-off" : "Pickup";

  const who =
    driver?.name ??
    (helper ? helper.name : null);

  return (
    <div className="leg">
      <div className="leg__what">
        <span className="leg__kind">
          <Icon name="car" size={12} />
          {kindLabel}
          <b className="tnum">{timeLabel(leg.time).replace(":00", "").replace(" ", "")}</b>
        </span>
        <span className={`leg__who${who ? "" : " leg__who--none"}`}>{who ?? "Nobody yet"}</span>
        {helper && leg.status === "waiting" && leg.askedAt ? (
          <span className="leg__since">Texted {timeLabel(leg.askedAt)} · no answer</span>
        ) : null}
      </div>

      <Stamp key={leg.status} status={leg.status} size="sm" tilt={-4} />

      {item.status !== "handled" && isParent ? (
        <span className="leg__acts">
          {leg.status === "unassigned" || leg.status === "waiting" ? (
            <Button variant="primary" className="btn--leg" onClick={() => claim()}>
              I'll drive
            </Button>
          ) : null}
          {leg.status === "waiting" && helper ? (
            <Button
              variant="secondary"
              className="btn--leg"
              onClick={() => handlers.onRecordReply(item, leg)}
            >
              Record reply
            </Button>
          ) : null}
          {leg.status === "unassigned" ? (
            <Button
              variant="secondary"
              className="btn--leg btn--icon"
              icon="message"
              aria-label={`Ask someone outside the family to do the ${kindLabel.toLowerCase()}`}
              title="Ask someone outside the family"
              onClick={() => handlers.onAskHelper(item, leg)}
            />
          ) : null}
        </span>
      ) : null}
    </div>
  );

  function claim() {
    dispatch({ type: "claim-leg", itemId: item.id, legId: leg.id, personId: me.id });
    toast(`You have the ${kindLabel.toLowerCase()} at ${timeLabel(leg.time)}.`);
    void today;
  }
}

function lastActivityAt(item: Item): string {
  return item.activity.length ? item.activity[item.activity.length - 1].at : item.createdAt;
}
