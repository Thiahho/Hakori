"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/lib/products";

type Unit = "cm" | "in";

const CM_TO_IN = 0.393701;

function formatMeasurement(cm: number | null, unit: Unit): string {
  if (cm === null) return "—";
  const value = unit === "cm" ? cm : cm * CM_TO_IN;
  return value.toFixed(1);
}

function subscribeNoop() {
  return () => {};
}
function isClient() {
  return true;
}
function isServer() {
  return false;
}

export function SizeGuideModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  // document.body only exists once mounted in the browser — this keeps the
  // portal from rendering during SSR without a setState-in-effect pattern.
  const mounted = useSyncExternalStore(subscribeNoop, isClient, isServer);
  const [entered, setEntered] = useState(false);
  const [unit, setUnit] = useState<Unit>("cm");

  useEffect(() => {
    if (!open) return;

    // Reset before the enter transition on every open (the component stays
    // mounted between opens, so `entered` would otherwise still be true
    // from the previous time and skip the fade/slide-in).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const hasMeasurements = product.variants.some(
    (v) => v.chestCm !== null || v.lengthCm !== null || v.sleeveCm !== null,
  );

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-200 sm:items-center ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Guía de talles de ${product.name}`}
    >
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />

      <div
        className={`relative max-h-[85vh] w-full max-w-lg overflow-y-auto bg-cream p-6 transition-all duration-200 sm:rounded-sm ${
          entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 text-2xl leading-none text-ink/50 hover:text-ink"
        >
          ×
        </button>

        <h2 className="font-display text-2xl">{product.name}</h2>
        <div className="mt-2 flex items-center gap-3 text-xs uppercase tracking-widest text-ink/50">
          <button
            type="button"
            onClick={() => setUnit("cm")}
            aria-pressed={unit === "cm"}
            className={unit === "cm" ? "text-ink" : "hover:text-ink"}
          >
            CM
          </button>
          <span aria-hidden>|</span>
          <button
            type="button"
            onClick={() => setUnit("in")}
            aria-pressed={unit === "in"}
            className={unit === "in" ? "text-ink" : "hover:text-ink"}
          >
            INCHES
          </button>
        </div>

        {hasMeasurements ? (
          <>
            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-xs uppercase tracking-widest text-ink/50">
                  <th className="py-2 text-left font-medium">Talle</th>
                  <th className="py-2 text-left font-medium">Pecho (A)</th>
                  <th className="py-2 text-left font-medium">Largo (B)</th>
                  <th className="py-2 text-left font-medium">Manga (C)</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant.id} className="border-b border-ink/10">
                    <td className="py-3 font-medium">{variant.size}</td>
                    <td className="py-3 text-ink/70">{formatMeasurement(variant.chestCm, unit)}</td>
                    <td className="py-3 text-ink/70">{formatMeasurement(variant.lengthCm, unit)}</td>
                    <td className="py-3 text-ink/70">{formatMeasurement(variant.sleeveCm, unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 space-y-2 text-xs leading-relaxed text-ink/70">
              <p>
                <strong className="text-ink">Pecho (A):</strong> medido de axila a axila, con la prenda
                apoyada en una superficie plana.
              </p>
              <p>
                <strong className="text-ink">Largo (B):</strong> medido desde el punto más alto del
                cuello hasta el final de la prenda.
              </p>
              <p>
                <strong className="text-ink">Manga (C):</strong> medida desde el hombro hasta el final
                de la manga.
              </p>
            </div>

            <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-ink/40">
              Las medidas pueden variar 1–2 cm · 1 inch = 2.54cm
            </p>
          </>
        ) : (
          <p className="mt-8 text-sm text-ink/60">Todavía no cargamos las medidas de este producto.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}
