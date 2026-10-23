import type { Status } from "../domain/types";

/**
 * The signature move. A state change stamps itself onto the coupon; nothing
 * disappears, it cancels. The word carries the state, so the stamp survives
 * greyscale and colour blindness.
 */

const WORDS: Record<Status, string> = {
  unassigned: "UNCLAIMED",
  waiting: "WAITING",
  accepted: "ACCEPTED",
  declined: "DECLINED",
  handled: "HANDLED",
};

export function Stamp({
  status,
  size = "md",
  tilt = -7,
  label,
}: {
  status: Status;
  size?: "sm" | "md";
  tilt?: number;
  label?: string;
}) {
  return (
    <span
      className={`stamp stamp--${status} stamp--${size}`}
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      {label ?? WORDS[status]}
    </span>
  );
}

export function statusWord(status: Status): string {
  return WORDS[status];
}
