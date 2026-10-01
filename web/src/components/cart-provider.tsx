"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  addCartItem,
  applyCoupon as applyCouponRequest,
  getCart,
  removeCartItem,
  removeCoupon as removeCouponRequest,
  updateCartItem,
  type Cart,
} from "@/lib/cart";

type CartContextValue = {
  cart: Cart;
  loading: boolean;
  addItem: (productVariantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  refresh: () => Promise<void>;
};

const EMPTY_CART: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
  couponCode: null,
  couponError: null,
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getCart();
    setCart(next);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addItem = useCallback(async (productVariantId: string, quantity = 1) => {
    const next = await addCartItem(productVariantId, quantity);
    setCart(next);
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const next = await updateCartItem(itemId, quantity);
    setCart(next);
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const next = await removeCartItem(itemId);
    setCart(next);
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const next = await applyCouponRequest(code);
    setCart(next);
  }, []);

  const removeCoupon = useCallback(async () => {
    const next = await removeCouponRequest();
    setCart(next);
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, applyCoupon, removeCoupon, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
