"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminApiError, adminJson } from "./api";
import type { AdminProduct } from "./products";
import { STANDARD_SIZES } from "./product-constants";

export type ProductFormState = { error?: string };

function parseOptionalDecimal(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const trimmed = String(value).trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const variants = STANDARD_SIZES.filter((size) => formData.get(`included_${size}`) === "on").map((size) => ({
    size,
    stock: Math.max(0, Number(formData.get(`stock_${size}`) ?? 0)),
    chestCm: parseOptionalDecimal(formData.get(`chest_${size}`)),
    lengthCm: parseOptionalDecimal(formData.get(`length_${size}`)),
    sleeveCm: parseOptionalDecimal(formData.get(`sleeve_${size}`)),
  }));

  const body = {
    index: String(formData.get("index") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.get("isActive") === "on",
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    storyImage: String(formData.get("storyImage") ?? "").trim(),
    storyQuote: String(formData.get("storyQuote") ?? "").trim(),
    storyText: String(formData.get("storyText") ?? "").trim(),
    skuPrefix: String(formData.get("skuPrefix") ?? "").trim(),
    variants,
  };

  let created: AdminProduct;
  try {
    created = await adminJson<AdminProduct>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${created.id}`);
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const variants: { id: string; stock: number; chestCm: number | null; lengthCm: number | null; sleeveCm: number | null }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("stock_")) {
      const variantId = key.slice("stock_".length);
      variants.push({
        id: variantId,
        stock: Math.max(0, Number(value)),
        chestCm: parseOptionalDecimal(formData.get(`chest_${variantId}`)),
        lengthCm: parseOptionalDecimal(formData.get(`length_${variantId}`)),
        sleeveCm: parseOptionalDecimal(formData.get(`sleeve_${variantId}`)),
      });
    }
  }

  const body = {
    index: String(formData.get("index") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.get("isActive") === "on",
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    storyImage: String(formData.get("storyImage") ?? "").trim(),
    storyQuote: String(formData.get("storyQuote") ?? "").trim(),
    storyText: String(formData.get("storyText") ?? "").trim(),
    variants,
  };

  try {
    await adminJson<AdminProduct>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  try {
    await adminJson(`/api/admin/products/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof AdminApiError) {
      redirect(`/admin/products?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}
