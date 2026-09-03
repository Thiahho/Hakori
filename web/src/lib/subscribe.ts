export type SubscribeResult = { ok: true } | { ok: false; error: string };

export async function subscribeEmail(email: string): Promise<SubscribeResult> {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    return { ok: false, error: "Ingresá un email válido." };
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
}
