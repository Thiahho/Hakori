import { apiJson } from "./api";

export type CartItem = {
  itemId: string;
  productVariantId: string;
  productName: string;
  slug: string;
  size: string;
  image: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
};

export type Cart = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  /** Subtotal minus discount — what the buyer will be charged. */
  total: number;
  couponCode: string | null;
  /** Set when the applied coupon no longer applies (discount is then 0). */
  couponError: string | null;
};

export function getCart(): Promise<Cart> {
  return apiJson<Cart>("/api/cart", { cache: "no-store" });
}

export function addCartItem(productVariantId: string, quantity: number): Promise<Cart> {
  return apiJson<Cart>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productVariantId, quantity }),
  });
}

export function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  return apiJson<Cart>(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string): Promise<Cart> {
  return apiJson<Cart>(`/api/cart/items/${itemId}`, { method: "DELETE" });
}

export function applyCoupon(code: string): Promise<Cart> {
  return apiJson<Cart>("/api/cart/coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function removeCoupon(): Promise<Cart> {
  return apiJson<Cart>("/api/cart/coupon", { method: "DELETE" });
}

export type CheckoutRequest = {
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
};

export type CheckoutResponse = {
  orderNumber: string;
  initPoint: string;
};

export function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return apiJson<CheckoutResponse>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export type OrderItem = {
  productName: string;
  size: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  orderNumber: string;
  status: string;
  email: string;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  total: number;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
};

export function getOrder(orderNumber: string): Promise<Order> {
  return apiJson<Order>(`/api/orders/${encodeURIComponent(orderNumber)}`, {
    cache: "no-store",
  });
}

/** Has the backend verify the payment with MercadoPago and returns the updated order. */
export function confirmOrder(orderNumber: string, paymentId: string): Promise<Order> {
  return apiJson<Order>(
    `/api/orders/${encodeURIComponent(orderNumber)}/confirm?paymentId=${encodeURIComponent(paymentId)}`,
    { method: "POST", cache: "no-store" },
  );
}
