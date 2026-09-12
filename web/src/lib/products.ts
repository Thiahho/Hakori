import { apiJson, ApiError } from "./api";

export type ProductVariant = {
  id: string;
  size: string;
  sku: string;
  availableStock: number;
  chestCm: number | null;
  lengthCm: number | null;
  sleeveCm: number | null;
};

export type Product = {
  id: string;
  index: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  storyImage: string;
  storyQuote: string;
  storyText: string;
  variants: ProductVariant[];
};

export async function getProducts(): Promise<Product[]> {
  return apiJson<Product[]>("/api/products", { cache: "no-store" });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await apiJson<Product>(`/api/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}
