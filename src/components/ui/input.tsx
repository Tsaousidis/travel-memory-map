"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

type InputProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, id, className = "", "aria-describedby": describedBy, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const description = [describedBy, hint && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <input {...props} id={inputId} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={description || undefined} className={`input ${className}`} />
      {hint && <p id={`${inputId}-hint`} className="field-hint">{hint}</p>}
      {error && <p id={`${inputId}-error`} className="field-error">{error}</p>}
    </div>
  );
}
