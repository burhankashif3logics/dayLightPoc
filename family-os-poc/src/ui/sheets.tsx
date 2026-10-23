import { useEffect, useState } from "react";
import { isoDate, parse, timeLabel } from "../domain/dates";
import { helperById, personById } from "../domain/rules";
import type { Item, ItemKind, RideLeg } from "../domain/types";
import { useStore, type NewItemDraft } from "../store/store";
import { Button } from "./Button";
import { Avatar, Field, Sheet } from "./bits";
import { Icon } from "./Icon";

export type Dialog =
  | { kind: "none" }
  | { kind: "decline"; item: Item }
  | { kind: "reassign"; item: Item }
  | { kind: "ask-helper"; item: Item; leg: RideLeg }
  | { kind: "record-reply"; item: Item; leg: RideLeg }
  | { kind: "convert"; item: Item }
  | { kind: "reply"; item: Item }
  | { kind: "set-time"; item: Item }
  | { kind: "compose"; itemKind: ItemKind };

const QUICK_REASONS = [
  "I'm at work until 6.",
  "I'm already driving the other one.",
  "Not back in time.",
  "Can you take this one?",
];

export function Sheets({ dialog, close }: { dialog: Dialog; close: () => void }) {
  return (
    <>
      <DeclineSheet dialog={dialog} close={close} />
      <ReassignSheet dialog={dialog} close={close} />
      <AskHelperSheet dialog={dialog} close={close} />
      <RecordReplySheet dialog={dialog} close={close} />
      <ConvertSheet dialog={dialog} close={close} />
      <ReplySheet dialog={dialog} close={close} />
      <SetTimeSheet dialog={dialog} close={close} />
      <ComposeSheet dialog={dialog} close={close} />
    </>
  );
}

interface Props {
  dialog: Dialog;
  close: () => void;
}

function DeclineSheet({ dialog, close }: Props) {
  const { dispatch, toast, state } = useStore();
  const open = dialog.kind === "decline";
  const item = open ? dialog.item : null;
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open, item?.id]);

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Decline — and say why"
      footer={
        <>
          <Button onClick={close}>Keep it</Button>
          <Button
            variant="void"
            disabled={!reason.trim()}
            onClick={() => {
              if (!item) return;
              dispatch({ type: "respond", itemId: item.id, status: "declined", reason: reason.trim() });
              toast(
                `Declined. ${personById(state, item.createdBy)?.name ?? "The assigner"} gets this within a minute.`,
              );
              close();
            }}
          >
            Decline
          </Button>
        </>
      }
    >
      <p className="sheet__lede">
        {item?.title} — a reason is what makes the next person's decision quick.
      </p>
      <Field label="Reason">
        <textarea
          className="textarea"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Say what is in the way."
          maxLength={160}
        />
      </Field>
      <div className="chips">
        {QUICK_REASONS.map((r) => (
          <button key={r} type="button" className="chip" onClick={() => setReason(r)}>
            {r}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function ReassignSheet({ dialog, close }: Props) {
  const { state, dispatch, toast } = useStore();
  const open = dialog.kind === "reassign";
  const item = open ? dialog.item : null;
  const me = personById(state, state.actingAs)!;
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (open) setPicked(null);
  }, [open, item?.id]);

  // A child cannot assign work to a parent.
  const candidates = state.family.members.filter((p) => {
    if (p.id === item?.assigneeId) return false;
    if (me.role === "child") return p.id === me.id;
    return true;
  });

  return (
    <Sheet
      open={open}
      onClose={close}
      title={item?.status === "declined" ? "Who takes it instead?" : "Who should own this?"}
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!picked}
            onClick={() => {
              if (!item || !picked) return;
              dispatch({ type: "reassign", itemId: item.id, personId: picked });
              if (picked === me.id) dispatch({ type: "respond", itemId: item.id, status: "accepted" });
              toast(
                picked === me.id
                  ? `${item.title} is yours.`
                  : `Sent to ${personById(state, picked)?.name}. They have it on their phone.`,
              );
              close();
            }}
          >
            Assign
          </Button>
        </>
      }
    >
      <p className="sheet__lede">{item?.title}</p>
      {item?.reason ? <p className="sheet__quote">“{item.reason}”</p> : null}
      <div className="chips chips--stack">
        {candidates.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip chip--wide"
            aria-pressed={picked === p.id}
            onClick={() => setPicked(p.id)}
          >
            <Avatar person={p} size={28} />
            <span className="chip__name">
              {p.id === me.id ? `${p.name} (you)` : p.name}
              <i>{p.role === "child" ? "Child" : p.role === "admin" ? "Family admin" : "Parent"}</i>
            </span>
            {picked === p.id ? <Icon name="check" size={16} /> : null}
          </button>
        ))}
      </div>
      {me.role === "child" ? (
        <p className="sheet__note">
          You can take this on yourself. Only a parent can hand it to someone else.
        </p>
      ) : null}
    </Sheet>
  );
}

function AskHelperSheet({ dialog, close }: Props) {
  const { state, dispatch, toast } = useStore();
  const open = dialog.kind === "ask-helper";
  const item = open ? dialog.item : null;
  const leg = open ? dialog.leg : null;
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (open) setPicked(state.family.helpers[0]?.id ?? null);
  }, [open, leg?.id, state.family.helpers]);

  const helper = helperById(state, picked);
  const kindLabel = leg?.kind === "pickup" ? "pick up" : "drop off";
  const child = personById(state, item?.assigneeId);
  const message =
    item && leg
      ? `Hi${helper ? ` ${helper.name.split(" ")[0]}` : ""} — any chance you could ${kindLabel} ${child?.name ?? "the kids"} at ${item.where ?? "the usual place"} on ${new Date(parse(leg.time)).toLocaleDateString("en-US", { weekday: "long" })} at ${timeLabel(leg.time)}? No worries if not. — ${personById(state, state.actingAs)?.name}`
      : "";

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Ask someone outside the family"
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            icon="send"
            disabled={!picked}
            onClick={() => {
              if (!item || !leg || !picked) return;
              dispatch({ type: "ask-helper", itemId: item.id, legId: leg.id, helperId: picked });
              const sms = `sms:${helper?.phone ?? ""}${/iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(message)}`;
              window.open(sms, "_self");
              toast(`Asked ${helper?.name}. The leg reads WAITING until you record the reply.`);
              close();
            }}
          >
            Open Messages
          </Button>
        </>
      }
    >
      <p className="sheet__lede">
        They have no account and never will. Your phone sends the text; you record what they say.
      </p>
      <div className="chips chips--stack">
        {state.family.helpers.map((h) => (
          <button
            key={h.id}
            type="button"
            className="chip chip--wide"
            aria-pressed={picked === h.id}
            onClick={() => setPicked(h.id)}
          >
            <span className="helpermark" aria-hidden="true">
              <Icon name="message" size={15} />
            </span>
            <span className="chip__name">
              {h.name}
              <i>{h.relation}</i>
            </span>
            {picked === h.id ? <Icon name="check" size={16} /> : null}
          </button>
        ))}
      </div>
      <div className="smspreview">
        <span className="smspreview__label tnum">TO {helper?.phone ?? "—"}</span>
        <p className="smspreview__bubble">{message}</p>
      </div>
    </Sheet>
  );
}

function RecordReplySheet({ dialog, close }: Props) {
  const { state, dispatch, toast } = useStore();
  const open = dialog.kind === "record-reply";
  const item = open ? dialog.item : null;
  const leg = open ? dialog.leg : null;
  const helper = helperById(state, leg?.helperId);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open, leg?.id]);

  return (
    <Sheet open={open} onClose={close} title={`What did ${helper?.name ?? "they"} say?`}>
      <p className="sheet__lede">
        Asked {leg?.askedAt ? timeLabel(leg.askedAt) : "earlier"}. Nothing moves until you record it.
      </p>
      <div className="replychoice">
        <button
          type="button"
          className="replychoice__yes"
          onClick={() => {
            if (!item || !leg) return;
            dispatch({ type: "record-reply", itemId: item.id, legId: leg.id, accepted: true });
            toast(`${helper?.name} is driving. Stamped ACCEPTED.`);
            close();
          }}
        >
          <Icon name="check" size={22} />
          <b>Yes, they can</b>
          <span>Stamps the leg ACCEPTED</span>
        </button>
        <button
          type="button"
          className="replychoice__no"
          onClick={() => {
            if (!item || !leg) return;
            dispatch({
              type: "record-reply",
              itemId: item.id,
              legId: leg.id,
              accepted: false,
              note: note.trim() || undefined,
            });
            toast("Back on the board. Nobody is driving that leg.");
            close();
          }}
        >
          <Icon name="close" size={22} />
          <b>No, they can't</b>
          <span>Puts the leg back as unclaimed</span>
        </button>
      </div>
      <Field label="What they said" hint="Optional. It joins the item's history.">
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Sorry, I have the dog that afternoon."
        />
      </Field>
    </Sheet>
  );
}

function ConvertSheet({ dialog, close }: Props) {
  const { state, dispatch, toast } = useStore();
  const open = dialog.kind === "convert";
  const item = open ? dialog.item : null;
  const me = personById(state, state.actingAs)!;
  const [picked, setPicked] = useState<string>(me.id);

  useEffect(() => {
    if (open) setPicked(me.id);
  }, [open, item?.id, me.id]);

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Turn the request into a task"
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!item) return;
              dispatch({ type: "convert-request", itemId: item.id, personId: picked });
              toast(
                picked === me.id
                  ? "It's a task on your list now."
                  : `Sent to ${personById(state, picked)?.name}.`,
              );
              close();
            }}
          >
            Create the task
          </Button>
        </>
      }
    >
      <p className="sheet__lede">
        {item?.title} — {personById(state, item?.requestedBy)?.name ?? "A child"} asked
        {item?.neededBy ? `, needed by ${item.neededBy}` : ""}.
      </p>
      <div className="chips chips--stack">
        {state.family.members
          .filter((p) => p.role !== "child")
          .map((p) => (
            <button
              key={p.id}
              type="button"
              className="chip chip--wide"
              aria-pressed={picked === p.id}
              onClick={() => setPicked(p.id)}
            >
              <Avatar person={p} size={28} />
              <span className="chip__name">
                {p.id === me.id ? `${p.name} (you)` : p.name}
                <i>{p.role === "admin" ? "Family admin" : "Parent"}</i>
              </span>
              {picked === p.id ? <Icon name="check" size={16} /> : null}
            </button>
          ))}
      </div>
    </Sheet>
  );
}

function ReplySheet({ dialog, close }: Props) {
  const { dispatch, toast } = useStore();
  const open = dialog.kind === "reply";
  const item = open ? dialog.item : null;
  const [body, setBody] = useState("");

  useEffect(() => {
    if (open) setBody("");
  }, [open, item?.id]);

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Reply and close it"
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!body.trim()}
            onClick={() => {
              if (!item) return;
              dispatch({ type: "reply-request", itemId: item.id, body: body.trim() });
              toast("Replied. The request moved to Handled.");
              close();
            }}
          >
            Send reply
          </Button>
        </>
      }
    >
      <p className="sheet__lede">{item?.title}</p>
      <Field label="Your reply">
        <textarea
          className="textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Got it — we'll pick them up Thursday."
          maxLength={240}
        />
      </Field>
    </Sheet>
  );
}

function SetTimeSheet({ dialog, close }: Props) {
  const { dispatch, toast } = useStore();
  const open = dialog.kind === "set-time";
  const item = open ? dialog.item : null;
  const [time, setTime] = useState("16:00");

  useEffect(() => {
    if (open) setTime("16:00");
  }, [open, item?.id]);

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Put a time on it"
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!item) return;
              const day = isoDate(parse(item.start));
              dispatch({ type: "set-time", itemId: item.id, time: `${day}T${time}` });
              toast("Time set. The conflict flag clears.");
              close();
            }}
          >
            Set time
          </Button>
        </>
      }
    >
      <p className="sheet__lede">
        {item?.title} has a day but no time, so nothing can tell whether it clashes.
      </p>
      <Field label="Time">
        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </Field>
    </Sheet>
  );
}

function ComposeSheet({ dialog, close }: Props) {
  const { state, dispatch, toast } = useStore();
  const open = dialog.kind === "compose";
  const kind = open ? dialog.itemKind : "task";
  const me = personById(state, state.actingAs)!;
  const isChild = me.role === "child";
  const today = isoDate(new Date());

  const [draft, setDraft] = useState<NewItemDraft>({
    kind,
    title: "",
    day: today,
    time: null,
    assigneeId: null,
  });

  useEffect(() => {
    if (open) {
      setDraft({
        kind,
        title: "",
        day: today,
        time: kind === "request" ? null : "16:00",
        assigneeId: null,
        neededBy: kind === "request" ? today : undefined,
      });
    }
  }, [open, kind, today]);

  const title =
    kind === "request" ? "Ask a parent for something" : kind === "ride" ? "New ride" : kind === "event" ? "New event" : "New task";

  return (
    <Sheet
      open={open}
      onClose={close}
      title={title}
      footer={
        <>
          <Button onClick={close}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!draft.title.trim()}
            onClick={() => {
              dispatch({ type: "create", draft: { ...draft, title: draft.title.trim() } });
              toast(
                kind === "request"
                  ? "Sent. A parent sees it on their phone within a minute."
                  : draft.assigneeId
                    ? `Sent to ${personById(state, draft.assigneeId)?.name}.`
                    : "Created. Nobody owns it yet.",
              );
              close();
            }}
          >
            {kind === "request" ? "Send to a parent" : "Create"}
          </Button>
        </>
      }
    >
      <Field label={kind === "request" ? "What do you need?" : "What is it?"}>
        <input
          className="input"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder={kind === "request" ? "Soccer cleats, size 4" : "Pick up the cake"}
          autoFocus
        />
      </Field>

      <Field label={kind === "request" ? "By when" : "Day"}>
        <input
          className="input"
          type="date"
          value={kind === "request" ? (draft.neededBy ?? today) : draft.day}
          onChange={(e) =>
            setDraft(
              kind === "request"
                ? { ...draft, neededBy: e.target.value, day: e.target.value }
                : { ...draft, day: e.target.value },
            )
          }
        />
      </Field>

      {kind !== "request" ? (
        <Field label="Time" hint="Leave it empty and the item is flagged as having no time.">
          <input
            className="input"
            type="time"
            value={draft.time ?? ""}
            onChange={(e) => setDraft({ ...draft, time: e.target.value || null })}
          />
        </Field>
      ) : null}

      <Field label="Notes">
        <textarea
          className="textarea"
          value={draft.notes ?? ""}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          placeholder={kind === "request" ? "Mine are too small, coach said by Friday." : "Anything the owner needs to know."}
        />
      </Field>

      {kind !== "request" && !isChild ? (
        <Field label="Who owns it">
          <div className="chips">
            {state.family.members.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                aria-pressed={draft.assigneeId === p.id}
                onClick={() =>
                  setDraft({ ...draft, assigneeId: draft.assigneeId === p.id ? null : p.id })
                }
              >
                <Avatar person={p} size={22} />
                {p.id === me.id ? "Me" : p.name}
              </button>
            ))}
          </div>
        </Field>
      ) : null}

      {isChild && kind !== "request" ? (
        <p className="sheet__note">This goes on your own list. Only a parent can assign it elsewhere.</p>
      ) : null}
    </Sheet>
  );
}
