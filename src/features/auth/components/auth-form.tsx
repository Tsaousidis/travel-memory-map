"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signup } from "@/features/auth/actions";
import type { AuthState } from "@/features/auth/validation";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState<AuthState, FormData>(isSignup ? signup : login, {});
  return (
    <form action={action} className="grid gap-5" noValidate aria-busy={pending}>
      {isSignup && <Input label="Your name" name="displayName" autoComplete="name" maxLength={100} required error={state.fields?.displayName} />}
      <Input label="Email address" name="email" type="email" autoComplete="email" maxLength={254} required error={state.fields?.email} />
      <Input label="Password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} maxLength={128} required error={state.fields?.password} hint={isSignup ? "At least 8 characters. A longer, unique password is best." : undefined} />
      {state.error && <p role="alert" className="field-error">{state.error}</p>}
      {state.message && <p role="status" className="rounded-lg bg-background p-4 text-sm">{state.message}</p>}
      <Button type="submit" loading={pending}>{pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}</Button>
      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New to Travel Memory Map? "}
        <Link className="font-semibold text-accent underline underline-offset-4" href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
