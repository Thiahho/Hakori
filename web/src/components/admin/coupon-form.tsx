"use client";

import { useActionState, useState } from "react";
import {
  createCouponAction,
  updateCouponAction,
  type CouponFormState,
} from "@/lib/admin/coupons-actions";
import type { AdminCoupon, CouponDiscountType } from "@/lib/admin/coupons";
import { generateCouponCode, toDateInputValue } from "@/lib/admin/coupon-format";
import { Card, CardHeader } from "./ui/card";
import { Field, inputClass } from "./ui/field";
import { Alert } from "./ui/alert";
import { Button, LinkButton } from "./ui/button";

const initialState: CouponFormState = {};

export function CouponForm({ coupon, saved = false }: { coupon?: AdminCoupon; saved?: boolean }) {
  const action = coupon ? updateCouponAction.bind(null, coupon.id) : createCouponAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [code, setCode] = useState(coupon?.code ?? "");
  const [discountType, setDiscountType] = useState<CouponDiscountType>(coupon?.discountType ?? "Percentage");
  const [unlimited, setUnlimited] = useState(coupon ? coupon.maxUses === null : true);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {saved && !state.error && <Alert tone="success">Guardado.</Alert>}

      <Card>
        <CardHeader title="Código y descuento" description="Lo que el cliente escribe en el carrito y cuánto le descuenta." />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field
            label="Código"
            htmlFor="code"
            hint={coupon ? undefined : "Dejalo vacío para generar uno aleatorio al guardar."}
          >
            <div className="flex gap-2">
              <input
                id="code"
                name="code"
                required={Boolean(coupon)}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                placeholder="VERANO20"
                className={`${inputClass} font-mono uppercase`}
              />
              <Button type="button" onClick={() => setCode(generateCouponCode())}>
                Generar
              </Button>
            </div>
          </Field>

          <Field label="Tipo de descuento">
            <div className="flex gap-4 pt-2 text-sm text-neutral-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discountType"
                  value="Percentage"
                  checked={discountType === "Percentage"}
                  onChange={() => setDiscountType("Percentage")}
                  className="h-4 w-4 accent-ink"
                />
                Porcentaje
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discountType"
                  value="FixedAmount"
                  checked={discountType === "FixedAmount"}
                  onChange={() => setDiscountType("FixedAmount")}
                  className="h-4 w-4 accent-ink"
                />
                Monto fijo
              </label>
            </div>
          </Field>

          <Field
            label={discountType === "Percentage" ? "Porcentaje (%)" : "Monto (ARS)"}
            htmlFor="value"
            hint={discountType === "Percentage" ? "Entre 1 y 100." : "Se descuenta del subtotal del carrito."}
          >
            <input
              id="value"
              name="value"
              type="number"
              required
              min={1}
              max={discountType === "Percentage" ? 100 : undefined}
              step="1"
              defaultValue={coupon?.value}
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="Límites" description="Todos son opcionales y se pueden combinar." />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field
            label="Usos máximos"
            htmlFor="maxUses"
            hint={coupon ? `Usado ${coupon.usedCount} ${coupon.usedCount === 1 ? "vez" : "veces"}.` : undefined}
          >
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="unlimited"
                  checked={unlimited}
                  onChange={(e) => setUnlimited(e.target.checked)}
                  className="h-4 w-4 accent-ink"
                />
                Ilimitado
              </label>
              {!unlimited && (
                <input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  required
                  min={1}
                  step="1"
                  defaultValue={coupon?.maxUses ?? undefined}
                  className={inputClass}
                />
              )}
            </div>
          </Field>

          <Field label="Vence el" htmlFor="expiresOn" hint="Válido hasta el final de ese día. Vacío = sin vencimiento.">
            <input
              id="expiresOn"
              name="expiresOn"
              type="date"
              defaultValue={toDateInputValue(coupon?.expiresAt ?? null)}
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="onePerEmail"
              defaultChecked={coupon?.onePerEmail ?? false}
              className="h-4 w-4 accent-ink"
            />
            Un uso por email
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={coupon?.isActive ?? true}
              className="h-4 w-4 accent-ink"
            />
            Cupón activo
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <LinkButton href="/admin/coupons">Cancelar</LinkButton>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Guardando..." : coupon ? "Guardar cambios" : "Crear cupón"}
        </Button>
      </div>
    </form>
  );
}
