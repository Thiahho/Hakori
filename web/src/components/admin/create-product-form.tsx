"use client";

import { useActionState } from "react";
import { createProductAction, type ProductFormState } from "@/lib/admin/products-actions";
import { STANDARD_SIZES } from "@/lib/admin/product-constants";
import { Card, CardHeader } from "./ui/card";
import { Field, inputClass } from "./ui/field";
import { Alert } from "./ui/alert";
import { Button, LinkButton } from "./ui/button";

const initialState: ProductFormState = {};
const tableInputClass =
  "w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink";

export function CreateProductForm() {
  const [state, formAction, pending] = useActionState(createProductAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Card>
        <CardHeader title="Información general" description="Nombre, precio y visibilidad del producto." />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Índice" htmlFor="index">
            <input id="index" name="index" placeholder="05" className={inputClass} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Se usa en la URL del producto.">
            <input id="slug" name="slug" required placeholder="kitsune-oversize" className={inputClass} />
          </Field>
          <Field label="Nombre" htmlFor="name">
            <input id="name" name="name" required className={inputClass} />
          </Field>
          <Field label="Precio (ARS)" htmlFor="price">
            <input id="price" name="price" type="number" min="0" step="1" required className={inputClass} />
          </Field>
          <Field label="Orden" htmlFor="sortOrder" hint="Posición en el listado del sitio.">
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={0} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-neutral-700">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-ink" />
            Producto activo (visible en el sitio)
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Contenido de historia" description="Texto y assets que se muestran en el detalle." />
        <div className="flex flex-col gap-4 p-5">
          <Field label="Descripción corta" htmlFor="description">
            <input id="description" name="description" className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Imagen (producto)" htmlFor="image">
              <input id="image" name="image" placeholder="/images/..." className={inputClass} />
            </Field>
            <Field label="Imagen (historia)" htmlFor="storyImage">
              <input id="storyImage" name="storyImage" placeholder="/images/..." className={inputClass} />
            </Field>
          </div>
          <Field label="Frase (historia)" htmlFor="storyQuote">
            <input id="storyQuote" name="storyQuote" className={inputClass} />
          </Field>
          <Field label="Texto (historia)" htmlFor="storyText">
            <textarea id="storyText" name="storyText" rows={4} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Talles y stock" description="Definí el prefijo de SKU y qué talles vas a vender." />
        <div className="p-5">
          <Field label="Prefijo de SKU" htmlFor="skuPrefix">
            <input id="skuPrefix" name="skuPrefix" required placeholder="KITSUNE" className={`${inputClass} max-w-xs`} />
          </Field>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="py-2 pr-2 font-medium"></th>
                  <th className="py-2 pr-2 font-medium">Talle</th>
                  <th className="py-2 pr-2 font-medium">Stock</th>
                  <th className="py-2 pr-2 font-medium">Pecho (cm)</th>
                  <th className="py-2 pr-2 font-medium">Largo (cm)</th>
                  <th className="py-2 font-medium">Manga (cm)</th>
                </tr>
              </thead>
              <tbody>
                {STANDARD_SIZES.map((size) => (
                  <tr key={size} className="border-b border-neutral-50 last:border-0">
                    <td className="py-2.5 pr-2">
                      <input type="checkbox" name={`included_${size}`} defaultChecked className="h-4 w-4 accent-ink" />
                    </td>
                    <td className="py-2.5 pr-2 font-medium text-neutral-700">{size}</td>
                    <td className="py-2.5 pr-2">
                      <input type="number" name={`stock_${size}`} min="0" defaultValue={20} className={tableInputClass} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input type="number" name={`chest_${size}`} min="0" step="0.1" placeholder="—" className={tableInputClass} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input type="number" name={`length_${size}`} min="0" step="0.1" placeholder="—" className={tableInputClass} />
                    </td>
                    <td className="py-2.5">
                      <input type="number" name={`sleeve_${size}`} min="0" step="0.1" placeholder="—" className={tableInputClass} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Creando…" : "Crear producto"}
        </Button>
        <LinkButton href="/admin/products" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
