"use client";

import { useActionState } from "react";
import { updateProductAction, type ProductFormState } from "@/lib/admin/products-actions";
import type { AdminProduct } from "@/lib/admin/products";
import { Card, CardHeader } from "./ui/card";
import { Field, inputClass } from "./ui/field";
import { Alert } from "./ui/alert";
import { Button, LinkButton } from "./ui/button";

const initialState: ProductFormState = {};
const tableInputClass =
  "w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink";

export function EditProductForm({ product, saved }: { product: AdminProduct; saved: boolean }) {
  const action = updateProductAction.bind(null, product.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    // Not nested inside any other <form> — HTML doesn't allow that; the
    // "Eliminar" button lives in a sibling <form> rendered by the page.
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {saved && !state.error && <Alert tone="success">Guardado.</Alert>}

      <Card>
        <CardHeader title="Información general" description="Nombre, precio y visibilidad del producto." />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Índice" htmlFor="index">
            <input id="index" name="index" defaultValue={product.index} className={inputClass} />
          </Field>
          <Field label="Slug" htmlFor="slug" hint="Se usa en la URL del producto.">
            <input id="slug" name="slug" required defaultValue={product.slug} className={inputClass} />
          </Field>
          <Field label="Nombre" htmlFor="name">
            <input id="name" name="name" required defaultValue={product.name} className={inputClass} />
          </Field>
          <Field label="Precio (ARS)" htmlFor="price">
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={product.price}
              className={inputClass}
            />
          </Field>
          <Field label="Orden" htmlFor="sortOrder" hint="Posición en el listado del sitio.">
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={product.sortOrder} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-neutral-700">
            <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4 accent-ink" />
            Producto activo (visible en el sitio)
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Contenido de historia" description="Texto y assets que se muestran en el detalle." />
        <div className="flex flex-col gap-4 p-5">
          <Field label="Descripción corta" htmlFor="description">
            <input id="description" name="description" defaultValue={product.description} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Imagen (producto)" htmlFor="image">
              <input id="image" name="image" defaultValue={product.image} className={inputClass} />
            </Field>
            <Field label="Imagen (historia)" htmlFor="storyImage">
              <input id="storyImage" name="storyImage" defaultValue={product.storyImage} className={inputClass} />
            </Field>
          </div>
          <Field label="Frase (historia)" htmlFor="storyQuote">
            <input id="storyQuote" name="storyQuote" defaultValue={product.storyQuote} className={inputClass} />
          </Field>
          <Field label="Texto (historia)" htmlFor="storyText">
            <textarea id="storyText" name="storyText" rows={4} defaultValue={product.storyText} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Talles y stock" description="Stock y medidas por talle (cm)." />
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-2 font-medium">Talle</th>
                <th className="py-2 pr-2 font-medium">SKU</th>
                <th className="py-2 pr-2 font-medium">Stock</th>
                <th className="py-2 pr-2 font-medium">Pecho (cm)</th>
                <th className="py-2 pr-2 font-medium">Largo (cm)</th>
                <th className="py-2 font-medium">Manga (cm)</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr key={variant.id} className="border-b border-neutral-50 last:border-0">
                  <td className="py-2.5 pr-2 font-medium text-neutral-700">{variant.size}</td>
                  <td className="py-2.5 pr-2 font-mono text-xs text-neutral-500">{variant.sku}</td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      name={`stock_${variant.id}`}
                      min="0"
                      defaultValue={variant.stock}
                      className={tableInputClass}
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      name={`chest_${variant.id}`}
                      min="0"
                      step="0.1"
                      placeholder="—"
                      defaultValue={variant.chestCm ?? ""}
                      className={tableInputClass}
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input
                      type="number"
                      name={`length_${variant.id}`}
                      min="0"
                      step="0.1"
                      placeholder="—"
                      defaultValue={variant.lengthCm ?? ""}
                      className={tableInputClass}
                    />
                  </td>
                  <td className="py-2.5">
                    <input
                      type="number"
                      name={`sleeve_${variant.id}`}
                      min="0"
                      step="0.1"
                      placeholder="—"
                      defaultValue={variant.sleeveCm ?? ""}
                      className={tableInputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <LinkButton href="/admin/products" variant="secondary">
          Volver
        </LinkButton>
      </div>
    </form>
  );
}
