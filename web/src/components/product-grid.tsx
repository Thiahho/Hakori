"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from "react";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/components/cart-provider";

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startScroll: number;
    dragging: boolean;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const updateScrollState = () => {
      setCanScrollPrev(el.scrollLeft > 4);
      setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({
      left: direction * trackRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = {
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragging: true,
      moved: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag?.dragging || !el) return;
    const delta = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 3) {
      drag.moved = true;
      // Only capture once it's a real drag, so a plain click still reaches
      // the link underneath the cursor (pointer capture retargets clicks).
      el.setPointerCapture(e.pointerId);
    }
    if (drag.moved) el.scrollLeft = drag.startScroll - delta;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (dragRef.current?.dragging && el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    if (dragRef.current) dragRef.current.dragging = false;
  };

  const suppressClickAfterDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (dragRef.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (dragRef.current) dragRef.current.moved = false;
  };

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

        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={suppressClickAfterDrag}
          className="mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-2 cursor-grab select-none active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => {
            const selectedSize = selectedSizes[product.id];
            const selectedVariant = product.variants.find((v) => v.size === selectedSize);

            const handleAdd = async () => {
              if (!selectedVariant) return;
              setAddingTo(product.id);
              try {
                await addItem(selectedVariant.id, 1);
              } finally {
                setAddingTo(null);
              }
            };

            return (
              <article
                key={product.id}
                className="group w-full shrink-0 snap-start sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                  <Link
                    href={`/producto/${product.slug}`}
                    aria-label={`Ver detalle de ${product.name}`}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="absolute inset-0 z-0"
                  />
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    draggable={false}
                    className="pointer-events-none object-contain p-6 blur-md transition-[filter,transform] duration-500 group-hover:scale-105 group-hover:blur-none"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <span className="absolute left-4 top-4 text-xs uppercase tracking-widest text-cream/80">
                    {product.index}
                  </span>

                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-md border border-cream/25 bg-cream/10 px-3 py-2.5 text-[11px] uppercase tracking-widest text-cream backdrop-blur-md">
                    <button
                      type="button"
                      disabled={!selectedVariant || addingTo === product.id}
                      onClick={handleAdd}
                      className="font-semibold disabled:text-cream/40"
                    >
                      {addingTo === product.id ? "..." : "+ Agregar"}
                    </button>
                    <div className="flex gap-2">
                      {product.variants.map((variant) => {
                        const outOfStock = variant.availableStock <= 0;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            disabled={outOfStock}
                            onClick={() =>
                              setSelectedSizes((prev) => ({
                                ...prev,
                                [product.id]: variant.size,
                              }))
                            }
                            aria-pressed={selectedSize === variant.size}
                            className={
                              outOfStock
                                ? "text-cream/25 line-through"
                                : selectedSize === variant.size
                                  ? "font-semibold text-cream underline underline-offset-4"
                                  : "text-cream/50 hover:text-cream"
                            }
                          >
                            {variant.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <Link
                    href={`/producto/${product.slug}`}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="text-sm uppercase tracking-widest hover:underline"
                  >
                    <h3>{product.name}</h3>
                  </Link>
                  <span className="text-sm">{formatPrice(product.price)}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink/50">
                  {product.description}
                </p>
              </article>
            );
          })}
        </div>

        {products.length > 1 && (
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollPrev}
              aria-label="Anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 transition-colors hover:bg-ink hover:text-cream disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollNext}
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
