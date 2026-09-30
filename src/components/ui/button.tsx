import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

export function Button({ variant = "primary", loading = false, disabled, type = "button", className = "", children, ...props }: ButtonProps) {
  return (
    <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`button button--${variant} ${className}`}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
