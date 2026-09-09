"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartBadge() {
  const { cart } = useCart();

  return (
    <Link href="/carrito" className="flex items-center gap-2 text-xs uppercase tracking-widest">
      <span className="hidden sm:inline">Carrito</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-[10px] text-ink">
        {cart.itemCount}
      </span>
    </Link>
  );
}
