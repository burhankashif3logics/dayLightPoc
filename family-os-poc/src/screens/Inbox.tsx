import { useEffect } from "react";
import { clockStamp } from "../domain/dates";
import { personById } from "../domain/rules";
import type { NotificationType } from "../domain/types";
import { useStore } from "../store/store";
import { EmptyState, SectionRule } from "../ui/bits";
import { Icon, type IconName } from "../ui/Icon";

const TYPE_META: Record<NotificationType, { label: string; icon: IconName }> = {
  assignment: { label: "Assigned to you", icon: "mine" },
  decline: { label: "Declined", icon: "close" },
  reassignment: { label: "Reassigned", icon: "swap" },
  comment: { label: "Comment", icon: "message" },
  status: { label: "Status change", icon: "check" },
  request: { label: "Kid request", icon: "bell" },
};

export function Inbox({
  onBack,
  onOpen,
  today,
}: {
  onBack: () => void;
  onOpen: (id: string) => void;
  today: Date;
}) {
  const { state, dispatch } = useStore();
  const me = personById(state, state.actingAs)!;
  const mine = state.notifications
    .filter((n) => n.forId === me.id && !state.muted.includes(n.type))
    .sort((a, b) => b.at.localeCompare(a.at));
  const muted = state.notifications.filter(
    (n) => n.forId === me.id && state.muted.includes(n.type),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch({ type: "read-notifications" }), 900);
    return () => window.clearTimeout(timer);
  }, [dispatch]);

  return (
    <>
      <div className="rail">
        <button type="button" className="rail__back" onClick={onBack}>
          <Icon name="back" size={16} /> Back
        </button>
        <h1 className="rail__h--sm">Inbox</h1>
        <p className="rail__lede">
          Reminders go out at 6 PM the day before and 1 hour before. Both are on.
        </p>
      </div>

      {mine.length ? (
        <>
          <SectionRule meta={`${mine.length}`}>Recent</SectionRule>
          <div className="stack stack--rows">
            {mine.map((n) => {
              const meta = TYPE_META[n.type];
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`notice${n.read ? "" : " notice--unread"}`}
                  onClick={() => onOpen(n.itemId)}
                >
                  <span className="notice__icon">
                    <Icon name={meta.icon} size={15} />
                  </span>
                  <span className="notice__body">
                    <span className="notice__label tnum">{meta.label.toUpperCase()}</span>
                    <b>{n.body}</b>
                    <time className="tnum">{clockStamp(n.at, today)}</time>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="stack">
          <EmptyState
            icon="bell"
            title="Nothing new"
            body="Assignments, declines, reassignments, comments, status changes and kid requests land here."
          />
        </div>
      )}

      {muted.length ? (
        <>
          <SectionRule meta={`${muted.length}`}>Muted by type</SectionRule>
          <p className="mutednote">
            {muted.length} {muted.length === 1 ? "notice is" : "notices are"} held back by your mute
            settings. Turn a type back on under the family panel.
          </p>
        </>
      ) : null}
    </>
  );
}
