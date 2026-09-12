"use server";

import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, clearAdminSessionCookie, setAdminSessionCookie } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5207";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá email y contraseña." };
  }

  const response = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const sessionValue = extractCookieValue(response.headers.getSetCookie(), ADMIN_COOKIE_NAME);

  if (!response.ok || !sessionValue) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    return { error: body.error ?? "No pudimos iniciar sesión. Probá de nuevo." };
  }

  await setAdminSessionCookie(sessionValue);
  redirect("/admin/products");
}

export async function logoutAction(): Promise<void> {
  await fetch(`${API_URL}/api/admin/logout`, { method: "POST", cache: "no-store" }).catch(() => {});
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

function extractCookieValue(setCookieHeaders: string[], name: string): string | undefined {
  const raw = setCookieHeaders.find((header) => header.startsWith(`${name}=`));
  if (!raw) {
    return undefined;
  }
  const pair = raw.split(";")[0];
  return pair.slice(name.length + 1);
}
