"use client";

import { deleteProductAction } from "@/lib/admin/products-actions";
import { TrashIcon } from "./ui/icons";
import { Button } from "./ui/button";

export function DeleteProductForm({
  id,
  name,
  variant = "icon",
}: {
  id: string;
  name: string;
  variant?: "icon" | "button";
}) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {variant === "icon" ? (
        <button
          type="submit"
          aria-label={`Eliminar ${name}`}
          title="Eliminar"
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      ) : (
        <Button type="submit" variant="destructive" size="sm">
          <TrashIcon className="h-3.5 w-3.5" />
          Eliminar
        </Button>
      )}
    </form>
  );
}
