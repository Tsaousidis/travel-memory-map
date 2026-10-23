"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";
import type { AuthState } from "@/features/auth/validation";
import { useLanguage } from "@/lib/i18n/context";

export function LogoutButton() {
  const [state, action, pending] = useActionState<AuthState>(logout, {});
  const { t } = useLanguage();

  return (
    <form action={action} className="grid gap-3">
      <Button variant="secondary" type="submit" loading={pending}>
        {pending ? t.nav.signingOut : t.nav.signOut}
      </Button>
      {state.error && <p role="alert" className="field-error">{state.error}</p>}
    </form>
  );
}

