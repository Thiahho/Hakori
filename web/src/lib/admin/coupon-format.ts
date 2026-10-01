import { formatPrice } from "@/lib/products";
import type { AdminCoupon, CouponStatus } from "./coupons";

/** Expiry dates are picked as a calendar day and always interpreted in Argentina time. */
const COUPON_TIME_ZONE = "America/Argentina/Buenos_Aires";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Same alphabet/length as the backend's CouponService.GenerateCode (no 0/O/1/I). */
export function generateCouponCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
}

export function formatCouponDiscount(coupon: Pick<AdminCoupon, "discountType" | "value">): string {
  return coupon.discountType === "Percentage" ? `${coupon.value}%` : formatPrice(coupon.value);
}

export function formatCouponUses(coupon: Pick<AdminCoupon, "usedCount" | "maxUses">): string {
  return `${coupon.usedCount} / ${coupon.maxUses ?? "∞"}`;
}

export function formatCouponExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Sin vencimiento";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: COUPON_TIME_ZONE }).format(
    new Date(expiresAt),
  );
}

/** ISO timestamp → "YYYY-MM-DD" (Argentina time) for an <input type="date">. */
export function toDateInputValue(expiresAt: string | null): string {
  if (!expiresAt) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: COUPON_TIME_ZONE }).format(new Date(expiresAt));
}

export const COUPON_STATUS: Record<
  CouponStatus,
  { label: string; tone: "success" | "neutral" | "warning" | "danger" }
> = {
  Active: { label: "Activo", tone: "success" },
  Inactive: { label: "Inactivo", tone: "neutral" },
  Expired: { label: "Vencido", tone: "warning" },
  Exhausted: { label: "Agotado", tone: "danger" },
};
