// In the browser, requests go to this site's own /api/* (proxied to the backend
// by the rewrite in next.config.ts); on the server there is no origin to be
// relative to, so we hit the backend directly.
export const API_URL =
  typeof window === "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5207") : "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** fetch wrapper for the HakoriCo.Api backend — always sends the cart cookie. */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  return response;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  if (!response.ok) {
    const message = await response
      .clone()
      .json()
      .then((body: { error?: string }) => body.error)
      .catch(() => undefined);
    throw new ApiError(message ?? `Request to ${path} failed`, response.status);
  }
  return response.json() as Promise<T>;
}
