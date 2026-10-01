import { STANDARD_SIZES } from "./product-constants";

export function parseOptionalDecimal(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const trimmed = String(value).trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Reads the per-size rows rendered by SizeCurveEditor (`included_{size}`,
 * `stock_{size}`, measurements and, when editing, `variantId_{size}`).
 * Only ticked sizes are returned.
 */
export function parseVariantRows(formData: FormData) {
  return STANDARD_SIZES.filter((size) => formData.get(`included_${size}`) === "on").map((size) => {
    const variantId = String(formData.get(`variantId_${size}`) ?? "").trim();
    return {
      id: variantId || null,
      size,
      stock: Math.max(0, Math.trunc(Number(formData.get(`stock_${size}`) ?? 0)) || 0),
      chestCm: parseOptionalDecimal(formData.get(`chest_${size}`)),
      lengthCm: parseOptionalDecimal(formData.get(`length_${size}`)),
      sleeveCm: parseOptionalDecimal(formData.get(`sleeve_${size}`)),
    };
  });
}
