import { useEffect, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import type { Person } from "../domain/types";

export function SectionRule({
  children,
  meta,
  action,
}: {
  children: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rule">
      <h2>{children}</h2>
      <span className="rule__line" />
      {meta ? <span className="rule__meta tnum">{meta}</span> : null}
      {action}
    </div>
  );
}

export function Avatar({ person, size = 26 }: { person: Person; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ "--tint": person.tint, "--size": `${size}px` } as React.CSSProperties}
      aria-hidden="true"
    >
      {person.initials}
    </span>
  );
}

export function PersonLine({ person, detail }: { person: Person; detail?: ReactNode }) {
  return (
    <span className="personline">
      <Avatar person={person} size={22} />
      <b>{person.name}</b>
      {detail ? <i>{detail}</i> : null}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty__mark">
        <Icon name={icon} size={22} strokeWidth={1.4} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

/** Overlays escape their container: a real <dialog>, not a positioned div. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
    >
      <div className="sheet__body">
        <header className="sheet__head">
          <span className="sheet__grip" aria-hidden="true" />
          <h2>{title}</h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="sheet__content">{children}</div>
        {footer ? <footer className="sheet__foot">{footer}</footer> : null}
      </div>
    </dialog>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="formfield">
      <span className="formfield__label">{label}</span>
      {children}
      {hint ? <span className="formfield__hint">{hint}</span> : null}
    </label>
  );
}

/**
 * A flag is a ruled band, not a rounded card: a tab-caps tag in the state's
 * own colour, hairlines above and below, set straight on the stock.
 */
export function Alert({
  tone = "gold",
  tag = "FLAG",
  children,
  action,
}: {
  tone?: "gold" | "void";
  tag?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`band band--${tone}`}>
      <span className="band__tag">{tag}</span>
      <p>{children}</p>
      {action}
    </div>
  );
}
