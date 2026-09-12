"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const HINT_COOKIE_NAME = "hakori_admin_hint";

function hasAdminHintCookie() {
  return document.cookie.split("; ").some((c) => c.startsWith(`${HINT_COOKIE_NAME}=`));
}

function getServerSnapshot() {
  return false;
}

function subscribe() {
  return () => {};
}

/**
 * Purely a UX shortcut — reads a non-httpOnly hint cookie set alongside the
 * real (httpOnly) admin session cookie, so the storefront can show/hide this
 * link without forcing every public page into dynamic rendering. It grants
 * no access on its own: /admin is still gated server-side by proxy.ts and
 * the backend.
 */
export function AdminLink() {
  const hasSession = useSyncExternalStore(subscribe, hasAdminHintCookie, getServerSnapshot);

  if (!hasSession) {
    return null;
  }

  return (
    <Link
      href="/admin/products"
      aria-label="Admin"
      className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-70"
    >
      <span className="hidden sm:inline">Admin</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-ink">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>
      </span>
    </Link>
  );
}
