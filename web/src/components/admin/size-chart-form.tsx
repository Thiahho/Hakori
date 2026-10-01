"use client";

import { useActionState, useState } from "react";
import {
  createSizeChartAction,
  updateSizeChartAction,
  type SizeChartFormState,
} from "@/lib/admin/size-charts-actions";
import type { AdminSizeChart } from "@/lib/admin/size-charts";
import { STANDARD_SIZES } from "@/lib/admin/product-constants";
import { Card, CardHeader } from "./ui/card";
import { Field, inputClass } from "./ui/field";
import { Alert } from "./ui/alert";
import { Button, LinkButton } from "./ui/button";

const initialState: SizeChartFormState = {};
const tableInputClass =
  "w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink disabled:bg-neutral-50 disabled:text-neutral-300";

const toInput = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value));

export function SizeChartForm({ chart, saved = false }: { chart?: AdminSizeChart; saved?: boolean }) {
  const action = chart ? updateSizeChartAction.bind(null, chart.id) : createSizeChartAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [included, setIncluded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      STANDARD_SIZES.map((size) => [size, chart ? chart.rows.some((r) => r.size.toUpperCase() === size) : true]),
    ),
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {saved && !state.error && <Alert tone="success">Guardado.</Alert>}

      <Card>
        <CardHeader
          title="Plantilla"
          description="Se copia al producto al aplicarla: editar o borrar la plantilla no cambia los productos existentes."
        />
        <div className="p-5">
          <Field label="Nombre" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              defaultValue={chart?.name}
              placeholder="Remera oversize"
              className={`${inputClass} max-w-md`}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Talles, medidas y curva"
          description="Curva = unidades de cada talle por curva (ej. 1-2-3-3-2-1). Al cargar un producto, “3 curvas” multiplica estos valores."
        />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-2 font-medium"></th>
                <th className="py-2 pr-2 font-medium">Talle</th>
                <th className="py-2 pr-2 font-medium">Curva</th>
                <th className="py-2 pr-2 font-medium">Pecho (cm)</th>
                <th className="py-2 pr-2 font-medium">Largo (cm)</th>
                <th className="py-2 font-medium">Manga (cm)</th>
              </tr>
            </thead>
            <tbody>
              {STANDARD_SIZES.map((size) => {
                const row = chart?.rows.find((r) => r.size.toUpperCase() === size);
                const on = included[size];
                return (
                  <tr key={size} className={`border-b border-neutral-50 last:border-0 ${on ? "" : "text-neutral-400"}`}>
                    <td className="py-2.5 pr-2">
                      <input
                        type="checkbox"
                        name={`included_${size}`}
                        checked={on}
                        onChange={(e) => setIncluded((current) => ({ ...current, [size]: e.target.checked }))}
                        aria-label={`Incluir talle ${size}`}
                        className="h-4 w-4 accent-ink"
                      />
                    </td>
                    <td className="py-2.5 pr-2 font-medium">{size}</td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="number"
                        name={`curve_${size}`}
                        min="0"
                        step="1"
                        placeholder="—"
                        defaultValue={row?.curveUnits || ""}
                        disabled={!on}
                        className={`${tableInputClass} w-16`}
                      />
                    </td>
                    {(
                      [
                        ["chest", row?.chestCm],
                        ["length", row?.lengthCm],
                        ["sleeve", row?.sleeveCm],
                      ] as const
                    ).map(([field, value]) => (
                      <td key={field} className="py-2.5 pr-2">
                        <input
                          type="number"
                          name={`${field}_${size}`}
                          min="0"
                          step="0.1"
                          placeholder="—"
                          defaultValue={toInput(value)}
                          disabled={!on}
                          className={tableInputClass}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <LinkButton href="/admin/size-charts">Cancelar</LinkButton>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Guardando..." : chart ? "Guardar cambios" : "Crear plantilla"}
        </Button>
      </div>
    </form>
  );
}
