"use client";

import { useState } from "react";
import { unsubscribeEmail } from "@/lib/newsletter";

type Status = "idle" | "submitting" | "success" | "error";

export function UnsubscribeForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const result = await unsubscribeEmail(email);
    if (result.ok) {
      setStatus("success");
      setError("");
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm leading-relaxed text-ink/70">
        Listo, <span className="text-ink">{email}</span> ya no va a recibir
        más emails de Hakori.co. Si te arrepentís, podés volver a sumarte
        desde cualquier formulario del sitio.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex items-end gap-4 border-b border-ink/30 pb-2">
        <label htmlFor="unsubscribe-email" className="sr-only">
          Email
        </label>
        <input
          id="unsubscribe-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="TU EMAIL"
          className="flex-1 bg-transparent text-sm uppercase tracking-widest text-ink outline-none placeholder:text-ink/50"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 text-xs font-medium uppercase tracking-widest text-ink transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          Cancelar suscripción →
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-accent">{error}</p>
      )}
    </form>
  );
}
