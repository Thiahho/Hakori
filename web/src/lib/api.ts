export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
