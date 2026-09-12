"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminJson } from "./api";

export async function markOrderPaidAction(formData: FormData): Promise<void> {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  await adminJson(`/api/admin/orders/${encodeURIComponent(orderNumber)}/mark-paid`, { method: "POST" });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  redirect(`/admin/orders/${orderNumber}`);
}

export async function cancelOrderAction(formData: FormData): Promise<void> {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  await adminJson(`/api/admin/orders/${encodeURIComponent(orderNumber)}/cancel`, { method: "POST" });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  redirect(`/admin/orders/${orderNumber}`);
}
