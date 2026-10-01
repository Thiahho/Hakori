import { toggleCouponAction } from "@/lib/admin/coupons-actions";

export function ToggleCouponForm({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={toggleCouponAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <button
        type="submit"
        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
      >
        {isActive ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}
