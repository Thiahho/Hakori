import { apiFetch } from "./api";

export type NewsletterResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "No pudimos procesar tu solicitud. Probá de nuevo en unos minutos.";

export async function subscribeEmail(email: string, honeypot?: string): Promise<NewsletterResult> {
  try {
    const response = await apiFetch("/api/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email, honeypot }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    return body.ok ? { ok: true } : { ok: false, error: body.error ?? GENERIC_ERROR };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function unsubscribeEmail(email: string): Promise<NewsletterResult> {
  try {
    const response = await apiFetch("/api/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    const body = (await response.json()) as { ok: boolean; error?: string };
    return body.ok ? { ok: true } : { ok: false, error: body.error ?? GENERIC_ERROR };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
