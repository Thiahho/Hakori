"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_COOKIE = "hakori_cookie_consent";
const CONSENT_MAX_AGE_DAYS = 180;

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // document.cookie only exists client-side, so the banner starts hidden
    // (matching SSR output) and reveals itself after mount if needed.
    if (!getCookie(CONSENT_COOKIE)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  function handleChoice(choice: "accepted" | "rejected") {
    setCookie(CONSENT_COOKIE, choice, CONSENT_MAX_AGE_DAYS);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-cream/10 bg-ink px-6 py-5 text-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="max-w-xl text-xs leading-relaxed text-cream/70">
          Usamos cookies propias y de terceros para mejorar tu experiencia y
          analizar el uso del sitio. Podés aceptar o rechazar su uso. Más
          info en nuestra{" "}
          <Link
            href="/politicas/cookies"
            className="underline underline-offset-2 hover:text-cream"
          >
            Política de Cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3 text-xs uppercase tracking-widest">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="border border-cream/30 px-4 py-2 hover:border-cream/60"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="bg-cream px-4 py-2 text-ink hover:opacity-80"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
