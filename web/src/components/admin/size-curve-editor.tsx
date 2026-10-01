"use client";

import { useState } from "react";
import { STANDARD_SIZES } from "@/lib/admin/product-constants";
import type { AdminVariant } from "@/lib/admin/products";
import type { AdminSizeChart, SizeChartRow } from "@/lib/admin/size-charts";
import { saveSizeChartFromProductAction } from "@/lib/admin/size-charts-actions";
import { Card, CardHeader } from "./ui/card";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { useDialog } from "./ui/dialog-provider";

type Size = (typeof STANDARD_SIZES)[number];

type Row = {
  size: Size;
  included: boolean;
  variantId?: string;
  sku?: string;
  stock: string;
  chest: string;
  length: string;
  sleeve: string;
  /** Units per "curva" — only used client-side to fill stock, never submitted. */
  curve: string;
};

const DEFAULT_NEW_STOCK = "20";

const tableInputClass =
  "w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink disabled:bg-neutral-50 disabled:text-neutral-300";
const toolbarInputClass =
  "w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink";

const toInput = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value));
const toNumber = (value: string) => (value.trim() === "" ? null : Number(value));

function initialRows(variants?: AdminVariant[]): Row[] {
  return STANDARD_SIZES.map((size) => {
    const variant = variants?.find((v) => v.size.toUpperCase() === size);
    if (variant) {
      return {
        size,
        included: true,
        variantId: variant.id,
        sku: variant.sku,
        stock: String(variant.stock),
        chest: toInput(variant.chestCm),
        length: toInput(variant.lengthCm),
        sleeve: toInput(variant.sleeveCm),
        curve: "",
      };
    }
    return {
      size,
      // New product: every size starts ticked (as before). Editing: only the ones it has.
      included: !variants,
      stock: variants ? "0" : DEFAULT_NEW_STOCK,
      chest: "",
      length: "",
      sleeve: "",
      curve: "",
    };
  });
}

/**
 * Sizes, stock and measurements for a product. Renders the per-size inputs the
 * product server actions read (`included_{size}`, `stock_{size}`, `chest_{size}`…,
 * plus `variantId_{size}` when editing) and adds shortcuts on top: apply a size
 * template, distribute stock by a curve, same stock for all, copy measurements
 * from the row above, and save the current table as a new template.
 */
export function SizeCurveEditor({
  sizeCharts: initialCharts,
  variants,
  children,
}: {
  sizeCharts: AdminSizeChart[];
  /** Existing variants when editing; omitted when creating. */
  variants?: AdminVariant[];
  /** Extra fields rendered above the toolbar (e.g. the SKU prefix when creating). */
  children?: React.ReactNode;
}) {
  const dialog = useDialog();
  const editing = Boolean(variants);
  const [rows, setRows] = useState<Row[]>(() => initialRows(variants));
  const [charts, setCharts] = useState(initialCharts);
  const [chartId, setChartId] = useState("");
  const [curveCount, setCurveCount] = useState("1");
  const [stockMode, setStockMode] = useState<"replace" | "add">("replace");
  const [sameStock, setSameStock] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [savingChart, setSavingChart] = useState(false);

  function updateRow(size: Size, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.size === size ? { ...row, ...patch } : row)));
  }

  /** Un-ticking a size that already exists deletes it on save — confirm first. */
  async function confirmRemovals(next: Row[]): Promise<boolean> {
    const removing = rows.filter((row) => row.variantId && row.included && !next.find((n) => n.size === row.size)?.included);
    if (removing.length === 0) return true;
    const sizes = removing.map((r) => r.size).join(", ");
    return dialog.confirm({
      title: removing.length === 1 ? "Quitar talle" : "Quitar talles",
      message: `Al guardar se ${removing.length === 1 ? "va a eliminar el talle" : "van a eliminar los talles"} ${sizes} de este producto.`,
      confirmLabel: "Quitar",
      tone: "danger",
    });
  }

  async function toggleIncluded(size: Size, included: boolean) {
    const next = rows.map((row) => (row.size === size ? { ...row, included } : row));
    if (!included && !(await confirmRemovals(next))) return;
    setRows(next);
  }

  async function applyChart() {
    const chart = charts.find((c) => c.id === chartId);
    if (!chart) return;

    const next = rows.map((row) => {
      const templateRow = chart.rows.find((r) => r.size.toUpperCase() === row.size);
      if (!templateRow) {
        return { ...row, included: false, curve: "" };
      }
      return {
        ...row,
        included: true,
        chest: toInput(templateRow.chestCm),
        length: toInput(templateRow.lengthCm),
        sleeve: toInput(templateRow.sleeveCm),
        curve: templateRow.curveUnits > 0 ? String(templateRow.curveUnits) : "",
      };
    });
    if (!(await confirmRemovals(next))) return;

    setRows(next);
    setNotice({
      tone: "success",
      text: `Plantilla "${chart.name}" aplicada: talles y medidas. Usá "Repartir" para cargar el stock con su curva.`,
    });
  }

  function setStock(compute: (row: Row) => number | null) {
    setRows((current) =>
      current.map((row) => {
        if (!row.included) return row;
        const units = compute(row);
        if (units === null) return row;
        const base = stockMode === "add" ? Number(row.stock) || 0 : 0;
        return { ...row, stock: String(base + units) };
      }),
    );
  }

  function distributeCurve() {
    const count = Math.max(0, Math.trunc(Number(curveCount)) || 0);
    if (!rows.some((row) => row.included && Number(row.curve) > 0)) {
      setNotice({ tone: "error", text: "Cargá las unidades por curva de cada talle (o aplicá una plantilla que las tenga)." });
      return;
    }
    setStock((row) => (Number(row.curve) > 0 ? Math.trunc(Number(row.curve)) * count : 0));
    setNotice(null);
  }

  function applySameStock() {
    if (sameStock.trim() === "") return;
    const units = Math.max(0, Math.trunc(Number(sameStock)) || 0);
    setStock(() => units);
  }

  function copyMeasurementsFromAbove(index: number) {
    const above = rows.slice(0, index).reverse().find((row) => row.included);
    if (!above) return;
    updateRow(rows[index].size, { chest: above.chest, length: above.length, sleeve: above.sleeve });
  }

  async function saveAsChart() {
    const included = rows.filter((row) => row.included);
    if (included.length === 0) {
      setNotice({ tone: "error", text: "Tildá al menos un talle para guardar la plantilla." });
      return;
    }
    const name = await dialog.prompt({
      title: "Guardar como plantilla",
      message: "Guarda los talles tildados, sus medidas y la curva para reutilizarlos en otros productos.",
      label: "Nombre de la plantilla",
      placeholder: "Remera oversize",
      confirmLabel: "Guardar plantilla",
    });
    if (!name) return;

    const chartRows: SizeChartRow[] = included.map((row) => ({
      size: row.size,
      chestCm: toNumber(row.chest),
      lengthCm: toNumber(row.length),
      sleeveCm: toNumber(row.sleeve),
      curveUnits: Math.max(0, Math.trunc(Number(row.curve)) || 0),
    }));

    setSavingChart(true);
    const result = await saveSizeChartFromProductAction(name, chartRows);
    setSavingChart(false);

    if (result.chart) {
      const saved = result.chart;
      setCharts((current) => [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setChartId(saved.id);
      setNotice({ tone: "success", text: `Plantilla "${saved.name}" guardada.` });
    } else {
      setNotice({ tone: "error", text: result.error ?? "No se pudo guardar la plantilla." });
    }
  }

  const totalStock = rows.filter((row) => row.included).reduce((sum, row) => sum + (Number(row.stock) || 0), 0);

  return (
    <Card>
      <CardHeader
        title="Talles y stock"
        description="Elegí los talles, sus medidas (cm) y el stock. Las plantillas se copian: después podés retocar este producto."
      />
      <div className="flex flex-col gap-5 p-5">
        {children}

        <div className="grid grid-cols-1 gap-4 rounded-lg bg-neutral-50 p-4 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Plantilla de talles</span>
            <div className="flex gap-2">
              <select
                value={chartId}
                onChange={(e) => setChartId(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-ink"
              >
                <option value="">{charts.length === 0 ? "No hay plantillas" : "Elegir…"}</option>
                {charts.map((chart) => (
                  <option key={chart.id} value={chart.id}>
                    {chart.name}
                  </option>
                ))}
              </select>
              <Button type="button" size="sm" onClick={applyChart} disabled={!chartId}>
                Aplicar
              </Button>
            </div>
            <button
              type="button"
              onClick={saveAsChart}
              disabled={savingChart}
              className="self-start text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-800 disabled:opacity-40"
            >
              {savingChart ? "Guardando…" : "Guardar esta tabla como plantilla"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Curva de stock</span>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="number"
                min="0"
                value={curveCount}
                onChange={(e) => setCurveCount(e.target.value)}
                aria-label="Cantidad de curvas"
                className={toolbarInputClass}
              />
              <span>curvas</span>
              <Button type="button" size="sm" onClick={distributeCurve}>
                Repartir
              </Button>
            </div>
            <p className="text-xs text-neutral-400">Stock de cada talle = unidades por curva × cantidad.</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Mismo stock para todos</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={sameStock}
                onChange={(e) => setSameStock(e.target.value)}
                aria-label="Stock para todos los talles"
                className={toolbarInputClass}
              />
              <Button type="button" size="sm" onClick={applySameStock} disabled={sameStock.trim() === ""}>
                Aplicar
              </Button>
            </div>
            {editing && (
              <div className="flex gap-3 text-xs text-neutral-600">
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={stockMode === "replace"}
                    onChange={() => setStockMode("replace")}
                    className="accent-ink"
                  />
                  Reemplazar stock
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    checked={stockMode === "add"}
                    onChange={() => setStockMode("add")}
                    className="accent-ink"
                  />
                  Sumar al actual
                </label>
              </div>
            )}
          </div>
        </div>

        {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-2 font-medium"></th>
                <th className="py-2 pr-2 font-medium">Talle</th>
                {editing && <th className="py-2 pr-2 font-medium">SKU</th>}
                <th className="py-2 pr-2 font-medium" title="Unidades de este talle por curva">
                  Curva
                </th>
                <th className="py-2 pr-2 font-medium">Stock</th>
                <th className="py-2 pr-2 font-medium">Pecho (cm)</th>
                <th className="py-2 pr-2 font-medium">Largo (cm)</th>
                <th className="py-2 pr-2 font-medium">Manga (cm)</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.size}
                  className={`border-b border-neutral-50 last:border-0 ${row.included ? "" : "text-neutral-400"}`}
                >
                  <td className="py-2.5 pr-2">
                    <input
                      type="checkbox"
                      name={`included_${row.size}`}
                      checked={row.included}
                      onChange={(e) => toggleIncluded(row.size, e.target.checked)}
                      aria-label={`Incluir talle ${row.size}`}
                      className="h-4 w-4 accent-ink"
                    />
                    {row.variantId && <input type="hidden" name={`variantId_${row.size}`} value={row.variantId} />}
                  </td>
                  <td className="py-2.5 pr-2 font-medium">{row.size}</td>
                  {editing && (
                    <td className="py-2.5 pr-2 font-mono text-xs text-neutral-500">
                      {row.sku ?? (row.included ? <span className="text-emerald-700">nuevo</span> : "")}
                    </td>
                  )}
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="—"
                      value={row.curve}
                      disabled={!row.included}
                      onChange={(e) => updateRow(row.size, { curve: e.target.value })}
                      aria-label={`Unidades por curva ${row.size}`}
                      className={`${tableInputClass} w-16`}
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      name={`stock_${row.size}`}
                      min="0"
                      step="1"
                      value={row.stock}
                      disabled={!row.included}
                      onChange={(e) => updateRow(row.size, { stock: e.target.value })}
                      className={tableInputClass}
                    />
                  </td>
                  {(["chest", "length", "sleeve"] as const).map((field) => (
                    <td key={field} className="py-2.5 pr-2">
                      <input
                        type="number"
                        name={`${field}_${row.size}`}
                        min="0"
                        step="0.1"
                        placeholder="—"
                        value={row[field]}
                        disabled={!row.included}
                        onChange={(e) => updateRow(row.size, { [field]: e.target.value })}
                        className={tableInputClass}
                      />
                    </td>
                  ))}
                  <td className="py-2.5">
                    {index > 0 && row.included && (
                      <button
                        type="button"
                        onClick={() => copyMeasurementsFromAbove(index)}
                        title="Copiar las medidas del talle de arriba"
                        className="whitespace-nowrap rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      >
                        ↑ Copiar medidas
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={editing ? 4 : 3} className="pt-3 text-right text-xs uppercase tracking-wide text-neutral-500">
                  Total
                </td>
                <td className="pt-3 pl-2 text-sm font-semibold tabular-nums text-neutral-900">{totalStock}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Card>
  );
}
