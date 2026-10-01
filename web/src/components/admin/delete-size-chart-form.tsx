"use client";

import { deleteSizeChartAction } from "@/lib/admin/size-charts-actions";
import { TrashIcon } from "./ui/icons";
import { Button } from "./ui/button";
import { ConfirmSubmitForm } from "./ui/confirm-submit-form";

export function DeleteSizeChartForm({
  id,
  name,
  variant = "icon",
}: {
  id: string;
  name: string;
  variant?: "icon" | "button";
}) {
  return (
    <ConfirmSubmitForm
      action={deleteSizeChartAction}
      confirm={{
        title: "Eliminar plantilla",
        message: `¿Eliminar la plantilla "${name}"? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        tone: "danger",
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
    </ConfirmSubmitForm>
  );
}
