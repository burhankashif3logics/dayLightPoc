import type { ReactNode } from "react";

/**
 * The coupon: notched corners, hairline-ruled fields, a dashed perforation
 * where a ride's legs divide. Nothing here is a generic card.
 */

export function Coupon({
  children,
  tone = "plain",
  onClick,
  label,
  className = "",
}: {
  children: ReactNode;
  tone?: "plain" | "spent" | "child" | "urgent";
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  const classes = `coupon coupon--${tone} ${className}`;
  // The edge is a real layer: it carries the printed hairline around every
  // cut corner, which a clipped inset ring cannot do.
  if (!onClick) {
    return (
      <article className={classes}>
        <div className="coupon__paper">{children}</div>
      </article>
    );
  }
  return (
    <article className={classes}>
      <button type="button" className="coupon__hit" onClick={onClick} aria-label={label}>
        <span className="sr-only">{label}</span>
      </button>
      <div className="coupon__paper">{children}</div>
    </article>
  );
}

export function CouponHead({
  classification,
  code,
  children,
}: {
  /** What this coupon is and when: "RIDE · TODAY". Not an editorial line. */
  classification: string;
  code?: string;
  children?: ReactNode;
}) {
  return (
    <header className="coupon__head">
      <span className="coupon__class">{classification}</span>
      {children}
      {code ? <span className="coupon__code tnum">{code}</span> : null}
    </header>
  );
}

export function CouponTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="coupon__title">
      <h3>{children}</h3>
      {sub ? <p>{sub}</p> : null}
    </div>
  );
}

export interface Field {
  label: string;
  value: string;
  tone?: "plain" | "void" | "gold" | "carbon" | "muted";
}

export function FieldGrid({ fields }: { fields: Field[] }) {
  return (
    <dl className="fields" style={{ "--cols": fields.length } as React.CSSProperties}>
      {fields.map((f) => (
        <div key={f.label} className={`fields__cell fields__cell--${f.tone ?? "plain"}`}>
          <dt>{f.label}</dt>
          <dd className="tnum">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Perforation({ label }: { label?: string }) {
  return (
    <div className="perf" role="separator">
      {label ? <span className="perf__label">{label}</span> : null}
    </div>
  );
}

export function CouponActions({ children }: { children: ReactNode }) {
  return <div className="coupon__actions">{children}</div>;
}

export function CouponNote({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "void" }) {
  return <p className={`coupon__note coupon__note--${tone}`}>{children}</p>;
}
