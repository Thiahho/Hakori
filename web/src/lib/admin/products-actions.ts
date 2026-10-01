"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminApiError, adminJson } from "./api";
import type { AdminProduct } from "./products";
import { parseVariantRows } from "./form-utils";

export type ProductFormState = { error?: string };

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const variants = parseVariantRows(formData).map((row) => ({
    size: row.size,
    stock: row.stock,
    chestCm: row.chestCm,
    lengthCm: row.lengthCm,
    sleeveCm: row.sleeveCm,
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
  // The full set of sizes the product should have: rows with an id update that
  // variant, rows without one are new sizes, and missing sizes get removed.
  const variants = parseVariantRows(formData);

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
