"use server";

import { Resend } from "resend";

export type UnsubscribeResult = { ok: true } | { ok: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR =
  "No pudimos procesar tu baja. Probá de nuevo en unos minutos.";

export async function unsubscribeEmail(
  email: string,
): Promise<UnsubscribeResult> {
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Ingresá un email válido." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error(
      "unsubscribeEmail: falta configurar RESEND_API_KEY o RESEND_AUDIENCE_ID.",
    );
    return { ok: false, error: GENERIC_ERROR };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.contacts.update({
    email,
    audienceId,
    unsubscribed: true,
  });

  if (error) {
    // Si el contacto no existe, ya está "de baja" desde el punto de vista
    // del usuario: no tiene sentido mostrarle un error.
    if (error.name === "not_found") {
      return { ok: true };
    }
    console.error("unsubscribeEmail: error al dar de baja el contacto:", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}
