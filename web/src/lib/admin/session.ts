import { cookies } from "next/headers";

/**
 * BFF cookie relay: this holds the raw value of the backend's ASP.NET
 * Identity auth cookie, but scoped to the `web` origin. The browser only
 * ever talks to `web`; the Next.js server reads this and forwards it as
 * `Cookie:` on server-to-server calls to the .NET API (see lib/admin/api.ts).
 */
const COOKIE_NAME = "hakori_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

/**
 * Non-httpOnly companion to the session cookie, readable by client JS.
 * Carries no auth value (just "1") — it only lets the storefront show/hide
 * an "Admin" link without forcing every public page into dynamic rendering
 * (reading the real, httpOnly session cookie server-side would do that).
 * The backend never sees or trusts this cookie.
 */
const HINT_COOKIE_NAME = "hakori_admin_hint";

export async function getAdminSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function setAdminSessionCookie(value: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  store.set(HINT_COOKIE_NAME, "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(HINT_COOKIE_NAME);
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME, HINT_COOKIE_NAME as ADMIN_HINT_COOKIE_NAME };
