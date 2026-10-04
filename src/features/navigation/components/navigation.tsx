"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/app", label: "Map", symbol: "◎" },
  { href: "/app/trips", label: "Trips", symbol: "▤" },
  { href: "/app/dashboard", label: "Dashboard", symbol: "▥" },
];

export function Navigation() {
  const pathname = usePathname();
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
