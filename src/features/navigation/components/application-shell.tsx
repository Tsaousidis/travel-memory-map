import Link from "next/link";
import type { ReactNode } from "react";
import { AccountMenu } from "./account-menu";
import { Navigation } from "./navigation";

export function ApplicationShell({ children, name, email }: { children: ReactNode; name: string; email: string }) {
  return (
    <div className="application-shell">
      <a className="skip-link" href="#app-content">Skip to content</a>
      <aside className="app-sidebar">
        <Link href="/app" className="app-brand"><span aria-hidden="true">◎</span> Travel Memory Map</Link>
        <p className="eyebrow hidden px-4 pb-4 lg:block">Your collection</p>
        <Navigation />
        <div className="mt-auto hidden px-4 pb-6 pt-12 lg:block">
          <p className="font-display text-2xl">A world of<br />little moments.</p>
          <p className="mt-3 text-xs text-muted">Your travels. Your memories.</p>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="app-header">
          <span className="eyebrow">Your personal atlas</span>
          <AccountMenu name={name} email={email} />
        </header>
        <main id="app-content" tabIndex={-1} className="app-content">{children}</main>
      </div>
    </div>
  );
}
