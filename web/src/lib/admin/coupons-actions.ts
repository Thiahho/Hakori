"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminApiError, adminJson } from "./api";
import type { AdminCoupon } from "./coupons";

export type CouponFormState = { error?: string };

function parseCouponForm(formData: FormData) {
  const unlimited = formData.get("unlimited") === "on";
  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const expiresOn = String(formData.get("expiresOn") ?? "").trim();

  return {
    code: String(formData.get("code") ?? "").trim(),
    discountType: String(formData.get("discountType") ?? "Percentage"),
    value: Number(formData.get("value") ?? 0),
    maxUses: unlimited || maxUsesRaw === "" ? null : Number(maxUsesRaw),
    // The coupon is valid through the whole chosen day, Argentina time (UTC-3, no DST).
    expiresAt: expiresOn ? `${expiresOn}T23:59:59-03:00` : null,
    onePerEmail: formData.get("onePerEmail") === "on",
    isActive: formData.get("isActive") === "on",
  };
}

export async function createCouponAction(
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  try {
    await adminJson<AdminCoupon>("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify(parseCouponForm(formData)),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?created=1");
}

export async function updateCouponAction(
  id: string,
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  try {
    await adminJson<AdminCoupon>(`/api/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(parseCouponForm(formData)),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
  redirect(`/admin/coupons/${id}?saved=1`);
}

export async function toggleCouponAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";

  try {
    await adminJson(`/api/admin/coupons/${id}/active`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      redirect(`/admin/coupons?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  try {
    await adminJson(`/api/admin/coupons/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof AdminApiError) {
      redirect(`/admin/coupons?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?deleted=1");
}
