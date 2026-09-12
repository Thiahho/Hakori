import { adminJson } from "./api";

export type AdminVariant = {
  id: string;
  size: string;
  sku: string;
  stock: number;
  reserved: number;
  chestCm: number | null;
  lengthCm: number | null;
  sleeveCm: number | null;
};

export type AdminProduct = {
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
  isActive: boolean;
  sortOrder: number;
  variants: AdminVariant[];
};

export function getAdminProducts(): Promise<AdminProduct[]> {
  return adminJson<AdminProduct[]>("/api/admin/products");
}

export function getAdminProduct(id: string): Promise<AdminProduct> {
  return adminJson<AdminProduct>(`/api/admin/products/${id}`);
}

export function totalStock(product: AdminProduct): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}
