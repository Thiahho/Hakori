"use client";

import { useState } from "react";
import { subscribeEmail } from "@/lib/subscribe";

type Status = "idle" | "submitting" | "success" | "error";

export function EmailCaptureForm({
  variant = "dark",
  label = "TU EMAIL",
  submitLabel = "SUMARME",
}: {
  variant?: "dark" | "light";
  label?: string;
  submitLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const isDark = variant === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const result = await subscribeEmail(email, honeypot);
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
      <p
        className={`text-sm tracking-wide ${isDark ? "text-cream" : "text-ink"}`}
      >
        Listo. Te avisamos apenas abra el drop.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        name="company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div
        className={`flex items-end gap-4 border-b pb-2 ${
          isDark ? "border-cream/40" : "border-ink/30"
        }`}
      >
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={label}
          className={`flex-1 bg-transparent text-sm uppercase tracking-widest outline-none placeholder:text-current ${
            isDark
              ? "text-cream placeholder:text-cream/60"
              : "text-ink placeholder:text-ink/50"
          }`}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          aria-label={submitLabel}
          className={`shrink-0 text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-60 disabled:opacity-40 ${
            isDark ? "text-cream" : "text-ink"
          }`}
        >
          {submitLabel} →
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-accent">{error}</p>
      )}
    </form>
  );
}
