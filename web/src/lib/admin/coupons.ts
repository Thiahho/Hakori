import { adminJson } from "./api";

export type CouponDiscountType = "Percentage" | "FixedAmount";
export type CouponStatus = "Active" | "Inactive" | "Expired" | "Exhausted";

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  /** null = unlimited uses. */
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  onePerEmail: boolean;
  isActive: boolean;
  status: CouponStatus;
  createdAt: string;
};

export function getAdminCoupons(): Promise<AdminCoupon[]> {
  return adminJson<AdminCoupon[]>("/api/admin/coupons");
}

export function getAdminCoupon(id: string): Promise<AdminCoupon> {
  return adminJson<AdminCoupon>(`/api/admin/coupons/${id}`);
}
