"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/products";
import { checkout, type CheckoutRequest } from "@/lib/cart";

const EMPTY_SHIPPING: CheckoutRequest = {
  email: "",
  shippingName: "",
  shippingAddress: "",
  shippingCity: "",
  shippingPostalCode: "",
  shippingPhone: "",
};

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [shipping, setShipping] = useState<CheckoutRequest>(EMPTY_SHIPPING);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await checkout(shipping);
      window.location.href = result.initPoint;
    } catch {
      setError(
        "No pudimos iniciar el pago. Revisá tus datos y probá de nuevo en unos minutos.",
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        <h1 className="font-display text-4xl">Tu carrito</h1>

        {loading ? (
          <p className="mt-8 text-sm text-ink/60">Cargando...</p>
        ) : cart.items.length === 0 ? (
          <div className="mt-8">
            <p className="text-sm text-ink/70">Todavía no agregaste nada.</p>
            <Link
              href="/#coleccion"
              className="mt-4 inline-block text-xs uppercase tracking-widest underline underline-offset-4"
            >
              Ver la colección →
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              {cart.items.map((item) => (
                <div key={item.itemId} className="flex gap-4 border-b border-ink/10 pb-6">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-ink">
                    <Image src={item.image} alt={item.productName} fill className="object-contain p-2" sizes="80px" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm uppercase tracking-widest">{item.productName}</p>
                      <span className="text-sm">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                    <p className="text-xs text-ink/50">Talle {item.size}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <select
                        value={item.quantity}
                        onChange={(e) => updateItem(item.itemId, Number(e.target.value))}
                        className="border border-ink/20 bg-transparent px-2 py-1 text-xs"
                      >
                        {Array.from({ length: Math.max(item.quantity, item.availableStock) }, (_, i) => i + 1)
                          .filter((qty) => qty <= item.availableStock || qty === item.quantity)
                          .map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem(item.itemId)}
                        className="text-xs uppercase tracking-widest text-ink/50 underline underline-offset-4 hover:text-ink"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-sm uppercase tracking-widest">Total</span>
                <span className="text-xl">{formatPrice(cart.total)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="flex flex-col gap-4">
              <h2 className="text-sm uppercase tracking-widest text-ink/60">Datos de envío</h2>
              <input
                required
                type="email"
                placeholder="Email"
                value={shipping.email}
                onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                className="border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none"
              />
              <input
                required
                type="text"
                placeholder="Nombre y apellido"
                value={shipping.shippingName}
                onChange={(e) => setShipping((s) => ({ ...s, shippingName: e.target.value }))}
                className="border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none"
              />
              <input
                required
                type="text"
                placeholder="Dirección"
                value={shipping.shippingAddress}
                onChange={(e) => setShipping((s) => ({ ...s, shippingAddress: e.target.value }))}
                className="border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none"
              />
              <div className="flex gap-3">
                <input
                  required
                  type="text"
                  placeholder="Ciudad"
                  value={shipping.shippingCity}
                  onChange={(e) => setShipping((s) => ({ ...s, shippingCity: e.target.value }))}
                  className="flex-1 border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none"
                />
                <input
                  required
                  type="text"
                  placeholder="Código postal"
                  value={shipping.shippingPostalCode}
                  onChange={(e) => setShipping((s) => ({ ...s, shippingPostalCode: e.target.value }))}
                  className="w-32 border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>
              <input
                required
                type="tel"
                placeholder="Teléfono"
                value={shipping.shippingPhone}
                onChange={(e) => setShipping((s) => ({ ...s, shippingPhone: e.target.value }))}
                className="border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none"
              />

              {error && <p className="text-xs text-accent">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full bg-ink py-4 text-xs uppercase tracking-[0.3em] text-cream transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "Redirigiendo a Mercado Pago..." : "Ir a pagar"}
              </button>
            </form>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
