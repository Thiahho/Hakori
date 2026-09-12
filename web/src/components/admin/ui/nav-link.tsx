"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-cream text-ink" : "text-cream/60 hover:bg-white/5 hover:text-cream"
      }`}
    >
      <span className={active ? "text-ink" : "text-cream/40"}>{icon}</span>
      {children}
    </Link>
  );
}
