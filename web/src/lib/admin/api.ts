import { redirect } from "next/navigation";
import { getAdminSessionCookie, ADMIN_COOKIE_NAME } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5207";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Server-only fetch wrapper for `/api/admin/*` — relays the admin session cookie to the backend. */
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const sessionCookie = await getAdminSessionCookie();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(sessionCookie ? { Cookie: `${ADMIN_COOKIE_NAME}=${sessionCookie}` } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    redirect("/admin/login");
  }

  return response;
}

export async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await adminFetch(path, init);
  if (!response.ok) {
    const message = await response
      .clone()
      .json()
      .then((body: { error?: string }) => body.error)
      .catch(() => undefined);
    throw new AdminApiError(message ?? `Request to ${path} failed`, response.status);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
