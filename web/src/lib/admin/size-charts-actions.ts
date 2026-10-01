"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminApiError, adminJson } from "./api";
import type { AdminSizeChart, SizeChartRow } from "./size-charts";
import { STANDARD_SIZES } from "./product-constants";
import { parseOptionalDecimal } from "./form-utils";

export type SizeChartFormState = { error?: string };

function parseSizeChartForm(formData: FormData) {
  const rows: SizeChartRow[] = STANDARD_SIZES.filter((size) => formData.get(`included_${size}`) === "on").map(
    (size) => ({
      size,
      chestCm: parseOptionalDecimal(formData.get(`chest_${size}`)),
      lengthCm: parseOptionalDecimal(formData.get(`length_${size}`)),
      sleeveCm: parseOptionalDecimal(formData.get(`sleeve_${size}`)),
      curveUnits: Math.max(0, Math.trunc(Number(formData.get(`curve_${size}`) ?? 0)) || 0),
    }),
  );

  return { name: String(formData.get("name") ?? "").trim(), rows };
}

export async function createSizeChartAction(
  _prevState: SizeChartFormState,
  formData: FormData,
): Promise<SizeChartFormState> {
  try {
    await adminJson<AdminSizeChart>("/api/admin/size-charts", {
      method: "POST",
      body: JSON.stringify(parseSizeChartForm(formData)),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/size-charts");
  redirect("/admin/size-charts?created=1");
}

export async function updateSizeChartAction(
  id: string,
  _prevState: SizeChartFormState,
  formData: FormData,
): Promise<SizeChartFormState> {
  try {
    await adminJson<AdminSizeChart>(`/api/admin/size-charts/${id}`, {
      method: "PUT",
      body: JSON.stringify(parseSizeChartForm(formData)),
    });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/admin/size-charts");
  revalidatePath(`/admin/size-charts/${id}`);
  redirect(`/admin/size-charts/${id}?saved=1`);
}

export async function deleteSizeChartAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  try {
    await adminJson(`/api/admin/size-charts/${id}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof AdminApiError) {
      redirect(`/admin/size-charts?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/size-charts");
  redirect("/admin/size-charts?deleted=1");
}

/** Called from the product form's "Guardar como plantilla" — returns the chart instead of redirecting. */
export async function saveSizeChartFromProductAction(
  name: string,
  rows: SizeChartRow[],
): Promise<{ chart?: AdminSizeChart; error?: string }> {
  try {
    const chart = await adminJson<AdminSizeChart>("/api/admin/size-charts", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), rows }),
    });
    revalidatePath("/admin/size-charts");
    return { chart };
  } catch (error) {
    if (error instanceof AdminApiError) {
      return { error: error.message };
    }
    throw error;
  }
}
