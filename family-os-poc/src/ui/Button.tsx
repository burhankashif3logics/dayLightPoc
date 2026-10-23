import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "quiet" | "void";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: IconName;
  trailing?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

export function Button({
  variant = "secondary",
  icon,
  trailing,
  loading = false,
  block = false,
  children,
  className = "",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`btn btn--${variant}${block ? " btn--block" : ""}${loading ? " is-loading" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {icon ? <Icon name={icon} size={17} /> : null}
      <span className="btn__label">{children}</span>
      {trailing}
    </button>
  );
}
