"use client";

import { useEffect, useRef } from "react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { useLanguage } from "@/lib/i18n/context";

export function AccountMenu({ name, email }: { name: string; email: string }) {
  const { t } = useLanguage();
  const displayName = name === "Traveler" ? t.nav.traveler : name;
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function dismiss(event: PointerEvent) {
      const details = ref.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <details ref={ref} className="account-menu" onKeyDown={(event) => {
      if (event.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    }}>
      <summary aria-label={t.nav.accountMenu} className="account-trigger">
        <span className="account-avatar" aria-hidden="true">{Array.from(displayName)[0]?.toUpperCase() || "T"}</span>
        <span className="hidden max-w-40 truncate sm:inline">{displayName}</span>
        <span aria-hidden="true">⌄</span>
      </summary>
      <div className="account-panel">
        <p className="break-words font-semibold">{displayName}</p>
        <p className="mb-5 mt-1 break-all text-sm text-muted">{email}</p>
        <LogoutButton />
      </div>
    </details>
  );
}

