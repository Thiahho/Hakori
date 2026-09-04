"use server";

import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome-email";

export type SubscribeResult = { ok: true } | { ok: false; error: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR =
  "No pudimos procesar tu suscripción. Probá de nuevo en unos minutos.";

export async function subscribeEmail(
  email: string,
  honeypot?: string,
): Promise<SubscribeResult> {
  // Campo trampa para bots: si viene completo, fingimos éxito sin hacer nada.
  if (honeypot) {
    return { ok: true };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Ingresá un email válido." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const from = process.env.EMAIL_FROM;
  const siteUrl = process.env.SITE_URL ?? "https://hakori.co";

  if (!apiKey || !audienceId || !from) {
    console.error(
      "subscribeEmail: falta configurar RESEND_API_KEY, RESEND_AUDIENCE_ID o EMAIL_FROM.",
    );
    return { ok: false, error: GENERIC_ERROR };
  }

  const resend = new Resend(apiKey);

  const existing = await resend.contacts.get({ email, audienceId });
  const alreadySubscribed = !existing.error;

  if (!alreadySubscribed) {
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      console.error("subscribeEmail: error al guardar el contacto:", error);
      return { ok: false, error: GENERIC_ERROR };
    }

    const { error: sendError } = await resend.emails.send({
      from,
      to: email,
      subject: "Estás en la lista de espera · Hakori Drop 001",
      react: WelcomeEmail({
        siteUrl,
        unsubscribeUrl: `${siteUrl}/cancelar-suscripcion?email=${encodeURIComponent(email)}`,
      }),
    });

    if (sendError) {
      // El contacto ya quedó guardado en la Audience; perder el mail de
      // bienvenida es menos grave que perder el lead, así que no fallamos acá.
      console.error(
        "subscribeEmail: error al enviar el email de bienvenida:",
        sendError,
      );
    }
  }

  return { ok: true };
}
