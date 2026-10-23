"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { AccountMenu } from "./account-menu";
import { LanguageSwitcher } from "./language-switcher";
import { Navigation } from "./navigation";

export function ApplicationShell({ children, name, email }: { children: ReactNode; name: string; email: string }) {
  const { t } = useLanguage();

  return (
    <div className="application-shell">
      <a className="skip-link" href="#app-content">{t.nav.skipToContent}</a>
      <aside className="app-sidebar">
        <Link href="/app" className="app-brand"><span aria-hidden="true">◎</span> {t.common.appName}</Link>
        <p className="eyebrow hidden px-4 pb-4 lg:block">{t.nav.yourCollection}</p>
        <Navigation />
        <div className="mt-auto hidden px-4 pb-6 pt-12 lg:block">
          <p className="font-display text-2xl whitespace-pre-line">{t.nav.worldQuote}</p>
          <p className="mt-3 text-xs text-muted">{t.nav.worldSubquote}</p>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-header">
          <div className="app-header__context">
            <span aria-hidden="true">⌁</span>
            <span className="eyebrow">{t.nav.personalAtlas}</span>
          </div>
          <div className="app-header__actions">
            <LanguageSwitcher />
            <Link className="button button--primary app-header__cta" href="/app/trips#record-trip">
              {t.nav.recordTrip}
            </Link>
            <AccountMenu name={name} email={email} />
          </div>
        </header>
        <main id="app-content" tabIndex={-1} className="app-content">{children}</main>
      </div>
    </div>
  );
}

