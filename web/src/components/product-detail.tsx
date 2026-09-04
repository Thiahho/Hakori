"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { formatPrice, type Product } from "@/lib/products";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ink/15">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-xs font-semibold uppercase tracking-widest text-ink"
      >
        {title}
        <span aria-hidden className="text-lg leading-none text-ink/60">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed text-ink/70">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState<"story" | "cutout">("story");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const mainImage = activeImage === "story" ? product.storyImage : product.image;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden bg-ink">
          <Image
            key={mainImage}
            src={mainImage}
            alt={product.name}
            fill
            priority
            className={
              activeImage === "story"
                ? "object-cover object-center"
                : "object-contain p-10"
            }
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setActiveImage("story")}
            aria-pressed={activeImage === "story"}
            aria-label="Ver foto ambientada"
            className={`relative h-20 w-16 overflow-hidden border transition-opacity ${
              activeImage === "story"
                ? "border-ink"
                : "border-ink/20 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={product.storyImage}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
          <button
            type="button"
            onClick={() => setActiveImage("cutout")}
            aria-pressed={activeImage === "cutout"}
            aria-label="Ver diseño en detalle"
            className={`relative h-20 w-16 overflow-hidden border bg-ink transition-opacity ${
              activeImage === "cutout"
                ? "border-ink"
                : "border-ink/20 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={product.image}
              alt=""
              fill
              className="object-contain p-2"
              sizes="64px"
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-ink/50">
            {product.index} · Drop 001
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-widest text-ink/50">
            {product.description}
          </p>
        </div>

        <p className="text-2xl">{formatPrice(product.price)}</p>

        <blockquote className="border-l-2 border-accent pl-4">
          <p className="font-display text-2xl italic leading-snug">
            &ldquo;{product.storyQuote}&rdquo;
          </p>
        </blockquote>
        <p className="max-w-md text-sm text-ink/70">{product.storyText}</p>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-ink/50">
            Talle
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={`flex h-10 w-14 items-center justify-center border text-xs uppercase tracking-widest transition-colors ${
                  selectedSize === size
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/30 text-ink/70 hover:border-ink"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!selectedSize}
            className="w-full bg-ink py-4 text-xs uppercase tracking-[0.3em] text-cream transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            + Agregar
          </button>

          <button
            type="button"
            disabled={!selectedSize}
            className="flex w-full items-center justify-center gap-2 border border-ink/30 py-4 text-xs uppercase tracking-[0.3em] text-ink/70 transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
          >
            PAGAR
          </button>
        </div>

        <div className="mt-2 border-t border-ink/15">
          <AccordionItem title="Detalles del producto">
            <ul className="list-disc space-y-1 pl-4">
              <li>{product.description}</li>
              <li>Bordado premium en el frente</li>
              <li>Pieza de la colección Drop 001 · Edición limitada</li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Guía de cuidado de ropa">
            <ul className="list-disc space-y-1 pl-4">
              <li>Lavar a mano o en ciclo delicado, con agua fría.</li>
              <li>No usar cloro ni blanqueadores.</li>
              <li>No usar secadora — secar a la sombra.</li>
              <li>
                Planchar del revés, a baja temperatura, evitando la zona
                bordada.
              </li>
            </ul>
          </AccordionItem>

          <AccordionItem title="Envíos y devoluciones">
            <div className="space-y-2">
              <p>
                Los envíos del Drop 001 se despachan una vez cerrada la
                preventa, a partir de la fecha de lanzamiento.
              </p>
              <p>
                Ante cualquier consulta sobre cambios o devoluciones,
                escribinos por Instagram{" "}
                <a
                  href="https://instagram.com/hakori.co"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-ink"
                >
                  @hakori.co
                </a>
                .
              </p>
            </div>
          </AccordionItem>
        </div>

        <Link
          href="/#coleccion"
          className="text-xs uppercase tracking-widest text-ink/50 underline underline-offset-4 hover:text-ink"
        >
          ← Volver a la colección
        </Link>
      </div>
    </div>
  );
}
