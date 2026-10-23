import { useState } from "react";
import { personById } from "../domain/rules";
import type { NotificationType } from "../domain/types";
import { useStore } from "../store/store";
import { Button } from "../ui/Button";
import { Avatar, Field, SectionRule } from "../ui/bits";
import { Icon } from "../ui/Icon";

const TYPES: { id: NotificationType; label: string; detail: string }[] = [
  { id: "assignment", label: "Assignments", detail: "Someone gives you an item" },
  { id: "decline", label: "Declines", detail: "Someone says no, with a reason" },
  { id: "reassignment", label: "Reassignments", detail: "An item changes hands" },
  { id: "comment", label: "Comments and @mentions", detail: "Someone writes on an item" },
  { id: "status", label: "Status changes", detail: "Accepted, handled, driver found" },
  { id: "request", label: "Kid requests", detail: "A child asks for something" },
];

export function Settings({ onBack }: { onBack: () => void }) {
  const { state, dispatch, toast } = useStore();
  const me = personById(state, state.actingAs)!;
  const [feedback, setFeedback] = useState("");

  return (
    <>
      <div className="rail">
        <button type="button" className="rail__back" onClick={onBack}>
          <Icon name="back" size={16} /> Back
        </button>
        <h1 className="rail__h--sm">The {state.family.name} family</h1>
        <p className="rail__lede">
          One family per account. Parents create the child accounts.
        </p>
      </div>

      <SectionRule meta={`${state.family.members.length}`}>Members</SectionRule>
      <div className="stack stack--rows">
        {state.family.members.map((p) => (
          <div key={p.id} className="listrow listrow--static">
            <Avatar person={p} size={32} />
            <span className="listrow__main">
              <b>
                {p.name}
                {p.id === me.id ? " (you)" : ""}
              </b>
              <span>
                {p.role === "admin" ? "Family admin" : p.role === "parent" ? "Parent" : "Child account"}
              </span>
            </span>
            {p.role === "child" ? (
              <span className="tagline tnum">NAME · PHOTO · TASKS</span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="settingsnote">
        A child account holds a name, a photo and their tasks. Nothing else, no ads, no sharing.
        Sign-in, invitations and child-profile setup are screens in Phase 1; this POC puts you
        straight into the family.
      </p>

      <SectionRule meta={`${state.family.helpers.length}`}>Outside helpers</SectionRule>
      <div className="stack stack--rows">
        {state.family.helpers.map((h) => (
          <div key={h.id} className="listrow listrow--static">
            <span className="helpermark" aria-hidden="true">
              <Icon name="message" size={15} />
            </span>
            <span className="listrow__main">
              <b>{h.name}</b>
              <span>
                {h.relation} · <span className="tnum">{h.phone}</span>
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="settingsnote">
        No accounts. A parent's phone texts them and records the reply by hand.
      </p>

      <SectionRule>Reminders</SectionRule>
      <div className="sheetgroup">
        <SwitchRow
          label="6 PM the day before"
          detail="Default, pending the Monday walkthrough"
          checked={state.reminders.eveningBefore}
          onChange={(v) => dispatch({ type: "set-reminder", key: "eveningBefore", value: v })}
        />
        <SwitchRow
          label="1 hour before"
          detail="Default, pending the Monday walkthrough"
          checked={state.reminders.hourBefore}
          onChange={(v) => dispatch({ type: "set-reminder", key: "hourBefore", value: v })}
        />
      </div>

      <SectionRule>Mute by type</SectionRule>
      <div className="sheetgroup">
        {TYPES.map((t) => (
          <SwitchRow
            key={t.id}
            label={t.label}
            detail={t.detail}
            checked={!state.muted.includes(t.id)}
            onChange={() => dispatch({ type: "toggle-mute", notificationType: t.id })}
          />
        ))}
      </div>

      <SectionRule>Beta feedback</SectionRule>
      <div className="stack">
        <Field label="What broke, or what is missing?" hint="Goes to the build team with your device details.">
          <textarea
            className="textarea"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="The decline notification took a while to land on Android."
          />
        </Field>
        <Button
          variant="primary"
          block
          disabled={!feedback.trim()}
          onClick={() => {
            dispatch({ type: "feedback", body: feedback.trim() });
            setFeedback("");
            toast("Sent. Crash reports and usage analytics ride along in the beta build.");
          }}
        >
          Send feedback
        </Button>
        {state.feedback.length ? (
          <p className="settingsnote">
            {state.feedback.length} {state.feedback.length === 1 ? "note" : "notes"} sent this session.
          </p>
        ) : null}
      </div>

      <div className="stack">
        <Button
          variant="secondary"
          block
          icon="repeat"
          onClick={() => {
            dispatch({ type: "reset" });
            toast("The sample week is back to how it started.");
          }}
        >
          Reset the sample week
        </Button>
      </div>
    </>
  );
}

function SwitchRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="switchrow">
      <span className="switchrow__text">
        <b>{label}</b>
        <span>{detail}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="switch"
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}
