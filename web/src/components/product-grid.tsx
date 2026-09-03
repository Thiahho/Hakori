"use client";

import Image from "next/image";
import { useState } from "react";
import { products, formatPrice } from "@/lib/products";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductGrid() {
  const [startIndex, setStartIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );
  const visible = 3;
  const maxStart = Math.max(0, products.length - visible);

  const shown = products.slice(startIndex, startIndex + visible);

  return (
    <section id="coleccion" className="bg-cream px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-ink/60">
          Drop 001 — Japón
        </p>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="font-sans text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Cuatro
            <br />
            símbolos.
            <br />
            Una misma
            <br />
            historia.
          </h2>
          <p className="max-w-xs text-sm text-ink/70">
            Cada pieza representa una forma distinta de avanzar. Diseños
            bordados para llevar algo más que una prenda.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((product) => {
            const selectedSize = selectedSizes[product.id];
            return (
              <article key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <span className="absolute left-4 top-4 text-xs uppercase tracking-widest text-cream/80">
                    {product.index}
                  </span>

                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-md border border-cream/25 bg-cream/10 px-3 py-2.5 text-[11px] uppercase tracking-widest text-cream backdrop-blur-md">
                    <button
                      type="button"
                      disabled={!selectedSize}
                      className="font-semibold disabled:text-cream/40"
                    >
                      + Agregar
                    </button>
                    <div className="flex gap-2">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setSelectedSizes((prev) => ({
                              ...prev,
                              [product.id]: size,
                            }))
                          }
                          aria-pressed={selectedSize === size}
                          className={
                            selectedSize === size
                              ? "font-semibold text-cream underline underline-offset-4"
                              : "text-cream/50 hover:text-cream"
                          }
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="text-sm uppercase tracking-widest">
                    {product.name}
                  </h3>
                  <span className="text-sm">{formatPrice(product.price)}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink/50">
                  {product.description}
                </p>
              </article>
            );
          })}
        </div>

        {products.length > visible && (
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
              disabled={startIndex === 0}
              aria-label="Anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setStartIndex((i) => Math.min(maxStart, i + 1))}
              disabled={startIndex === maxStart}
              aria-label="Siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
