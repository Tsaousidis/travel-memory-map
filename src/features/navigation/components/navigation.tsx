"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const destinations = [
    { href: "/app", label: t.nav.map, symbol: "◎" },
    { href: "/app/trips", label: t.nav.trips, symbol: "▤" },
    { href: "/app/dashboard", label: t.nav.dashboard, symbol: "▥" },
  ];

  return (
    <nav aria-label="Main navigation" className="app-navigation">
      {destinations.map(({ href, label, symbol }) => {
        const active = href === "/app" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className="app-nav-link">
            <span aria-hidden="true" className="text-xl">{symbol}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

